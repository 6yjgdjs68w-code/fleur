import React, { useState, useRef } from 'react';
import { CartItem, CheckoutFormState, PlacedOrder, StoreSettings } from '../../types/fleur';
import { 
  createTelegramStarsInvoiceLink, 
  openTelegramInvoice, 
  sendInvoice 
} from '../../services/paymentService';
import { 
  X, Phone, MapPin, Calendar, Clock, MessageSquare, 
  Star, CreditCard, Zap, Check, CheckCircle2, ShieldCheck, 
  Loader2, Gift, EyeOff, Sparkles, Heart, Copy, QrCode, ExternalLink, ArrowRight,
  Upload, Receipt, Camera, Eye
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CheckoutModalProps {
  items: CartItem[];
  rawSubtotal: number;
  discountAmount: number;
  finalTotal: number;
  onClose: () => void;
  onOrderCompleted: (order: PlacedOrder) => void;
  storeSettings?: StoreSettings;
  userStarsBalance?: number;
  onDeductStars?: (stars: number) => void;
}

export function CheckoutModal({
  items,
  rawSubtotal,
  discountAmount,
  finalTotal,
  onClose,
  onOrderCompleted,
  storeSettings,
  userStarsBalance = 0,
  onDeductStars,
}: CheckoutModalProps) {
  const [form, setForm] = useState<CheckoutFormState>(() => {
    let initialName = '';
    let initialTg = '';
    let initialUserId: number | undefined = undefined;

    try {
      const tgUser = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgUser) {
        initialName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
        if (tgUser.username) {
          initialTg = `@${tgUser.username}`;
        }
        initialUserId = tgUser.id;
      }
    } catch {
      // fallback
    }

    return {
      customerName: initialName,
      customerTelegram: initialTg,
      telegramUserId: initialUserId,
      customerPhone: '+7 (999) 123-45-67',
      recipientPhone: '+7 (916) 789-01-23',
      deliveryAddress: 'г. Москва, ул. Арбат, д. 24, кв. 18',
      deliveryDate: 'Сегодня',
      deliveryTimeSlot: '18:00 - 20:00',
      cardMessage: 'С любовью',
      contactRecipient: false,
      sendAsSurprise: true, // Enabled by default for lovely experience
      hideSenderUntilDelivery: true,
      surpriseCardTemplate: 'С любовью',
    };
  });

  const [isProcessingStars, setIsProcessingStars] = useState(false);
  const [isProcessingSbp, setIsProcessingSbp] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);

  // Receipt upload & preview state
  const receiptFileInputRef = useRef<HTMLInputElement>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // SBP Payment Modal State
  const [sbpModalData, setSbpModalData] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);

  // Card Direct Transfer Modal State
  const [cardModalData, setCardModalData] = useState<{
    orderId: string;
    amount: number;
  } | null>(null);

  // Dedicated Receipt Submission Modal State
  const [receiptSubmissionData, setReceiptSubmissionData] = useState<{
    method: 'sbp' | 'card';
    orderId: string;
    amount: number;
  } | null>(null);
  const [receiptSenderNote, setReceiptSenderNote] = useState('');
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  const [completedOrderSuccess, setCompletedOrderSuccess] = useState<PlacedOrder | null>(null);

  // Telegram Stars Invoice Modal State
  const [starsInvoiceModalData, setStarsInvoiceModalData] = useState<{
    link: string;
    stars: number;
    orderId: string;
  } | null>(null);

  // Conversion: 1 Star ≈ 2 RUB (configurable by owner in storeSettings)
  const starsRate = storeSettings?.starsRubRate && storeSettings.starsRubRate > 0 ? storeSettings.starsRubRate : 2.0;
  const starsAmount = Math.max(1, Math.ceil(finalTotal / starsRate));

  const mainBouquetTitle = items.map((i) => i.bouquet.name).join(', ');
  const hasBouquetOfDay = items.some((i) => i.isBouquetOfDay || i.bouquet.id.includes('day'));

  const cardTemplates = [
    { label: 'С любовью', icon: '💖', text: 'С любовью и нежностью от всего сердца! 🌸' },
    { label: 'Просто так', icon: '✨', text: 'Просто так, чтобы на твоем лице сияла улыбка! ✨' },
    { label: 'Ты лучшая', icon: '👑', text: 'Ты самая лучшая и неповторимая на свете! 👑' },
  ];

  const handleSelectTemplate = (template: typeof cardTemplates[0]) => {
    setForm({
      ...form,
      cardMessage: template.text,
      surpriseCardTemplate: template.label,
    });
  };

  const createOrderRecord = (
    paymentMethod: 'stars' | 'sbp' | 'card',
    paymentStatus: 'paid' | 'pending' | 'reviewing',
    existingOrderId?: string,
    receiptImg?: string,
    senderNote?: string
  ): PlacedOrder => {
    return {
      orderId: existingOrderId || `FL-${Math.floor(10000 + Math.random() * 90000)}`,
      items,
      subtotal: rawSubtotal,
      discount: discountAmount,
      finalTotal,
      starsAmount,
      paymentMethod,
      paymentStatus,
      orderStatus: 'accepted', // Initial status: Принят в работу
      form: {
        ...form,
        cardMessage: senderNote ? `${form.cardMessage || ''}${form.cardMessage ? ' • ' : ''}(Заметка к чеку: ${senderNote})` : form.cardMessage,
      },
      createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
      receiptImage: receiptImg,
      receiptUploadedAt: receiptImg
        ? new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
        : undefined,
    };
  };

  // Receipt file upload handler (converts to base64 Data URL for instant preview and Telegram Bot API forwarding)
  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setReceiptImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Submit receipt to boutique owner
  const handleSubmitReceiptAndCompleteOrder = () => {
    if (!receiptSubmissionData) return;
    if (!receiptImage) {
      alert('Пожалуйста, прикрепите фото или скриншот чека об оплате из банковского приложения');
      receiptFileInputRef.current?.click();
      return;
    }

    setIsSubmittingReceipt(true);
    const order = createOrderRecord(
      receiptSubmissionData.method,
      'reviewing',
      receiptSubmissionData.orderId,
      receiptImage,
      receiptSenderNote
    );

    triggerCelebration();
    onOrderCompleted(order);
    setIsSubmittingReceipt(false);
    setReceiptSubmissionData(null);
    setCompletedOrderSuccess(order);
  };

  /**
   * Telegram Stars Payment Integration
   */
  const handlePayWithTelegramStars = async () => {
    setIsProcessingStars(true);
    const orderId = `FL-${Math.floor(10000 + Math.random() * 90000)}`;

    const orderPayload = {
      orderId,
      bouquetName: mainBouquetTitle,
      amountRub: finalTotal,
      starsAmount,
      customerPhone: form.customerPhone,
      recipientPhone: form.recipientPhone,
      deliveryAddress: form.deliveryAddress,
      deliveryDate: form.deliveryDate,
      deliveryTimeSlot: form.deliveryTimeSlot,
      cardMessage: form.cardMessage,
      contactRecipient: form.contactRecipient,
    };

    // 1. Generate Telegram Bot API createInvoiceLink (currency: "XTR")
    const botToken = storeSettings?.telegramBotToken || '8734424737:AAFDLzcFpY_mZgqejyT7j0TFUMiWhBm4mkQ';
    const invoiceLink = await createTelegramStarsInvoiceLink(orderPayload, botToken);

    // 2. Invoke sendInvoice / openInvoice with currency XTR if in Telegram
    const nativeOpened = sendInvoice(invoiceLink, (status) => {
      setIsProcessingStars(false);
      if (status === 'paid') {
        onDeductStars?.(starsAmount);
        const order = createOrderRecord('stars', 'paid', orderId);
        triggerCelebration();
        onOrderCompleted(order);
      }
    });

    // 3. Display user stars account payment dialog
    setIsProcessingStars(false);
    setStarsInvoiceModalData({
      link: invoiceLink,
      stars: starsAmount,
      orderId,
    });
  };

  /**
   * SBP (Система быстрых платежей) Integration
   * Opens high-fidelity SBP Payment Modal with QR code and bank transfer details
   */
  const handlePayWithSBP = () => {
    const orderId = `FL-${Math.floor(10000 + Math.random() * 90000)}`;
    setReceiptImage(null);
    setSbpModalData({
      orderId,
      amount: finalTotal,
    });
  };

  const handlePayWithCard = () => {
    const orderId = `FL-${Math.floor(10000 + Math.random() * 90000)}`;
    setReceiptImage(null);
    setCardModalData({
      orderId,
      amount: finalTotal,
    });
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F4B6C2', '#FAF6F0', '#FFD700', '#FDE8ED'],
      });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white text-[#2D1F18] shadow-2xl flex flex-col animate-in slide-in-from-bottom-8">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-100 px-5 py-3.5 flex items-center justify-between">
          <div>
            <h2 className="font-serif-fleur text-lg font-bold text-[#2D1F18]">
              Оформление доставки Fleur
            </h2>
            <p className="text-[11px] text-stone-500">Укажите контакты получателя и детали сюрприза</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 flex-1 text-xs">
          {/* Customer Identity & Telegram Username for boutique communication */}
          <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-stone-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-[#3E2C23] flex items-center gap-1.5">
                <span className="text-sm">✈️</span>
                <span>Связь с вами в Telegram</span>
              </span>
              <span className="text-[10px] text-stone-500">Для согласования фото букета</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-stone-600 block mb-1">
                  Ваш Telegram (@username) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-400 font-mono text-xs select-none">@</span>
                  <input
                    type="text"
                    value={form.customerTelegram?.replace(/^@/, '') || ''}
                    onChange={(e) => setForm({ ...form, customerTelegram: `@${e.target.value.replace(/^@/, '')}` })}
                    placeholder="username"
                    className="w-full bg-white border border-stone-200 rounded-xl pl-7 pr-3 py-1.5 text-xs text-[#2D1F18] font-mono font-semibold focus:outline-none focus:border-[#F4B6C2]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-stone-600 block mb-1">
                  Ваше имя
                </label>
                <input
                  type="text"
                  value={form.customerName || ''}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="Как к вам обращаться"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                />
              </div>
            </div>
            <p className="text-[10px] text-stone-500 leading-snug">
              🌸 Флорист бутика Fleur свяжется с вами в Telegram и отправит фото собранного букета перед отправкой курьера.
            </p>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-[#3E2C23] block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#C97A8B]" />
                <span>Ваш телефон (заказчик)</span>
              </label>
              <input
                type="tel"
                value={form.customerPhone}
                onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
                placeholder="+7 (999) 000-00-00"
                className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#3E2C23] block mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#C97A8B]" />
                <span>Телефон получателя</span>
              </label>
              <input
                type="tel"
                value={form.recipientPhone}
                onChange={(e) => setForm({ ...form, recipientPhone: e.target.value })}
                placeholder="+7 (999) 000-00-00"
                className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
              />
            </div>
          </div>

          {/* SEND AS A SURPRISE (Отправить сюрпризом) OPTION */}
          <div className="rounded-2xl border-2 border-[#3E2C23] p-4 bg-gradient-to-br from-[#2D1F18] to-[#3E2C23] text-[#FAF6F0] shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F4B6C2]/20 border border-[#F4B6C2]/40 text-[#F4B6C2] flex items-center justify-center font-bold text-sm">
                  🎁
                </div>
                <div>
                  <div className="font-serif-fleur font-bold text-sm text-[#FAF6F0] flex items-center gap-1.5">
                    <span>Отправить сюрпризом</span>
                    <span className="text-[9px] bg-[#F4B6C2] text-[#3E2C23] px-1.5 py-0.2 rounded font-bold uppercase">
                      Тайный отправитель
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-300 mt-0.5">
                    Получатель не узнает, от кого букет, пока цветы не окажутся в его руках
                  </p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={form.sendAsSurprise}
                onChange={(e) => setForm({ ...form, sendAsSurprise: e.target.checked })}
                className="w-5 h-5 rounded text-[#F4B6C2] focus:ring-[#F4B6C2] accent-[#F4B6C2] cursor-pointer"
              />
            </div>

            {/* Surprise Configuration when enabled */}
            {form.sendAsSurprise && (
              <div className="mt-3.5 pt-3 border-t border-white/10 space-y-3">
                {/* Toggle: Hide sender until delivery */}
                <label className="flex items-center justify-between bg-black/25 rounded-xl p-2.5 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-[#F4B6C2]" />
                    <div>
                      <span className="font-semibold text-xs text-white">Скрыть отправителя до доставки</span>
                      <div className="text-[10px] text-stone-400">Курьер сохранит полную тайну при вручении</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.hideSenderUntilDelivery}
                    onChange={(e) => setForm({ ...form, hideSenderUntilDelivery: e.target.checked })}
                    className="rounded text-[#F4B6C2] focus:ring-[#F4B6C2] accent-[#F4B6C2] cursor-pointer"
                  />
                </label>

                {/* Templates for Anonymous Card */}
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-[#F4B6C2] mb-1.5">
                    Готовые послания для открытки:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {cardTemplates.map((tpl) => {
                      const isSelected = form.surpriseCardTemplate === tpl.label;
                      return (
                        <button
                          key={tpl.label}
                          type="button"
                          onClick={() => handleSelectTemplate(tpl)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-[#F4B6C2] text-[#3E2C23] font-bold shadow-sm'
                              : 'bg-white/10 text-stone-300 hover:bg-white/20'
                          }`}
                        >
                          <span>{tpl.icon}</span>
                          <span>{tpl.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Anonymous Elegant Card Preview */}
                <div className="relative rounded-2xl p-3.5 bg-gradient-to-br from-[#1E140F] to-[#2D1F18] border border-[#FFD700]/40 text-[#FAF6F0] shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-[#FFD700] font-mono border-b border-white/10 pb-1.5 mb-2">
                    <span className="flex items-center gap-1 font-serif-fleur">
                      ⚜️ Fleur Anonymous Sealed Letter
                    </span>
                    <span>Открытка №{Math.floor(1000 + Math.random() * 9000)}</span>
                  </div>

                  <div className="text-xs font-serif-fleur italic text-stone-200">
                    "{form.cardMessage || 'С любовью и нежностью от тайного поклонника...'}"
                  </div>

                  <div className="mt-2 text-[10px] text-stone-400 flex items-center justify-between pt-1 border-t border-white/10">
                    <span>От: <strong>Тайный отправитель</strong></span>
                    <span className="text-[#F4B6C2]">Имя откроется после вручения ✨</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Recipient Checkbox */}
          <label className="bg-[#FDE8ED]/50 border border-[#F4B6C2]/40 rounded-2xl p-3 flex items-start gap-2.5 cursor-pointer hover:bg-[#FDE8ED] transition-colors">
            <input
              type="checkbox"
              checked={form.contactRecipient}
              onChange={(e) => setForm({ ...form, contactRecipient: e.target.checked })}
              className="mt-0.5 rounded text-[#C97A8B] focus:ring-[#F4B6C2] accent-[#C97A8B] cursor-pointer"
            />
            <div>
              <span className="font-bold text-[#3E2C23] text-xs">
                Уточнить адрес у получателя (Contact recipient)
              </span>
              <p className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                Мы сами свяжемся с получателем, не раскрывая сюрприза, и согласуем удобное время и место доставки.
              </p>
            </div>
          </label>

          {/* Delivery Address */}
          {!form.contactRecipient && (
            <div>
              <label className="text-[11px] font-bold text-[#3E2C23] block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C97A8B]" />
                <span>Адрес доставки</span>
              </label>
              <input
                type="text"
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                placeholder="Город, улица, дом, подъезд, квартира"
                className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
              />
            </div>
          )}

          {/* DATE & TIME DELIVERY SLOTS (Выбор из доступных слотов в течение 24 часов) */}
          <div className="bg-[#FAF6F0] border border-stone-200 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#3E2C23] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C97A8B]" />
                <span>Дата и время доставки (доступные слоты)</span>
              </span>
              {hasBouquetOfDay && (
                <span className="text-[9px] bg-[#FFD700]/20 text-[#9E6D00] border border-[#FFD700]/50 px-2 py-0.5 rounded-full font-bold">
                  Любой слот 24ч
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1">День</label>
                <select
                  value={form.deliveryDate}
                  onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                >
                  <option value="Сегодня">Сегодня</option>
                  <option value="Завтра">Завтра</option>
                  <option value="Послезавтра">Послезавтра</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1">Слот времени</label>
                <select
                  value={form.deliveryTimeSlot}
                  onChange={(e) => setForm({ ...form, deliveryTimeSlot: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                >
                  <option value="10:00 - 12:00">10:00 — 12:00</option>
                  <option value="12:00 - 14:00">12:00 — 14:00</option>
                  <option value="14:00 - 16:00">14:00 — 16:00</option>
                  <option value="16:00 - 18:00">16:00 — 18:00</option>
                  <option value="18:00 - 20:00">18:00 — 20:00 (Вечерний)</option>
                  <option value="20:00 - 22:00">20:00 — 22:00 (Поздний)</option>
                  <option value="Экспресс (~60 мин)">Экспресс (~60 мин)</option>
                </select>
              </div>
            </div>

            <p className="text-[10px] text-stone-500">
              Вы можете заказать букет прямо сейчас со скидкой, а доставку назначить на любое удобное время в течение 24 часов.
            </p>
          </div>

          {/* Card Message Textarea (if not using surprise template or editing) */}
          <div>
            <label className="text-[11px] font-bold text-[#3E2C23] block mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-[#C97A8B]" />
              <span>Текст открытки (бесплатно к каждому букету)</span>
            </label>
            <textarea
              rows={2}
              value={form.cardMessage}
              onChange={(e) => setForm({ ...form, cardMessage: e.target.value })}
              placeholder="Напишите теплые слова, флорист аккуратно выведет их от руки на открытке Fleur..."
              className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl p-2.5 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
            />
          </div>

          {/* Payment Section (CRITICAL INTEGRATIONS) */}
          <div className="pt-3 border-t border-stone-100 space-y-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-xs text-[#3E2C23] uppercase tracking-wider">
                Способ оплаты
              </span>
              <span className="font-serif-fleur font-bold text-base text-[#3E2C23] whitespace-nowrap shrink-0">
                {finalTotal.toLocaleString('ru-RU')}&nbsp;₽
              </span>
            </div>

            {/* 1. CRITICAL: Telegram Stars Payment Button (sendInvoice with XTR) */}
            <button
              type="button"
              onClick={handlePayWithTelegramStars}
              disabled={isProcessingStars}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold p-3.5 rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center font-bold text-base shrink-0">
                  ⭐
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight whitespace-nowrap flex items-center gap-1.5">
                    <span>Оплатить звёздами Telegram</span>
                    <span className="text-[9px] bg-black/20 text-stone-900 px-1 rounded font-mono">XTR</span>
                  </div>
                  <div className="text-[10px] text-stone-900/90 whitespace-nowrap">
                    Баланс аккаунта: <strong>{userStarsBalance.toLocaleString('ru-RU')} ⭐</strong>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 whitespace-nowrap">
                {isProcessingStars ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  <span className="bg-black/15 px-2.5 py-1 rounded-lg text-xs font-mono font-black whitespace-nowrap">
                    {starsAmount}&nbsp;⭐
                  </span>
                )}
              </div>
            </button>

            {/* 2. CRITICAL: YooKassa SBP Payment Button */}
            <button
              type="button"
              onClick={handlePayWithSBP}
              disabled={isProcessingSbp}
              className="w-full bg-[#3E2C23] hover:bg-[#4E382D] text-white font-bold p-3.5 rounded-2xl shadow-md transition-all active:scale-[0.98] flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight whitespace-nowrap">
                    Оплатить через СБП
                  </div>
                  <div className="text-[10px] text-stone-300 whitespace-nowrap">
                    QR-код и перевод через любой банк (0% комиссии)
                  </div>
                </div>
              </div>

              <div className="text-right font-serif-fleur text-xs font-bold text-[#F4B6C2] shrink-0 whitespace-nowrap">
                {isProcessingSbp ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span className="whitespace-nowrap">{finalTotal.toLocaleString('ru-RU')}&nbsp;₽</span>
                )}
              </div>
            </button>

            {/* 3. Direct Transfer to Bank Card (Для самозанятой) */}
            <button
              type="button"
              onClick={handlePayWithCard}
              className="w-full bg-[#FAF6F0] hover:bg-[#f3ece2] border border-stone-200 text-[#3E2C23] font-bold p-3.5 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-between text-xs cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 rounded-full bg-stone-200 text-[#3E2C23] flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-stone-700" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight whitespace-nowrap">
                    Перевод на банковскую карту
                  </div>
                  <div className="text-[10px] text-stone-500 whitespace-nowrap">
                    {storeSettings?.cardBankName || 'СберБанк, Т-Банк'} (перевод самозанятой)
                  </div>
                </div>
              </div>
              <span className="font-serif-fleur font-bold text-xs text-[#3E2C23] shrink-0 whitespace-nowrap">
                {finalTotal.toLocaleString('ru-RU')}&nbsp;₽
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* SBP Payment Modal (Система Быстрых Платежей) */}
      {sbpModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl text-[#2D1F18] border border-emerald-200 relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  ⚡
                </div>
                <div className="text-left">
                  <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18] leading-tight">
                    Оплата через СБП
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    Шаг 1 из 2: Перевод по реквизитам
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSbpModalData(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount */}
            <div className="bg-[#FAF6F0] rounded-2xl p-3 border border-stone-200/80 mb-3">
              <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                Сумма к переводу
              </div>
              <div className="font-serif-fleur text-2xl font-black text-[#3E2C23]">
                {sbpModalData.amount.toLocaleString('ru-RU')}&nbsp;₽
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Заказ: <strong className="font-mono text-[#3E2C23]">#{sbpModalData.orderId}</strong>
              </div>
            </div>

            {/* Transfer Details with One-Click Copy */}
            <div className="bg-[#FAF6F0] rounded-2xl p-3.5 text-left space-y-2 border border-stone-200 text-xs mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block font-semibold">Номер телефона для СБП:</span>
                  <span className="font-mono font-bold text-sm text-[#3E2C23]">
                    {storeSettings?.sbpPhone || '+7 (999) 123-45-67'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText((storeSettings?.sbpPhone || '+79991234567').replace(/[^0-9+]/g, ''));
                    setCopiedPhone(true);
                    setTimeout(() => setCopiedPhone(false), 2000);
                  }}
                  className="bg-[#3E2C23] hover:bg-[#4E382D] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  {copiedPhone ? <Check className="w-3 h-3 text-[#F4B6C2]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPhone ? 'Скопировано!' : 'Скопировать'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60 text-[11px]">
                <div>
                  <span className="text-stone-400 block">Банк получателя:</span>
                  <span className="font-bold text-[#3E2C23]">
                    {storeSettings?.sbpBankName || 'Т-Банк (Тинькофф)'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">Получатель (самозанятая):</span>
                  <span className="font-bold text-[#3E2C23]">
                    {storeSettings?.sbpRecipientName || 'Анна Сергеевна В.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Note on QR Code for самозанятой */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-2.5 text-[11px] text-emerald-900 text-left mb-3 flex items-start gap-2">
              <span className="text-sm shrink-0">💡</span>
              <span>
                Откройте приложение любого вашего банка, выберите <b>«Перевод через СБП по номеру телефона»</b> и отправьте указанную сумму.
              </span>
            </div>

            {/* Quick Bank App Links */}
            <div className="grid grid-cols-3 gap-1.5 mb-4 text-[10px] font-bold">
              <a
                href="https://www.tbank.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-100 hover:bg-stone-200 text-[#3E2C23] py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>Т-Банк</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
              <a
                href="https://sberbank.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-100 hover:bg-stone-200 text-[#3E2C23] py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>СберБанк</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
              <a
                href="https://sbp.nspk.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-100 hover:bg-stone-200 text-[#3E2C23] py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>СБП Пэй</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </div>

            {/* Move to Step 2: Receipt submission */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setReceiptSubmissionData({
                    method: 'sbp',
                    orderId: sbpModalData.orderId,
                    amount: sbpModalData.amount,
                  });
                  setSbpModalData(null);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Я оплатил(а) через СБП — прикрепить чек</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setSbpModalData(null)}
                className="w-full text-stone-500 hover:text-stone-800 text-xs py-1.5 font-medium cursor-pointer"
              >
                Выбрать другой способ оплаты
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Card Direct Transfer Modal (Для самозанятой) */}
      {cardModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl text-[#2D1F18] border border-rose-200 relative my-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-[#3E2C23] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18] leading-tight">
                    Перевод на карту
                  </h3>
                  <span className="text-[10px] text-rose-700 font-semibold">
                    Шаг 1 из 2: Перевод самозанятой
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCardModalData(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Amount */}
            <div className="bg-[#FAF6F0] rounded-2xl p-3 border border-stone-200/80 mb-3">
              <div className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
                Сумма к переводу
              </div>
              <div className="font-serif-fleur text-2xl font-black text-[#3E2C23]">
                {cardModalData.amount.toLocaleString('ru-RU')}&nbsp;₽
              </div>
              <div className="text-[10px] text-stone-400 mt-0.5">
                Заказ: <strong className="font-mono text-[#3E2C23]">#{cardModalData.orderId}</strong>
              </div>
            </div>

            {/* Card Details with One-Click Copy */}
            <div className="bg-[#FAF6F0] rounded-2xl p-3.5 text-left space-y-2 border border-stone-200 text-xs mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block font-semibold">Номер банковской карты:</span>
                  <span className="font-mono font-black text-sm text-[#3E2C23] tracking-wider">
                    {storeSettings?.cardNumber || '2202 2012 3456 7890'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText((storeSettings?.cardNumber || '2202201234567890').replace(/\s+/g, ''));
                    setCopiedCard(true);
                    setTimeout(() => setCopiedCard(false), 2000);
                  }}
                  className="bg-[#3E2C23] hover:bg-[#4E382D] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer active:scale-95"
                >
                  {copiedCard ? <Check className="w-3 h-3 text-[#F4B6C2]" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCard ? 'Скопировано!' : 'Скопировать'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60 text-[11px]">
                <div>
                  <span className="text-stone-400 block">Банк получателя:</span>
                  <span className="font-bold text-[#3E2C23]">
                    {storeSettings?.cardBankName || 'Т-Банк / СберБанк'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block">Получатель (самозанятая):</span>
                  <span className="font-bold text-[#3E2C23]">
                    {storeSettings?.cardRecipientName || 'Анна Сергеевна В.'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Bank App Links */}
            <div className="grid grid-cols-3 gap-1.5 mb-4 text-[10px] font-bold">
              <a
                href="https://www.tbank.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-100 hover:bg-stone-200 text-[#3E2C23] py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>Т-Банк</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
              <a
                href="https://sberbank.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-100 hover:bg-stone-200 text-[#3E2C23] py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>СберБанк</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
              <a
                href="https://alfabank.ru"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-stone-100 hover:bg-stone-200 text-[#3E2C23] py-1.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>Альфа</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            </div>

            {/* Move to Step 2: Receipt submission */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setReceiptSubmissionData({
                    method: 'card',
                    orderId: cardModalData.orderId,
                    amount: cardModalData.amount,
                  });
                  setCardModalData(null);
                }}
                className="w-full bg-[#3E2C23] hover:bg-[#4E382D] text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Я оплатил(а) перевод на карту — прикрепить чек</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setCardModalData(null)}
                className="w-full text-stone-500 hover:text-stone-800 text-xs py-1.5 font-medium cursor-pointer"
              >
                Выбрать другой способ оплаты
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED RECEIPT SUBMISSION FORM (Шаг 2: Отправка чека об оплате) */}
      {receiptSubmissionData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in zoom-in-95 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-center shadow-2xl text-[#2D1F18] border border-emerald-300 relative my-auto space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-base shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18] leading-tight">
                    Отправка чека об оплате
                  </h3>
                  <span className="text-[10px] text-stone-500">
                    Шаг 2 из 2: Подтверждение заказа
                  </span>
                </div>
              </div>

              <button
                onClick={() => setReceiptSubmissionData(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Order & Amount Recap */}
            <div className="bg-[#FAF6F0] rounded-2xl p-3 border border-stone-200/80 text-left flex items-center justify-between">
              <div>
                <span className="text-[10px] text-stone-400 block font-semibold">Сумма к подтверждению:</span>
                <span className="font-serif-fleur font-black text-xl text-[#3E2C23]">
                  {receiptSubmissionData.amount.toLocaleString('ru-RU')}&nbsp;₽
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">Заказ:</span>
                <span className="font-mono font-bold text-xs text-[#3E2C23]">
                  #{receiptSubmissionData.orderId}
                </span>
                <span className="block text-[9px] text-emerald-700 font-semibold mt-0.5">
                  {receiptSubmissionData.method === 'sbp' ? '⚡ СБП перевод' : '💳 Перевод на карту'}
                </span>
              </div>
            </div>

            {/* Instructions for customer */}
            <p className="text-[11px] text-stone-600 text-left leading-relaxed">
              Прикрепите скриншот чека или квитанции из банковского приложения. Флорист бутика Fleur получит его в Telegram, сверит поступление средств и сразу подтвердит ваш заказ.
            </p>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={receiptFileInputRef}
              accept="image/*"
              onChange={handleReceiptFileChange}
              className="hidden"
            />

            {/* Upload Zone */}
            {receiptImage ? (
              <div className="rounded-2xl border-2 border-emerald-400 bg-emerald-50/40 p-3 flex items-center gap-3 text-left">
                <img
                  src={receiptImage}
                  alt="Чек об оплате"
                  className="w-16 h-16 rounded-xl object-cover bg-white border border-emerald-300 shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-emerald-950 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Чек прикреплен ✓</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">
                    Будет отправлен флористу в Telegram
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      type="button"
                      onClick={() => receiptFileInputRef.current?.click()}
                      className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                    >
                      Заменить
                    </button>
                    <span className="text-stone-300">•</span>
                    <button
                      type="button"
                      onClick={() => setReceiptImage(null)}
                      className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => receiptFileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-[#FAF6F0] hover:bg-emerald-50/30 p-5 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="font-bold text-xs text-[#2D1F18]">
                  Нажмите, чтобы выбрать фото чека
                </div>
                <div className="text-[10px] text-stone-500">
                  Скриншот или фото квитанции из банка (JPG, PNG, WEBP)
                </div>
              </div>
            )}

            {/* Optional Sender Note Input */}
            <div className="text-left space-y-1">
              <label className="text-[10px] font-bold text-stone-600 block">
                Комментарий к переводу (опционально):
              </label>
              <input
                type="text"
                value={receiptSenderNote}
                onChange={(e) => setReceiptSenderNote(e.target.value)}
                placeholder="Например: Перевод с карты Т-Банк на имя Анны"
                className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-xs text-[#2D1F18] focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={isSubmittingReceipt}
                onClick={handleSubmitReceiptAndCompleteOrder}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/30 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingReceipt ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Отправка чека флористу...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Отправить чек флористу и завершить заказ</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (receiptSubmissionData.method === 'sbp') {
                    setSbpModalData({ orderId: receiptSubmissionData.orderId, amount: receiptSubmissionData.amount });
                  } else {
                    setCardModalData({ orderId: receiptSubmissionData.orderId, amount: receiptSubmissionData.amount });
                  }
                  setReceiptSubmissionData(null);
                }}
                className="w-full text-stone-500 hover:text-stone-800 text-xs py-1 font-medium cursor-pointer"
              >
                ← Вернуться к реквизитам оплаты
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL AFTER RECEIPT SUBMISSION */}
      {completedOrderSuccess && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in zoom-in-95">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl text-[#2D1F18] border border-stone-100 relative space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
              🌸
            </div>

            <div>
              <h3 className="font-serif-fleur font-bold text-xl text-[#2D1F18]">
                Чек и заказ успешно приняты!
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Номер заказа: <strong className="font-mono text-[#3E2C23]">#{completedOrderSuccess.orderId}</strong>
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-300/80 rounded-2xl p-3.5 text-left text-xs space-y-1.5">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Статус: Чек на проверке у флориста</span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-snug">
                Флорист бутика Fleur сверяет поступление оплаты по чеку на сумму <b>{completedOrderSuccess.finalTotal.toLocaleString('ru-RU')} ₽</b>. Как только оплата будет подтверждена, статус заказа автоматически изменится на «Оплачено» и букет перейдёт в сборку!
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCompletedOrderSuccess(null);
                onClose();
              }}
              className="w-full bg-[#3E2C23] hover:bg-[#4E382D] text-white font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Перейти к отслеживанию в «Мои заказы»
            </button>
          </div>
        </div>
      )}

      {/* Interactive Modal for Telegram Stars Invoice */}
      {starsInvoiceModalData && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in zoom-in-95">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl text-[#2D1F18] border border-amber-300 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-stone-900 flex items-center justify-center mx-auto mb-3 text-3xl shadow-md">
              ⭐
            </div>
            
            <h3 className="font-serif-fleur font-bold text-xl text-[#2D1F18]">
              Оплата Telegram Stars
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Официальная цифровая валюта Telegram (код <code className="bg-stone-100 px-1 py-0.5 rounded font-mono font-bold text-stone-800">XTR</code>)
            </p>

            <div className="bg-[#FAF6F0] rounded-2xl p-4 my-4 text-xs text-left space-y-2.5 border border-stone-200">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Баланс вашего аккаунта:</span>
                <span className="font-extrabold text-amber-700 font-mono text-sm">
                  {userStarsBalance.toLocaleString('ru-RU')} ⭐
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">К списанию за букет:</span>
                <span className="font-extrabold text-stone-900 text-base font-mono">
                  {starsInvoiceModalData.stars.toLocaleString('ru-RU')} ⭐
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
                <span className="text-stone-500">Остаток после оплаты:</span>
                <span className="font-bold text-emerald-700 font-mono">
                  {Math.max(0, userStarsBalance - starsInvoiceModalData.stars).toLocaleString('ru-RU')} ⭐
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-stone-200/60">
                <span className="text-stone-500">Курс бутика:</span>
                <span className="font-bold text-stone-800">1 ⭐ ≈ {starsRate} ₽</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Номер заказа:</span>
                <span className="font-mono font-bold text-stone-800">
                  #{starsInvoiceModalData.orderId}
                </span>
              </div>
            </div>

            {userStarsBalance >= starsInvoiceModalData.stars ? (
              <div className="space-y-2">
                <div className="text-[11px] text-emerald-700 font-bold bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  ✓ На вашем балансе достаточно звёзд для оплаты
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onDeductStars?.(starsInvoiceModalData.stars);
                    const order = createOrderRecord('stars', 'paid', starsInvoiceModalData.orderId);
                    setStarsInvoiceModalData(null);
                    triggerCelebration();
                    onOrderCompleted(order);
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Списать {starsInvoiceModalData.stars} ⭐ с баланса и оформить заказ</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-left">
                  На вашем балансе {userStarsBalance} ⭐. Вы можете оплатить через официальный инвойс Telegram — Telegram спишет звёзды с вашего аккаунта Telegram:
                </div>
                <button
                  type="button"
                  onClick={() => {
                    openTelegramInvoice(starsInvoiceModalData.link, (status) => {
                      if (status === 'paid') {
                        onDeductStars?.(starsInvoiceModalData.stars);
                        const order = createOrderRecord('stars', 'paid', starsInvoiceModalData.orderId);
                        setStarsInvoiceModalData(null);
                        triggerCelebration();
                        onOrderCompleted(order);
                      }
                    });
                  }}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-bold py-3.5 rounded-2xl text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Оплатить через Telegram Invoice ({starsInvoiceModalData.stars} ⭐)</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setStarsInvoiceModalData(null)}
              className="w-full text-stone-500 hover:text-stone-800 text-xs py-2 font-medium cursor-pointer mt-2"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
