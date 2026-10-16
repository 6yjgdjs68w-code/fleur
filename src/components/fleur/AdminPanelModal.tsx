import React, { useState, useRef } from 'react';
import { Bouquet, BouquetOfDayData, CustomStemOption, BOUQUETS, BOUQUET_OF_THE_DAY } from '../../data/fleurData';
import { PlacedOrder, StoreSettings, OrderStatus } from '../../types/fleur';
import { sendTestTelegramNotification, fetchOwnerChatIdFromTelegram } from '../../services/notificationService';
import { 
  X, Plus, Edit2, Trash2, Check, Sparkles, Tag, 
  Settings, ShoppingBag, Phone, Copy, RotateCcw, 
  Image as ImageIcon, Crown, Star, Eye, ExternalLink,
  ChevronRight, AlertCircle, ArrowUpRight, Lock, Shield, 
  ChevronLeft, ArrowLeft, ArrowRight, EyeOff, KeyRound,
  Upload, Send, MessageCircle, Bot, Bell, Loader2, Zap, QrCode,
  CreditCard, Receipt, RefreshCw, LogOut
} from 'lucide-react';

export type { StoreSettings };

export interface PromoCodeItem {
  code: string;
  discountPercent: number;
  description: string;
}

export type AdminTabType = 'catalog' | 'day' | 'promos' | 'contacts' | 'orders' | 'export';

interface AdminPanelModalProps {
  bouquets: Bouquet[];
  onUpdateBouquets: (bouquets: Bouquet[]) => void;
  bouquetOfDay: BouquetOfDayData;
  onUpdateBouquetOfDay: (b: BouquetOfDayData) => void;
  promoCodes: PromoCodeItem[];
  onUpdatePromoCodes: (codes: PromoCodeItem[]) => void;
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (settings: StoreSettings) => void;
  orders: PlacedOrder[];
  onUpdateOrders?: (orders: PlacedOrder[]) => void;
  onClose: () => void;
  isGearIconVisible?: boolean;
  onToggleGearIcon?: (visible: boolean) => void;
  adminPin?: string;
  onUpdateAdminPin?: (pin: string) => void;
  onSwitchToClientRole?: () => void;
}

const PRESET_PHOTO_PREVIEWS = [
  { name: 'Розовые розы', url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&auto=format&fit=crop&q=85' },
  { name: 'Французские пионы', url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=900&auto=format&fit=crop&q=85' },
  { name: 'Махровые тюльпаны', url: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=900&auto=format&fit=crop&q=85' },
  { name: 'Голубая гортензия', url: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=900&auto=format&fit=crop&q=85' },
  { name: 'Кремовые розы', url: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=900&auto=format&fit=crop&q=85' },
  { name: 'Королевский микс', url: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?w=900&auto=format&fit=crop&q=85' },
  { name: 'Пионы Coral Sunset', url: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=900&auto=format&fit=crop&q=85' },
];

export function AdminPanelModal({
  bouquets,
  onUpdateBouquets,
  bouquetOfDay,
  onUpdateBouquetOfDay,
  promoCodes,
  onUpdatePromoCodes,
  storeSettings,
  onUpdateStoreSettings,
  orders,
  onUpdateOrders,
  onClose,
  isGearIconVisible = true,
  onToggleGearIcon,
  adminPin = '1234',
  onUpdateAdminPin,
  onSwitchToClientRole,
}: AdminPanelModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTabType>('catalog');
  
  // Bouquet editing/creating modal state
  const [editingBouquet, setEditingBouquet] = useState<Bouquet | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New PIN input state
  const [newPinInput, setNewPinInput] = useState(adminPin);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 2500);
  };

  // Bouquet form state
  const [bouquetForm, setBouquetForm] = useState<Partial<Bouquet>>({
    id: '',
    name: '',
    category: 'roses',
    basePrice: 3500,
    image: '',
    description: '',
    flowerComposition: '',
    dimensions: 'Высота: 45 см • Диаметр: 32 см',
    rating: 4.95,
    reviewsCount: 50,
    isBestseller: false,
    isSecretVip: false,
  });

  // Bouquet of Day form
  const [dayForm, setDayForm] = useState<BouquetOfDayData>({ ...bouquetOfDay });

  // Store settings form
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...storeSettings });

  // Dynamic custom stems for the bouquet currently being edited
  const [editingStems, setEditingStems] = useState<CustomStemOption[]>([]);
  const [newStemCountInput, setNewStemCountInput] = useState<number>(15);
  const [newStemLabelInput, setNewStemLabelInput] = useState<string>('Праздничный');
  const [newStemPriceInput, setNewStemPriceInput] = useState<number>(4900);

  // File upload refs
  const bouquetFileInputRef = useRef<HTMLInputElement>(null);
  const dayFileInputRef = useRef<HTMLInputElement>(null);
  const sbpQrFileInputRef = useRef<HTMLInputElement>(null);

  // Order status update handler
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const updated = orders.map((o) => (o.orderId === orderId ? { ...o, orderStatus: newStatus } : o));
    if (onUpdateOrders) {
      onUpdateOrders(updated);
    }
    localStorage.setItem('fleur_orders_history_v1', JSON.stringify(updated));
    showToast(`Статус заказа #${orderId} изменен на «${
      newStatus === 'accepted' ? 'Принят' :
      newStatus === 'assembling' ? 'Собирается' :
      newStatus === 'waiting_delivery' ? 'Ожидает доставки' :
      newStatus === 'delivered' ? 'Доставлен' : 'Отменен'
    }»`);
  };

  // Receipt viewing modal state
  const [viewingReceiptOrder, setViewingReceiptOrder] = useState<PlacedOrder | null>(null);

  // Payment confirmation / rejection by owner
  const handleVerifyPayment = (orderId: string, confirmed: boolean) => {
    const updated = orders.map((o) => {
      if (o.orderId === orderId) {
        return {
          ...o,
          paymentStatus: confirmed ? ('paid' as const) : ('pending' as const),
          paymentConfirmedAt: confirmed
            ? new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
            : undefined,
          orderStatus: confirmed && o.orderStatus === 'accepted' ? ('assembling' as const) : o.orderStatus,
        };
      }
      return o;
    });

    if (onUpdateOrders) {
      onUpdateOrders(updated);
    }
    localStorage.setItem('fleur_orders_history_v1', JSON.stringify(updated));
    showToast(
      confirmed
        ? `Оплата по заказу #${orderId} подтверждена! Клиент видит статус «Оплачено».`
        : `Статус заказа #${orderId} изменен на «Ожидает повторной оплаты».`
    );
  };

  // SBP QR file upload handler
  const handleSbpQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSettingsForm((prev) => ({ ...prev, sbpQrCodeUrl: dataUrl }));
      showToast('QR-код СБП успешно загружен!');
    };
    reader.readAsDataURL(file);
  };

  // Telegram test notification state
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isDetectingChatId, setIsDetectingChatId] = useState(false);

  // Image file upload & canvas compression
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'bouquet' | 'day'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          if (target === 'bouquet') {
            setBouquetForm((prev) => ({ ...prev, image: compressedDataUrl }));
          } else {
            setDayForm((prev) => ({ ...prev, image: compressedDataUrl }));
          }
          showToast('Фото успешно загружено с устройства!');
        } else {
          if (target === 'bouquet') {
            setBouquetForm((prev) => ({ ...prev, image: rawDataUrl }));
          } else {
            setDayForm((prev) => ({ ...prev, image: rawDataUrl }));
          }
          showToast('Фото загружено!');
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleAddCustomStem = () => {
    if (newStemCountInput <= 0) {
      alert('Количество цветов должно быть больше 0');
      return;
    }
    if (newStemPriceInput <= 0) {
      alert('Укажите корректную цену');
      return;
    }
    if (editingStems.some((s) => s.count === newStemCountInput)) {
      setEditingStems((prev) =>
        prev.map((s) =>
          s.count === newStemCountInput
            ? { ...s, label: newStemLabelInput.trim() || `${s.count} цветов`, price: newStemPriceInput }
            : s
        )
      );
      showToast(`Вариант ${newStemCountInput} цветов обновлен!`);
    } else {
      const updated = [
        ...editingStems,
        {
          count: newStemCountInput,
          label: newStemLabelInput.trim() || `${newStemCountInput} цветов`,
          price: newStemPriceInput,
        },
      ].sort((a, b) => a.count - b.count);
      setEditingStems(updated);
      showToast(`Добавлен вариант ${newStemCountInput} цветов (${newStemPriceInput} ₽)!`);
    }
  };

  const handleRemoveStemOption = (count: number) => {
    if (editingStems.length <= 1) {
      alert('Букет должен содержать хотя бы один вариант количества');
      return;
    }
    setEditingStems((prev) => prev.filter((s) => s.count !== count));
  };

  const handleUpdateStemPrice = (count: number, price: number) => {
    setEditingStems((prev) =>
      prev.map((s) => (s.count === count ? { ...s, price } : s))
    );
  };

  const handleUpdateStemLabel = (count: number, label: string) => {
    setEditingStems((prev) =>
      prev.map((s) => (s.count === count ? { ...s, label } : s))
    );
  };

  const handleTestTelegramNotification = async () => {
    if (!settingsForm.telegramBotToken || !settingsForm.telegramOwnerChatId) {
      alert('Пожалуйста, сначала введите Bot Token и Chat ID владельца в настройках ниже.');
      return;
    }
    setIsTestingTelegram(true);
    setTelegramTestStatus(null);
    try {
      const result = await sendTestTelegramNotification(
        settingsForm.telegramBotToken,
        settingsForm.telegramOwnerChatId
      );
      setTelegramTestStatus(result);
      if (result.success) {
        showToast('Тест в Telegram успешно доставлен!');
      }
    } catch (err: any) {
      setTelegramTestStatus({
        success: false,
        message: err?.message || 'Ошибка отправки',
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  // New promo code inputs
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoPercent, setNewPromoPercent] = useState<number>(15);
  const [newPromoDesc, setNewPromoDesc] = useState('');

  const handleStartEditBouquet = (b: Bouquet) => {
    setBouquetForm({ ...b });
    if (b.customStems && b.customStems.length > 0) {
      setEditingStems([...b.customStems]);
    } else if (b.stemPrices && Object.keys(b.stemPrices).length > 0) {
      const stems: CustomStemOption[] = Object.keys(b.stemPrices)
        .map(Number)
        .filter((c) => !isNaN(c) && (b.stemPrices![c] ?? 0) > 0)
        .sort((x, y) => x - y)
        .map((count) => ({
          count,
          label: count === 5 ? 'Мини' : count === 7 ? 'Классик' : count === 11 ? 'Пышный' : `${count} цветов`,
          price: b.stemPrices![count]!,
        }));
      setEditingStems(stems);
    } else {
      const cleanPrice = Number(b.basePrice) || 3500;
      setEditingStems([
        { count: 5, label: 'Мини', price: cleanPrice },
        { count: 7, label: 'Классик', price: Math.round(cleanPrice * 1.35) },
        { count: 11, label: 'Пышный', price: Math.round(cleanPrice * 1.9) },
      ]);
    }
    setEditingBouquet(b);
    setIsCreatingNew(false);
  };

  const handleStartCreateBouquet = () => {
    const newId = `fl-custom-${Date.now().toString().slice(-4)}`;
    setBouquetForm({
      id: newId,
      name: 'Новый авторский букет',
      category: 'roses',
      basePrice: 3200,
      image: PRESET_PHOTO_PREVIEWS[0].url,
      description: 'Изысканный свежий букет ручной сборки от флористов Fleur.',
      flowerComposition: 'Свежие розы, зелень эвкалипта, лента',
      dimensions: 'Высота: 45 см • Диаметр: 30 см',
      rating: 5.0,
      reviewsCount: 1,
      isBestseller: false,
      isSecretVip: false,
    });
    setEditingStems([
      { count: 5, label: 'Мини', price: 3200 },
      { count: 7, label: 'Классик', price: 4300 },
      { count: 11, label: 'Пышный', price: 6100 },
    ]);
    setEditingBouquet(null);
    setIsCreatingNew(true);
  };

  const handleSaveBouquet = () => {
    if (!bouquetForm.name?.trim()) {
      alert('Пожалуйста, введите название букета');
      return;
    }
    const cleanPrice = editingStems[0]?.price || Number(bouquetForm.basePrice) || 1000;
    const finalBouquet: Bouquet = {
      id: bouquetForm.id || `fl-${Date.now()}`,
      name: bouquetForm.name.trim(),
      category: (bouquetForm.category as any) || 'mix',
      basePrice: cleanPrice,
      customStems: editingStems.length > 0 ? editingStems : undefined,
      stemPrices: editingStems.reduce((acc, curr) => {
        acc[curr.count] = curr.price;
        return acc;
      }, {} as Record<number, number>),
      image: bouquetForm.image?.trim() || PRESET_PHOTO_PREVIEWS[0].url,
      description: bouquetForm.description?.trim() || 'Свежий авторский букет от бутика Fleur.',
      flowerComposition: bouquetForm.flowerComposition?.trim() || 'Отборные цветы, свежая зелень',
      dimensions: bouquetForm.dimensions || 'Высота: 45 см • Диаметр: 30 см',
      rating: Number(bouquetForm.rating) || 5.0,
      reviewsCount: Number(bouquetForm.reviewsCount) || 10,
      isBestseller: Boolean(bouquetForm.isBestseller),
      isSecretVip: Boolean(bouquetForm.isSecretVip),
    };

    if (isCreatingNew) {
      onUpdateBouquets([finalBouquet, ...bouquets]);
      showToast('Новый букет добавлен в каталог!');
    } else {
      onUpdateBouquets(bouquets.map((b) => (b.id === finalBouquet.id ? finalBouquet : b)));
      showToast('Изменения букета сохранены!');
    }

    setEditingBouquet(null);
    setIsCreatingNew(false);
  };

  const handleDeleteBouquet = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот букет из каталога?')) {
      onUpdateBouquets(bouquets.filter((b) => b.id !== id));
      showToast('Букет удалён из каталога');
    }
  };

  const handleSaveBouquetOfDay = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBouquetOfDay({ ...dayForm });
    showToast('Настройки Букета Дня обновлены!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings({ ...settingsForm });
    showToast('Контакты бутика успешно сохранены!');
  };

  const handleSavePin = () => {
    if (newPinInput.length >= 4 && onUpdateAdminPin) {
      onUpdateAdminPin(newPinInput);
      showToast(`Новый PIN-код (${newPinInput}) установлен!`);
    } else {
      alert('PIN-код должен содержать минимум 4 символа');
    }
  };

  const handleAddPromoCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    const cleanCode = newPromoCode.trim().toUpperCase();
    if (promoCodes.some((p) => p.code === cleanCode)) {
      alert('Такой промокод уже существует!');
      return;
    }
    const newPromo: PromoCodeItem = {
      code: cleanCode,
      discountPercent: Number(newPromoPercent) || 10,
      description: newPromoDesc.trim() || `Скидка ${newPromoPercent}% на заказ`,
    };
    onUpdatePromoCodes([newPromo, ...promoCodes]);
    setNewPromoCode('');
    setNewPromoDesc('');
    showToast(`Промокод ${cleanCode} добавлен!`);
  };

  const handleDeletePromo = (code: string) => {
    onUpdatePromoCodes(promoCodes.filter((p) => p.code !== code));
    showToast(`Промокод ${code} удалён`);
  };

  const handleResetToDefault = () => {
    if (confirm('Сбросить все букеты и цены к заводским настройкам? Все изменения будут удалены.')) {
      localStorage.removeItem('fleur_bouquets_v1');
      localStorage.removeItem('fleur_bouquet_of_day_v1');
      localStorage.removeItem('fleur_promo_codes_v1');
      localStorage.removeItem('fleur_store_settings_v1');
      onUpdateBouquets(BOUQUETS);
      onUpdateBouquetOfDay(BOUQUET_OF_THE_DAY);
      showToast('Данные сброшены к исходным');
    }
  };

  const generateTypeScriptCode = () => {
    return `// Актуальные данные каталога Fleur
export const BOUQUETS: Bouquet[] = ${JSON.stringify(bouquets, null, 2)};

export const BOUQUET_OF_THE_DAY: BouquetOfDayData = ${JSON.stringify(bouquetOfDay, null, 2)};
`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateTypeScriptCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
    showToast('Код каталога скопирован в буфер обмена!');
  };

  const tabsList: { id: AdminTabType; title: string; subtitle: string; icon: string; count?: number }[] = [
    { id: 'catalog', title: '1. Букеты & Цены', subtitle: 'Ассортимент, фото, размеры', icon: '🌸', count: bouquets.length },
    { id: 'day', title: '2. Спец. предложение', subtitle: 'Букет Дня со скидкой', icon: '🌟' },
    { id: 'promos', title: '3. Промокоды', subtitle: 'Скидочные купоны', icon: '🎟', count: promoCodes.length },
    { id: 'contacts', title: '4. Контакты & Бот', subtitle: 'Уведомления в Telegram, PIN', icon: '🤖' },
    { id: 'orders', title: '5. Заказы клиентов', subtitle: 'Юзернеймы, адреса, связь', icon: '📦', count: orders.length },
    { id: 'export', title: '6. Код & Экспорт', subtitle: 'Синхронизация для разработчика', icon: '💾' },
  ];

  const currentTabIndex = tabsList.findIndex((t) => t.id === activeTab);

  const goToNextTab = () => {
    const nextIdx = (currentTabIndex + 1) % tabsList.length;
    setActiveTab(tabsList[nextIdx].id);
  };

  const goToPrevTab = () => {
    const prevIdx = (currentTabIndex - 1 + tabsList.length) % tabsList.length;
    setActiveTab(tabsList[prevIdx].id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4">
      <div className="relative w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FAF6F0] text-[#2D1F18] shadow-2xl flex flex-col animate-in slide-in-from-bottom-8">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3E2C23] text-[#FFD700] flex items-center justify-center text-sm font-bold shadow-sm">
              ⚙️
            </div>
            <div>
              <h2 className="font-serif-fleur text-lg font-bold text-[#2D1F18] leading-tight flex items-center gap-1.5">
                <span>Панель управления бутика Fleur</span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </h2>
              <p className="text-[11px] text-stone-500">
                Все 6 разделов управления бутиком без программирования
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSwitchToClientRole && (
              <button
                onClick={() => {
                  onSwitchToClientRole();
                  onClose();
                }}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-stone-200/80"
                title="Сменить роль на Клиент (сохранится в Telegram CloudStorage)"
              >
                <LogOut className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">В режим клиента</span>
                <span className="sm:hidden text-[10px]">Клиент</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {successToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successToast}</span>
            </div>
            <span className="text-[10px] opacity-80">Сохранено в памяти</span>
          </div>
        )}

        {/* PROMINENT ALL-6-TABS GRID SELECTOR (Always visible, impossible to miss) */}
        <div className="bg-[#FAF0E6] p-3 border-b border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#3E2C23] flex items-center gap-1">
              <span>🗂 Выберите раздел (всего 6):</span>
            </span>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={goToPrevTab}
                className="px-2 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-bold flex items-center gap-0.5 shadow-xs cursor-pointer active:scale-95"
                title="Предыдущая вкладка"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[10px]">Назад</span>
              </button>
              <span className="text-[11px] font-bold text-stone-500 px-1">
                {currentTabIndex + 1} / 6
              </span>
              <button
                onClick={goToNextTab}
                className="px-2 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 font-bold flex items-center gap-0.5 shadow-xs cursor-pointer active:scale-95"
                title="Следующая вкладка"
              >
                <span className="text-[10px]">Вперёд</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 6 Tabs Grid - 2 columns on mobile, 3 columns on tablet/desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {tabsList.map((tab, idx) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-left p-2 rounded-xl transition-all border flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'bg-[#3E2C23] text-white border-[#3E2C23] shadow-md ring-2 ring-[#FFD700]/50'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-[#F4B6C2] hover:bg-stone-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-base">{tab.icon}</span>
                    {typeof tab.count === 'number' && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-[#FFD700] text-[#3E2C23]'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <div className="text-xs font-bold leading-tight truncate">
                      {tab.title}
                    </div>
                    <div
                      className={`text-[9px] truncate mt-0.5 ${
                        isActive ? 'text-[#F4B6C2]' : 'text-stone-400'
                      }`}
                    >
                      {tab.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Header Notice */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between text-xs text-stone-500">
          <span className="font-semibold flex items-center gap-1 text-[#3E2C23]">
            <span>Текущий раздел:</span>
            <strong className="text-emerald-800">{tabsList[currentTabIndex].title}</strong>
          </span>
          <button
            onClick={goToNextTab}
            className="text-[11px] text-[#C97A8B] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
          >
            <span>Следующий раздел</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 flex-1 space-y-4">
          
          {/* TAB 1: CATALOG MANAGEMENT */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
                <div>
                  <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18]">
                    Каталог букетов ({bouquets.length} шт.)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Нажмите на букет для смены цены, названия, состава или фото
                  </p>
                </div>

                <button
                  onClick={handleStartCreateBouquet}
                  className="bg-[#3E2C23] hover:bg-[#4E382D] text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4 text-[#F4B6C2]" />
                  <span>+ Добавить новый букет</span>
                </button>
              </div>

              {/* Bouquet Edit / Create Form */}
              {(editingBouquet || isCreatingNew) && (
                <div className="bg-white rounded-3xl p-5 border-2 border-[#F4B6C2] shadow-xl space-y-3.5 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                    <h4 className="font-serif-fleur font-bold text-base text-[#2D1F18] flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-[#C97A8B]" />
                      <span>{isCreatingNew ? 'Создание нового букета' : `Редактирование: ${bouquetForm.name}`}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBouquet(null);
                        setIsCreatingNew(false);
                      }}
                      className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-[#3E2C23] block mb-1">Название букета *</label>
                      <input
                        type="text"
                        value={bouquetForm.name || ''}
                        onChange={(e) => setBouquetForm({ ...bouquetForm, name: e.target.value })}
                        placeholder="Например: Розовый рассвет"
                        className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-[#3E2C23] block mb-1">Базовая цена (₽) *</label>
                      <input
                        type="number"
                        value={bouquetForm.basePrice || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setBouquetForm({ 
                            ...bouquetForm, 
                            basePrice: val,
                            stemPrices: {
                              5: val,
                              7: bouquetForm.stemPrices?.[7] || Math.round(val * 1.35),
                              11: bouquetForm.stemPrices?.[11] || Math.round(val * 1.9),
                            }
                          });
                        }}
                        placeholder="3500"
                        className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] font-bold focus:outline-none focus:border-[#F4B6C2]"
                      />
                    </div>

                    {/* Dynamic Stem Quantities and Custom Prices Builder */}
                    <div className="col-span-1 sm:col-span-2 bg-[#FAF6F0] rounded-2xl p-4 border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-[#3E2C23] block">
                            Количество цветов в букете и их индивидуальные цены
                          </label>
                          <p className="text-[10px] text-stone-500 mt-0.5">
                            Вы можете добавить любые размеры (например 15, 25, 51, 101 цветов) и указать свою цену в рублях
                          </p>
                        </div>
                        <span className="text-[10px] bg-[#F4B6C2] text-[#3E2C23] font-bold px-2 py-0.5 rounded-full">
                          {editingStems.length} вар.
                        </span>
                      </div>

                      {/* Current stems list */}
                      <div className="space-y-2">
                        {editingStems.map((stem) => (
                          <div
                            key={stem.count}
                            className="bg-white p-2.5 rounded-xl border border-stone-200 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 text-xs shadow-2xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-lg bg-[#3E2C23] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {stem.count}
                              </span>
                              <div>
                                <span className="font-bold text-[#2D1F18] block">{stem.count} цветов</span>
                                <input
                                  type="text"
                                  value={stem.label}
                                  onChange={(e) => handleUpdateStemLabel(stem.count, e.target.value)}
                                  placeholder="Подпись (Мини, Гранд...)"
                                  className="text-[10px] text-stone-600 bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 w-24 focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                              <div className="flex items-center gap-1">
                                <span className="text-[11px] text-stone-400">Цена:</span>
                                <input
                                  type="number"
                                  value={stem.price}
                                  onChange={(e) => handleUpdateStemPrice(stem.count, Number(e.target.value) || 0)}
                                  className="w-20 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-[#3E2C23] text-right focus:outline-none focus:border-[#F4B6C2]"
                                />
                                <span className="text-xs font-bold text-stone-600">₽</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveStemOption(stem.count)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Удалить этот вариант"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add new stem option form */}
                      <div className="bg-white/80 p-3 rounded-xl border border-dashed border-stone-300 space-y-2">
                        <span className="text-[11px] font-bold text-[#3E2C23] block">
                          + Добавить свой вариант количества цветов:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] text-stone-500 font-semibold block mb-0.5">Кол-во стеблей</label>
                            <input
                              type="number"
                              value={newStemCountInput}
                              onChange={(e) => setNewStemCountInput(Number(e.target.value) || 1)}
                              placeholder="15"
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-stone-500 font-semibold block mb-0.5">Подпись размера</label>
                            <input
                              type="text"
                              value={newStemLabelInput}
                              onChange={(e) => setNewStemLabelInput(e.target.value)}
                              placeholder="Праздничный"
                              className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] text-stone-500 font-semibold block mb-0.5">Цена в рублях (₽)</label>
                            <div className="flex gap-1.5">
                              <input
                                type="number"
                                value={newStemPriceInput}
                                onChange={(e) => setNewStemPriceInput(Number(e.target.value) || 0)}
                                placeholder="4900"
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs font-bold text-[#3E2C23]"
                              />
                              <button
                                type="button"
                                onClick={handleAddCustomStem}
                                className="bg-[#3E2C23] hover:bg-[#4E382D] text-white text-[11px] font-bold px-3 py-1 rounded-lg shrink-0 cursor-pointer active:scale-95"
                              >
                                Добавить
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Quick preset chips */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                          <span className="text-stone-400">Быстро добавить:</span>
                          {[
                            { count: 15, label: 'Праздничный', price: Math.round((Number(bouquetForm.basePrice) || 3500) * 2.3) },
                            { count: 25, label: 'Роскошный', price: Math.round((Number(bouquetForm.basePrice) || 3500) * 3.6) },
                            { count: 51, label: 'Королевский', price: Math.round((Number(bouquetForm.basePrice) || 3500) * 6.8) },
                            { count: 101, label: 'Премиум Гранд', price: Math.round((Number(bouquetForm.basePrice) || 3500) * 12.5) },
                          ].map((preset) => (
                            <button
                              key={preset.count}
                              type="button"
                              onClick={() => {
                                setNewStemCountInput(preset.count);
                                setNewStemLabelInput(preset.label);
                                setNewStemPriceInput(preset.price);
                              }}
                              className="px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium cursor-pointer"
                            >
                              +{preset.count} шт.
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#3E2C23] block mb-1">Категория</label>
                      <select
                        value={bouquetForm.category || 'roses'}
                        onChange={(e) => setBouquetForm({ ...bouquetForm, category: e.target.value as any })}
                        className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                      >
                        <option value="roses">Розы (Roses)</option>
                        <option value="peonies">Пионы (Peonies)</option>
                        <option value="hydrangeas">Гортензии (Hydrangeas)</option>
                        <option value="mix">Авторские миксы</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-[#3E2C23] block mb-1">Размеры (высота / диаметр)</label>
                      <input
                        type="text"
                        value={bouquetForm.dimensions || ''}
                        onChange={(e) => setBouquetForm({ ...bouquetForm, dimensions: e.target.value })}
                        placeholder="Высота: 45 см • Диаметр: 32 см"
                        className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-[#3E2C23] block mb-1 text-xs">Состав цветов (бутоны)</label>
                    <input
                      type="text"
                      value={bouquetForm.flowerComposition || ''}
                      onChange={(e) => setBouquetForm({ ...bouquetForm, flowerComposition: e.target.value })}
                      placeholder="Французские розы сорта Kahala, эвкалипт цинерия, матовая лента"
                      className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3E2C23] block mb-1 text-xs">Описание букета</label>
                    <textarea
                      rows={2}
                      value={bouquetForm.description || ''}
                      onChange={(e) => setBouquetForm({ ...bouquetForm, description: e.target.value })}
                      placeholder="Подробное элегантное описание настроения и аромата цветов"
                      className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl p-2.5 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                    />
                  </div>

                  {/* Photo upload from file or URL */}
                  <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-[#3E2C23] block text-xs">
                        Фотография букета
                      </label>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        Файл с телефона / ссылка / пресеты
                      </span>
                    </div>

                    {/* Method 1: Local File Upload (Camera / Gallery) */}
                    <div>
                      <input
                        type="file"
                        ref={bouquetFileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, 'bouquet')}
                      />
                      <button
                        type="button"
                        onClick={() => bouquetFileInputRef.current?.click()}
                        className="w-full bg-white hover:bg-stone-50 border-2 border-dashed border-[#C97A8B] text-[#3E2C23] p-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] shadow-2xs"
                      >
                        <Upload className="w-4 h-4 text-[#C97A8B]" />
                        <span className="text-xs font-bold">
                          📁 Загрузить фото с устройства (галерея или камера)
                        </span>
                      </button>
                    </div>

                    {/* Preview if image is loaded */}
                    {bouquetForm.image && (
                      <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-stone-200">
                        <img
                          src={bouquetForm.image}
                          alt="preview"
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <span className="font-bold text-emerald-800 block truncate">
                            {bouquetForm.image.startsWith('data:') ? '✅ Фото загружено из файла' : '🔗 Фото по ссылке'}
                          </span>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {bouquetForm.image.startsWith('data:') ? 'Оптимизировано для каталога' : bouquetForm.image}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBouquetForm({ ...bouquetForm, image: '' })}
                          className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors"
                          title="Очистить фото"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Method 2: Image URL input */}
                    <div>
                      <label className="text-[10px] font-bold text-stone-500 block mb-1">
                        Или укажите прямую ссылку на фото (URL):
                      </label>
                      <input
                        type="url"
                        value={bouquetForm.image || ''}
                        onChange={(e) => setBouquetForm({ ...bouquetForm, image: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                      />
                    </div>

                    {/* Method 3: Preset photos */}
                    <div>
                      <div className="text-[10px] text-stone-500 mb-1">
                        Или выберите готовую флористическую фотографию:
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                        {PRESET_PHOTO_PREVIEWS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setBouquetForm({ ...bouquetForm, image: preset.url })}
                            className={`shrink-0 flex items-center gap-1.5 p-1 rounded-xl border text-[11px] transition-all cursor-pointer ${
                              bouquetForm.image === preset.url
                                ? 'border-[#3E2C23] bg-stone-100 font-bold'
                                : 'border-stone-200 bg-white hover:border-stone-400'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-6 h-6 rounded-lg object-cover"
                            />
                            <span className="pr-1">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Checkbox badges */}
                  <div className="flex flex-wrap gap-4 pt-1 text-xs font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(bouquetForm.isBestseller)}
                        onChange={(e) => setBouquetForm({ ...bouquetForm, isBestseller: e.target.checked })}
                        className="rounded text-[#3E2C23] focus:ring-[#3E2C23] accent-[#3E2C23]"
                      />
                      <span>Показывать в «Хитах» на главной</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(bouquetForm.isSecretVip)}
                        onChange={(e) => setBouquetForm({ ...bouquetForm, isSecretVip: e.target.checked })}
                        className="rounded text-[#FFD700] focus:ring-[#FFD700] accent-[#FFD700]"
                      />
                      <span className="flex items-center gap-1">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>Скрытый VIP-букет (Founder's Circle)</span>
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBouquet(null);
                        setIsCreatingNew(false);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                    >
                      Отмена
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveBouquet}
                      className="bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold text-xs px-5 py-2 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      Сохранить букет
                    </button>
                  </div>
                </div>
              )}

              {/* Bouquets List */}
              <div className="space-y-2.5">
                {bouquets.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-3 border border-stone-200 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-shadow"
                  >
                    <img
                      src={b.image}
                      alt={b.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-100 border border-stone-100"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-serif-fleur font-bold text-sm text-[#2D1F18] truncate">
                          {b.name}
                        </h4>
                        {b.isBestseller && (
                          <span className="text-[9px] bg-[#F4B6C2] text-[#3E2C23] px-1.5 py-0.2 rounded font-bold uppercase shrink-0">
                            Хит
                          </span>
                        )}
                        {b.isSecretVip && (
                          <span className="text-[9px] bg-[#FFD700] text-stone-950 px-1.5 py-0.2 rounded font-black uppercase shrink-0">
                            VIP
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-500 truncate mt-0.5">
                        {b.flowerComposition}
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="font-extrabold text-[#3E2C23] whitespace-nowrap">
                          {b.basePrice.toLocaleString('ru-RU')}&nbsp;₽
                        </span>
                        <span className="text-stone-400">•</span>
                        <span className="text-stone-500 capitalize">{b.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEditBouquet(b)}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-[#FDE8ED] hover:text-[#C97A8B] text-stone-600 transition-colors cursor-pointer"
                        title="Редактировать букет"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBouquet(b.id)}
                        className="p-2 rounded-xl bg-stone-100 hover:bg-rose-100 hover:text-rose-600 text-stone-600 transition-colors cursor-pointer"
                        title="Удалить букет"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: BOUQUET OF THE DAY SETTINGS */}
          {activeTab === 'day' && (
            <form onSubmit={handleSaveBouquetOfDay} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xl space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌟</span>
                  <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18]">
                    Настройка «Специального предложения» (Букет дня)
                  </h3>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Этот букет закреплен на главном экране как специальное предложение со скидкой. Менять букет, фото, состав и цену может только владелец бутика.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-[#3E2C23] block mb-1">Название букета</label>
                  <input
                    type="text"
                    value={dayForm.name}
                    onChange={(e) => setDayForm({ ...dayForm, name: e.target.value })}
                    className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#3E2C23] block mb-1">Процент скидки (%)</label>
                  <input
                    type="number"
                    value={dayForm.discountPercent}
                    onChange={(e) => {
                      const pct = Number(e.target.value) || 0;
                      const discPrice = Math.round(dayForm.originalPrice * (1 - pct / 100));
                      setDayForm({ ...dayForm, discountPercent: pct, discountedPrice: discPrice });
                    }}
                    className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] font-bold focus:outline-none focus:border-[#F4B6C2]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#3E2C23] block mb-1">Обычная цена без скидки (₽)</label>
                  <input
                    type="number"
                    value={dayForm.originalPrice}
                    onChange={(e) => {
                      const orig = Number(e.target.value) || 0;
                      const discPrice = Math.round(orig * (1 - dayForm.discountPercent / 100));
                      setDayForm({ ...dayForm, originalPrice: orig, discountedPrice: discPrice });
                    }}
                    className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#3E2C23] block mb-1">Итоговая цена со скидкой (₽)</label>
                  <input
                    type="number"
                    value={dayForm.discountedPrice}
                    onChange={(e) => setDayForm({ ...dayForm, discountedPrice: Number(e.target.value) })}
                    className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] font-bold text-emerald-700 focus:outline-none focus:border-[#F4B6C2]"
                  />
                </div>
              </div>

              {/* Bouquet of the Day Photo: File Upload & URL */}
              <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-stone-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#3E2C23] block text-xs">Фото специального предложения</label>
                  <span className="text-[10px] text-stone-500">Файл с устройства или ссылка</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="file"
                    ref={dayFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageFileUpload(e, 'day')}
                  />
                  <button
                    type="button"
                    onClick={() => dayFileInputRef.current?.click()}
                    className="bg-white hover:bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-[#3E2C23] flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#C97A8B]" />
                    <span>Загрузить фото с устройства</span>
                  </button>

                  <input
                    type="url"
                    value={dayForm.image}
                    onChange={(e) => setDayForm({ ...dayForm, image: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                  />

                  {dayForm.image && (
                    <img
                      src={dayForm.image}
                      alt="preview"
                      className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0 self-center"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#3E2C23] block mb-1 text-xs">Описание специального предложения</label>
                <textarea
                  rows={2}
                  value={dayForm.description}
                  onChange={(e) => setDayForm({ ...dayForm, description: e.target.value })}
                  className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl p-2.5 text-xs text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                />
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Сохранить Букет Дня
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: PROMO CODES */}
          {activeTab === 'promos' && (
            <div className="space-y-4">
              {/* Add Promo Form */}
              <form onSubmit={handleAddPromoCode} className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xl space-y-3">
                <h4 className="font-serif-fleur font-bold text-sm text-[#2D1F18] flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#C97A8B]" />
                  <span>Добавить новый промокод</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="font-bold text-[#3E2C23] block mb-1">Код промокода</label>
                    <input
                      type="text"
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                      placeholder="VESNA20"
                      className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] uppercase tracking-wider font-bold focus:outline-none focus:border-[#F4B6C2]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3E2C23] block mb-1">Скидка (%)</label>
                    <input
                      type="number"
                      value={newPromoPercent}
                      onChange={(e) => setNewPromoPercent(Number(e.target.value))}
                      placeholder="15"
                      min={1}
                      max={90}
                      className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] font-bold focus:outline-none focus:border-[#F4B6C2]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3E2C23] block mb-1">Описание акции</label>
                    <input
                      type="text"
                      value={newPromoDesc}
                      onChange={(e) => setNewPromoDesc(e.target.value)}
                      placeholder="Весенняя скидка 15%"
                      className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="bg-[#3E2C23] hover:bg-[#4E382D] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                  >
                    + Добавить промокод
                  </button>
                </div>
              </form>

              {/* Promo codes list */}
              <div className="space-y-2">
                {promoCodes.map((promo) => (
                  <div
                    key={promo.code}
                    className="bg-white rounded-2xl p-3 border border-stone-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center font-bold text-xs">
                        -{promo.discountPercent}%
                      </div>
                      <div>
                        <div className="font-mono text-sm font-black text-[#2D1F18]">
                          {promo.code}
                        </div>
                        <div className="text-[11px] text-stone-500">
                          {promo.description}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeletePromo(promo.code)}
                      className="text-stone-400 hover:text-rose-500 p-2 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer"
                      title="Удалить промокод"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: STORE CONTACTS & CLIENT SECURITY */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              
              {/* SECURITY & SHOWCASE MODE CARD (Addresses the user's explicit question) */}
              <div className="bg-amber-50 rounded-3xl p-5 border-2 border-amber-300 shadow-md space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-700" />
                  <h3 className="font-serif-fleur font-bold text-base text-amber-950">
                    Защита от клиентов: Режим витрины и PIN-код
                  </h3>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed">
                  По умолчанию обычные клиенты магазина <strong>НЕ должны видеть настройки и менять цены</strong>. Здесь вы можете полностью скрыть иконку шестерёнки для покупателей и изменить защитный PIN-код.
                </p>

                {/* Hide Gear Icon Toggle */}
                <div className="bg-white rounded-2xl p-3.5 border border-amber-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#3E2C23]">
                      Отображать иконку шестерёнки в шапке
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {isGearIconVisible 
                        ? 'Шестерёнка видна. Рекомендуется выключить перед отправкой клиентам!' 
                        : 'Шестерёнка скрыта! Приложение выглядит как чистая витрина.'}
                    </div>
                  </div>

                  {onToggleGearIcon && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !isGearIconVisible;
                        onToggleGearIcon(nextVal);
                        showToast(nextVal ? 'Шестерёнка включена' : 'Шестерёнка скрыта для клиентов');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isGearIconVisible
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-600 text-white shadow-sm'
                      }`}
                    >
                      {isGearIconVisible ? '👁 Видна' : '🔒 Скрыта'}
                    </button>
                  )}
                </div>

                {/* How to enter if hidden */}
                <div className="bg-amber-100/60 rounded-xl p-3 text-[11px] text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-amber-800" />
                    <span>Как владельцу открыть панель (обычные клиенты не имеют доступа):</span>
                  </div>
                  <div>1. <strong>По специальной ссылке:</strong> добавьте <code>#admin</code> к адресу сайта.</div>
                  <div>2. <strong>По паролю:</strong> нажмите 3 раза подряд на логотип <strong>«Fleur»</strong> вверху экрана.</div>
                  <div>3. Или на экране «Поддержка» нажмите незаметную ссылку в самом низу <strong>«Служебный вход»</strong>.</div>
                </div>

                {/* Special secret admin link */}
                <div className="bg-white rounded-2xl p-3.5 border border-amber-200 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#3E2C23]">
                        Специальная ссылка для владельца
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Сохраните в закладки для быстрого входа в управление
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const link = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#admin` : '';
                        if (link) {
                          navigator.clipboard.writeText(link);
                          showToast('Специальная ссылка скопирована!');
                        }
                      }}
                      className="bg-[#3E2C23] hover:bg-[#4E382D] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer active:scale-95 transition-all self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#F4B6C2]" />
                      <span>Скопировать ссылку</span>
                    </button>
                  </div>
                  <div className="bg-[#FAF6F0] p-2 rounded-xl text-[10px] text-stone-600 font-mono break-all select-all border border-stone-200">
                    {typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#admin` : '...#admin'}
                  </div>
                </div>

                {/* Change PIN code */}
                <div className="bg-white rounded-2xl p-3.5 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-[#3E2C23]">
                      PIN-код владельца
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Текущий PIN: <strong>{adminPin}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={8}
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      placeholder="1234"
                      className="w-24 bg-[#FAF6F0] border border-stone-300 rounded-xl px-2 py-1.5 text-center text-xs font-mono font-bold text-[#2D1F18]"
                    />
                    <button
                      type="button"
                      onClick={handleSavePin}
                      className="bg-[#3E2C23] hover:bg-[#4E382D] text-white text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer"
                    >
                      Сменить PIN
                    </button>
                  </div>
                </div>
              </div>

              {/* STORE CONTACTS FORM */}
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xl space-y-4">
                <div>
                  <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18]">
                    Контакты бутика и ссылка поддержки
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Эти данные отображаются клиентам на экране «Поддержка» и при нажатии на кнопку вызова флориста
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-[#3E2C23] block mb-1">
                      Telegram аккаунт поддержки (кнопка «Поддержка»)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.telegramSupportUrl}
                      onChange={(e) => setSettingsForm({ ...settingsForm, telegramSupportUrl: e.target.value })}
                      placeholder="https://t.me/linaloveinal"
                      className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] font-mono focus:outline-none focus:border-[#F4B6C2]"
                    />
                    <span className="text-[10px] text-stone-400 mt-0.5 block">
                      По умолчанию: https://t.me/linaloveinal
                    </span>
                  </div>

                  <div>
                    <label className="font-bold text-[#3E2C23] block mb-1">Прямой телефон бутика</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                      placeholder="+7 (495) 890-21-44"
                      className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3E2C23] block mb-1">Адрес цветочного салона</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      placeholder="г. Москва, ул. Большая Никитская, 22"
                      className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#3E2C23] block mb-1">Режим работы</label>
                    <input
                      type="text"
                      value={settingsForm.workingHours}
                      onChange={(e) => setSettingsForm({ ...settingsForm, workingHours: e.target.value })}
                      placeholder="08:00 — 23:00 ежедневно"
                      className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
                    />
                  </div>
                </div>

                {/* SBP PAYMENT CONFIGURATION (СБП) */}
                <div className="bg-gradient-to-br from-emerald-950 via-[#1A2E26] to-[#0E1F19] text-white rounded-3xl p-5 shadow-xl border border-emerald-500/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-serif-fleur font-bold text-sm text-[#FAF6F0]">
                          Оплата по СБП (Система быстрых платежей)
                        </h4>
                        <p className="text-[10px] text-emerald-200/80">
                          Клиенты переводят оплату по номеру телефона или сканируют ваш банковский QR-код
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsForm.sbpEnabled ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, sbpEnabled: e.target.checked })}
                        className="rounded text-emerald-500 accent-emerald-500"
                      />
                      <span className="text-[11px] text-emerald-300">Включено</span>
                    </label>
                  </div>

                  {/* SBP Help Guide */}
                  <div className="bg-black/30 rounded-2xl p-3 text-[11px] text-stone-200 space-y-1 border border-white/10">
                    <div className="font-bold text-emerald-300">💡 Как настроить приём СБП для самозанятой:</div>
                    <div>1. Укажите номер телефона, к которому привязана карта для переводов через СБП.</div>
                    <div>2. Укажите название вашего банка (Т-Банк, СберБанк, Альфа и др.) и имя получателя.</div>
                    <div>3. <b>QR-код необязателен</b>: клиенты легко переводят по вашему номеру через СБП и прикрепляют чек об оплате.</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-stone-200 block mb-1">
                        Номер телефона СБП *
                      </label>
                      <input
                        type="text"
                        value={settingsForm.sbpPhone || '+7 (999) 123-45-67'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, sbpPhone: e.target.value })}
                        placeholder="+7 (999) 123-45-67"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-200 block mb-1">
                        Банк получателя *
                      </label>
                      <input
                        type="text"
                        value={settingsForm.sbpBankName || 'Т-Банк (Тинькофф)'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, sbpBankName: e.target.value })}
                        placeholder="Т-Банк, СберБанк, Альфа-Банк..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-200 block mb-1">
                        Имя и отчество получателя *
                      </label>
                      <input
                        type="text"
                        value={settingsForm.sbpRecipientName || 'Анна Сергеевна В.'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, sbpRecipientName: e.target.value })}
                        placeholder="Анна В. / ИП Цветова"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* SBP QR-Code Upload */}
                  <div className="bg-black/20 p-3 rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      {settingsForm.sbpQrCodeUrl ? (
                        <img
                          src={settingsForm.sbpQrCodeUrl}
                          alt="СБП QR-код"
                          className="w-12 h-12 rounded-xl object-contain bg-white p-1 border border-white/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
                          <QrCode className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-stone-200">Фирменный QR-код СБП (опционально)</div>
                        <div className="text-[10px] text-stone-400">
                          {settingsForm.sbpQrCodeUrl ? 'QR-код загружен' : 'Необязателен. Клиенты могут просто переводить по номеру телефона'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={sbpQrFileInputRef}
                        accept="image/*"
                        onChange={handleSbpQrUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => sbpQrFileInputRef.current?.click()}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Загрузить фото QR</span>
                      </button>
                      {settingsForm.sbpQrCodeUrl && (
                        <button
                          type="button"
                          onClick={() => setSettingsForm({ ...settingsForm, sbpQrCodeUrl: undefined })}
                          className="text-stone-400 hover:text-rose-400 text-xs p-1"
                          title="Сбросить QR"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* BANK CARD DIRECT TRANSFER CONFIGURATION (Для самозанятой) */}
                <div className="bg-gradient-to-br from-[#2D1F18] via-[#3E2C23] to-[#4A352B] text-white rounded-3xl p-5 shadow-xl border border-rose-400/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-rose-300" />
                      </div>
                      <div>
                        <h4 className="font-serif-fleur font-bold text-sm text-[#FAF6F0]">
                          Перевод на банковскую карту (для самозанятой)
                        </h4>
                        <p className="text-[10px] text-rose-200/80">
                          Клиенты переводят оплату на вашу банковскую карту и прикрепляют чек/квитанцию
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsForm.cardEnabled ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cardEnabled: e.target.checked })}
                        className="rounded text-rose-500 accent-rose-500"
                      />
                      <span className="text-[11px] text-rose-300">Включено</span>
                    </label>
                  </div>

                  <div className="bg-black/30 rounded-2xl p-3 text-[11px] text-stone-200 space-y-1 border border-white/10">
                    <div className="font-bold text-rose-300">💡 Как работает перевод на карту:</div>
                    <div>1. Укажите номер вашей карты, банк и ФИО держателя.</div>
                    <div>2. Клиент копирует номер карты в приложении, делает перевод и <b>прикрепляет чек об оплате</b>.</div>
                    <div>3. Чек и все данные заказа моментально приходят вам в Telegram-бот для подтверждения!</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-stone-200 block mb-1">
                        Номер банковской карты *
                      </label>
                      <input
                        type="text"
                        value={settingsForm.cardNumber || '2202 2012 3456 7890'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cardNumber: e.target.value })}
                        placeholder="2202 2012 3456 7890"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-200 block mb-1">
                        Банк карты *
                      </label>
                      <input
                        type="text"
                        value={settingsForm.cardBankName || 'СберБанк / Т-Банк'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cardBankName: e.target.value })}
                        placeholder="СберБанк, Т-Банк, ВТБ..."
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-200 block mb-1">
                        ФИО держателя карты *
                      </label>
                      <input
                        type="text"
                        value={settingsForm.cardRecipientName || 'Анна Сергеевна В.'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, cardRecipientName: e.target.value })}
                        placeholder="Анна В. (Самозанятая)"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsForm((prev) => ({
                          ...prev,
                          cardBankName: prev.sbpBankName || 'Т-Банк (Тинькофф)',
                          cardRecipientName: prev.sbpRecipientName || 'Анна Сергеевна В.',
                        }));
                        showToast('ФИО и банк скопированы из настроек СБП!');
                      }}
                      className="text-[11px] text-rose-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all active:scale-95 inline-flex items-center gap-1.5"
                    >
                      <span>📋 Скопировать Банк и ФИО из настроек СБП</span>
                    </button>
                  </div>
                </div>

                {/* TELEGRAM STARS CONFIGURATION (XTR) */}
                <div className="bg-gradient-to-br from-[#2D1F18] via-[#3E2C23] to-[#4A352B] text-white rounded-3xl p-5 shadow-xl border border-amber-500/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-lg">
                        ⭐
                      </div>
                      <div>
                        <h4 className="font-serif-fleur font-bold text-sm text-[#FAF6F0]">
                          Оплата через Telegram Stars (валюта XTR)
                        </h4>
                        <p className="text-[10px] text-stone-300">
                          Официальная цифровая валюта Telegram внутри Mini App
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsForm.starsEnabled ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, starsEnabled: e.target.checked })}
                        className="rounded text-amber-500 accent-amber-500"
                      />
                      <span className="text-[11px] text-amber-300">Включено</span>
                    </label>
                  </div>

                  {/* Stars Instructions */}
                  <div className="bg-black/30 rounded-2xl p-3 text-[11px] text-stone-300 space-y-1.5 border border-white/10">
                    <div className="font-bold text-amber-300">💡 Как подключить приём Звёзд Telegram:</div>
                    <div>1. Откройте <strong>@BotFather</strong> в Telegram.</div>
                    <div>2. Отправьте <code>/mybots</code> ➔ выберите вашего бота ➔ <strong>Bot Settings</strong> ➔ <strong>Payments</strong>.</div>
                    <div>3. Выберите <strong>Telegram Stars</strong> (валюта XTR). Никаких договоров с банками не требуется!</div>
                    <div>4. Накопленные звёзды выводятся в криптовалюту TON через официальную биржу <strong>Fragment.com</strong>.</div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 p-3 rounded-2xl border border-white/10 text-xs">
                    <div>
                      <label className="font-bold text-stone-200 block mb-0.5">
                        Курс конвертации (₽ за 1 ⭐)
                      </label>
                      <p className="text-[10px] text-stone-400">
                        По умолчанию: 1 Star = 2.0 рубля (букет 4000 ₽ = 2000 ⭐)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-stone-300">1 ⭐ =</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        max="10"
                        value={settingsForm.starsRubRate || 2.0}
                        onChange={(e) => setSettingsForm({ ...settingsForm, starsRubRate: parseFloat(e.target.value) || 2.0 })}
                        className="w-20 bg-white/10 border border-white/20 rounded-xl px-2.5 py-1.5 text-center text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-400"
                      />
                      <span className="font-mono text-xs text-stone-300">₽</span>
                    </div>
                  </div>
                </div>

                {/* TELEGRAM BOT NOTIFICATIONS FOR OWNER */}
                <div className="bg-gradient-to-br from-[#2D1F18] to-[#3E2C23] text-white rounded-3xl p-5 shadow-xl border border-[#FFD700]/30 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#0088cc]/20 border border-[#0088cc]/40 text-[#0088cc] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-serif-fleur font-bold text-sm text-[#FAF6F0]">
                          Уведомления о заказах в Telegram-бот владельца
                        </h4>
                        <p className="text-[10px] text-stone-300">
                          Каждый новый заказ с данными клиента моментально отправляется вам в бот
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        checked={settingsForm.notifyOnNewOrder ?? true}
                        onChange={(e) => setSettingsForm({ ...settingsForm, notifyOnNewOrder: e.target.checked })}
                        className="rounded text-[#0088cc] accent-[#0088cc]"
                      />
                      <span className="text-[11px] text-sky-300">Включено</span>
                    </label>
                  </div>

                  {/* Instructions */}
                  <div className="bg-black/30 rounded-2xl p-3 text-[11px] text-stone-300 space-y-1.5 border border-white/10">
                    <div className="font-bold text-[#FFD700] flex items-center gap-1">
                      <span>💡 Как подключить получение заказов в Telegram (за 1 минуту):</span>
                    </div>
                    <div>1. Откройте <strong>@BotFather</strong> в Telegram и создайте бота командой <code>/newbot</code>.</div>
                    <div>2. Скопируйте полученный <strong>API Token</strong> и вставьте в поле ниже.</div>
                    <div>3. Нажмите <code>/start</code> в диалоге с созданным ботом.</div>
                    <div>4. Узнайте свой <strong>Chat ID</strong> через бота <strong>@userinfobot</strong> и вставьте ниже.</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-stone-200 block mb-1">
                        Telegram Bot Token *
                      </label>
                      <input
                        type="text"
                        value={settingsForm.telegramBotToken || '8734424737:AAFDLzcFpY_mZgqejyT7j0TFUMiWhBm4mkQ'}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegramBotToken: e.target.value })}
                        placeholder="8734424737:AAFDLzcFpY_mZgqejyT7j0TFUMiWhBm4mkQ"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="font-bold text-stone-200 block">
                          Ваш Telegram Chat ID *
                        </label>
                        <button
                          type="button"
                          disabled={isDetectingChatId}
                          onClick={async () => {
                            setIsDetectingChatId(true);
                            const res = await fetchOwnerChatIdFromTelegram(settingsForm.telegramBotToken || '8734424737:AAFDLzcFpY_mZgqejyT7j0TFUMiWhBm4mkQ');
                            setIsDetectingChatId(false);
                            if (res.success && res.chatId) {
                              setSettingsForm((prev) => ({ ...prev, telegramOwnerChatId: res.chatId }));
                              showToast(res.message);
                            } else {
                              alert(res.message);
                            }
                          }}
                          className="text-[10px] text-sky-300 hover:text-white underline cursor-pointer flex items-center gap-1 font-semibold"
                        >
                          <RefreshCw className={`w-3 h-3 ${isDetectingChatId ? 'animate-spin' : ''}`} />
                          <span>Определить из бота</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        value={settingsForm.telegramOwnerChatId || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, telegramOwnerChatId: e.target.value })}
                        placeholder="Например: 598613913"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-sky-400"
                      />
                    </div>
                  </div>

                  {/* Test button & status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleTestTelegramNotification}
                      disabled={isTestingTelegram}
                      className="bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95 self-start sm:self-auto"
                    >
                      {isTestingTelegram ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Проверка связи...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Отправить тестовое уведомление</span>
                        </>
                      )}
                    </button>

                    {telegramTestStatus && (
                      <div
                        className={`text-[11px] font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                          telegramTestStatus.success
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        {telegramTestStatus.success ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        <span>{telegramTestStatus.message}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
                  >
                    Сохранить настройки и бота
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: PLACED ORDERS HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18]">
                    История оформленных заказов ({orders.length})
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Все заказы, переданные через Telegram Mini App
                  </p>
                </div>
              </div>

              {/* Attention banner if orders need payment review */}
              {orders.filter((o) => o.paymentStatus === 'reviewing').length > 0 && (
                <div className="bg-amber-100 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between text-xs text-amber-950 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                    <div>
                      <div className="font-extrabold text-amber-950">
                        Внимание! Есть {orders.filter((o) => o.paymentStatus === 'reviewing').length} заказ(а) с чеком, ожидающих вашего подтверждения!
                      </div>
                      <div className="text-[11px] text-amber-800/90 mt-0.5">
                        Сверьте поступление денег в банковском приложении и нажмите «Подтвердить поступление».
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-2 text-xl">
                    📦
                  </div>
                  <h4 className="font-bold text-sm text-[#2D1F18]">Заказов пока нет</h4>
                  <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                    Когда клиенты оплатят букет через Звёзды Telegram или СБП, заказ отобразится здесь с телефонами, адресом и текстом открытки.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.orderId}
                      className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#3E2C23]">
                            #{order.orderId}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.paymentStatus === 'reviewing'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold animate-pulse'
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {order.paymentStatus === 'paid' ? '✅ Оплачен' :
                             order.paymentStatus === 'reviewing' ? '⏳ Чек на проверке' : '⏳ Ожидает оплаты'}
                            {' '}({order.paymentMethod === 'stars' ? '⭐ Звёзды' : order.paymentMethod === 'sbp' ? '⚡ СБП' : '💳 Карта'})
                          </span>
                        </div>
                        <span className="text-stone-400 text-[11px]">{order.createdAt}</span>
                      </div>

                      {/* Payment Verification & Receipt Check Section for Boutique Owner */}
                      <div className={`p-3 rounded-2xl border space-y-2 text-xs ${
                        order.paymentStatus === 'reviewing'
                          ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                          : order.paymentStatus === 'paid'
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                          : 'bg-stone-50 border-stone-200 text-stone-800'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold">
                            <Receipt className="w-4 h-4 text-emerald-700" />
                            <span>
                              {order.paymentStatus === 'reviewing'
                                ? 'Сверка оплаты самозанятой:'
                                : order.paymentStatus === 'paid'
                                ? 'Оплата подтверждена:'
                                : 'Оплата:'}
                            </span>
                            <span className="font-extrabold text-[#3E2C23]">
                              {order.finalTotal.toLocaleString('ru-RU')}&nbsp;₽
                            </span>
                          </div>

                          {order.receiptImage && (
                            <button
                              type="button"
                              onClick={() => setViewingReceiptOrder(order)}
                              className="bg-white hover:bg-stone-100 text-[#3E2C23] border border-stone-300 font-bold px-2.5 py-1 rounded-xl text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Посмотреть чек</span>
                            </button>
                          )}
                        </div>

                        {order.receiptImage ? (
                          <div className="flex items-center gap-2.5 bg-white p-2 rounded-xl border border-stone-200/80">
                            <img
                              src={order.receiptImage}
                              alt="Чек от клиента"
                              onClick={() => setViewingReceiptOrder(order)}
                              className="w-12 h-12 object-cover rounded-lg border border-stone-200 cursor-pointer hover:opacity-90 shrink-0 shadow-2xs"
                              title="Нажмите для увеличения"
                            />
                            <div className="text-[11px] leading-snug flex-1">
                              <div className="font-bold text-[#3E2C23]">Клиент прикрепил чек об оплате</div>
                              <div className="text-stone-500 text-[10px]">
                                Сверьте поступление {order.finalTotal.toLocaleString('ru-RU')} ₽ в банковском приложении
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[11px] text-stone-500">
                            ⚠️ Чек клиентом ещё не прикреплен
                          </div>
                        )}

                        {/* Owner Decision Buttons */}
                        <div className="flex items-center gap-2 pt-0.5">
                          {order.paymentStatus !== 'paid' ? (
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(order.orderId, true)}
                              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              <span>Подтвердить поступление {order.finalTotal.toLocaleString('ru-RU')}&nbsp;₽</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-between w-full text-emerald-700 text-xs font-bold">
                              <span className="flex items-center gap-1">
                                <Check className="w-4 h-4 text-emerald-600" /> Оплата подтверждена вами
                              </span>
                              <button
                                type="button"
                                onClick={() => handleVerifyPayment(order.orderId, false)}
                                className="text-stone-400 hover:text-stone-600 text-[10px] font-normal underline cursor-pointer"
                              >
                                Сбросить
                              </button>
                            </div>
                          )}

                          {order.paymentStatus === 'reviewing' && (
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(order.orderId, false)}
                              className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold py-2 px-3 rounded-xl text-xs active:scale-95 transition-all cursor-pointer"
                            >
                              Отклонить
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Interactive Live Status Switcher (Visible to Client in Orders Tab) */}
                      <div className="bg-[#FAF6F0] border border-stone-200/80 p-2.5 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                            Статус доставки (отображается у клиента):
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            (order.orderStatus || 'waiting_delivery') === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            (order.orderStatus || 'waiting_delivery') === 'waiting_delivery' ? 'bg-sky-100 text-sky-800' :
                            (order.orderStatus || 'waiting_delivery') === 'assembling' ? 'bg-pink-100 text-pink-800' :
                            (order.orderStatus || 'waiting_delivery') === 'accepted' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {(order.orderStatus || 'waiting_delivery') === 'accepted' ? '📋 Принят' :
                             (order.orderStatus || 'waiting_delivery') === 'assembling' ? '🌸 Собирается' :
                             (order.orderStatus || 'waiting_delivery') === 'waiting_delivery' ? '🚗 Ожидает доставки' :
                             (order.orderStatus || 'waiting_delivery') === 'delivered' ? '✅ Доставлен' : '❌ Отменен'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pt-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.orderId, 'accepted')}
                            className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              (order.orderStatus || 'waiting_delivery') === 'accepted'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                          >
                            1. Принят
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.orderId, 'assembling')}
                            className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              (order.orderStatus || 'waiting_delivery') === 'assembling'
                                ? 'bg-[#C97A8B] text-white shadow-xs'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                          >
                            2. Собирается
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.orderId, 'waiting_delivery')}
                            className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              (order.orderStatus || 'waiting_delivery') === 'waiting_delivery'
                                ? 'bg-sky-600 text-white shadow-xs'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                          >
                            3. Ожидает доставки
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateOrderStatus(order.orderId, 'delivered')}
                            className={`py-1 px-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                              (order.orderStatus || 'waiting_delivery') === 'delivered'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                            }`}
                          >
                            4. Доставлен ✓
                          </button>
                        </div>
                      </div>

                      {/* Customer Telegram username & Direct contact button */}
                      {order.form.customerTelegram && (
                        <div className="flex items-center justify-between bg-sky-50 border border-sky-200 p-2.5 rounded-xl">
                          <div className="flex items-center gap-2">
                            <span className="text-base">✈️</span>
                            <div>
                              <span className="text-[10px] text-sky-800 font-bold block">Telegram заказчика:</span>
                              <span className="font-mono font-bold text-xs text-[#0088cc]">
                                {order.form.customerTelegram}
                              </span>
                            </div>
                          </div>
                          <a
                            href={`https://t.me/${order.form.customerTelegram.replace(/^@/, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#0088cc] hover:bg-[#0077b5] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                          >
                            <span>Написать клиенту</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Customer & Recipient */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-[#FAF6F0] p-2.5 rounded-xl border border-stone-200/60">
                        {order.form.customerName && (
                          <div>
                            <span className="text-stone-400 block font-semibold">Имя заказчика:</span>
                            <span className="font-bold text-[#3E2C23]">{order.form.customerName}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-stone-400 block font-semibold">Телефон заказчика:</span>
                          <span className="font-bold text-[#3E2C23]">{order.form.customerPhone}</span>
                        </div>
                        <div>
                          <span className="text-stone-400 block font-semibold">Телефон получателя:</span>
                          <span className="font-bold text-[#3E2C23]">{order.form.recipientPhone}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-stone-400 block font-semibold">Адрес доставки:</span>
                          <span className="text-[#3E2C23] font-medium">
                            {order.form.contactRecipient ? 'Уточнить у получателя по телефону' : order.form.deliveryAddress}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-400 block font-semibold">Слот доставки:</span>
                          <span className="font-bold text-[#3E2C23]">
                            {order.form.deliveryDate}, {order.form.deliveryTimeSlot}
                          </span>
                        </div>
                        {order.form.sendAsSurprise && (
                          <div>
                            <span className="text-stone-400 block font-semibold">Сюрприз:</span>
                            <span className="text-rose-700 font-bold">Да (анонимная доставка)</span>
                          </div>
                        )}
                      </div>

                      {/* Card Message */}
                      {order.form.cardMessage && (
                        <div className="bg-white border border-stone-200 rounded-xl p-2 text-[11px] italic text-stone-600">
                          «{order.form.cardMessage}»
                        </div>
                      )}

                      {/* Bouquets in order */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-[11px] text-stone-600">
                          {order.items.map((i) => `${i.bouquet.name} (${i.stemCount} шт, ${i.wrapper.name})`).join(', ')}
                        </div>
                        <div className="font-serif-fleur font-bold text-sm text-[#3E2C23] whitespace-nowrap">
                          {order.finalTotal.toLocaleString('ru-RU')}&nbsp;₽
                        </div>
                      </div>

                      {/* Forward to chat button */}
                      <div className="pt-2 border-t border-stone-100 flex justify-end">
                        <a
                          href={`https://t.me/share/url?url=Заказ%20${order.orderId}&text=${encodeURIComponent(
                            `🌸 Заказ #${order.orderId} на ${order.finalTotal} ₽\nКлиент: ${order.form.customerName || 'Клиент'} (${order.form.customerTelegram || order.form.customerPhone})\nАдрес: ${order.form.deliveryAddress}\nВремя: ${order.form.deliveryDate} ${order.form.deliveryTimeSlot}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 font-semibold"
                        >
                          <Send className="w-3 h-3 text-[#0088cc]" />
                          <span>Переслать курьеру / в чат</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: EXPORT & CODE */}
          {activeTab === 'export' && (
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xl space-y-4">
              <div>
                <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18]">
                  Сохранение и передача данных разработчику
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Все изменения уже автоматически сохранены в памяти вашего браузера / Telegram. Чтобы зафиксировать этот ассортимент навсегда для ВСЕХ будущих пользователей, скопируйте блок кода ниже:
                </p>
              </div>

              <div className="relative">
                <textarea
                  readOnly
                  rows={8}
                  value={generateTypeScriptCode()}
                  className="w-full bg-[#FAF6F0] border border-stone-200 rounded-xl p-3 font-mono text-[11px] text-[#2D1F18] focus:outline-none"
                />
                <button
                  onClick={handleCopyCode}
                  className="absolute top-2 right-2 bg-[#3E2C23] hover:bg-[#4E382D] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-[#F4B6C2]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Скопировано!' : 'Скопировать код'}</span>
                </button>
              </div>

              <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="font-bold text-[#3E2C23]">💡 Как заказчик может зафиксировать свои цены:</div>
                <div>1. Нажмите «Скопировать код».</div>
                <div>2. Отправьте этот текст разработчику (или вставьте в файл <code>src/data/fleurData.ts</code>).</div>
                <div>3. Готово! Все новые пользователи сразу увидят новые букеты и цены по умолчанию.</div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-700">Опасная зона</div>
                  <div className="text-[10px] text-stone-400">Сбросить все цены и ассортимент к исходным демо</div>
                </div>

                <button
                  onClick={handleResetToDefault}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-3 py-2 rounded-xl border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Сбросить всё</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-stone-200 p-3 px-4 flex items-center justify-between text-xs">
          <button
            onClick={goToPrevTab}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Назад</span>
          </button>

          <span className="text-[11px] font-bold text-stone-500">
            Вкладка {currentTabIndex + 1} из 6
          </span>

          <button
            onClick={goToNextTab}
            className="px-4 py-2 rounded-xl bg-[#3E2C23] hover:bg-[#4E382D] text-white font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <span>Вперёд</span>
            <ChevronRight className="w-4 h-4 text-[#F4B6C2]" />
          </button>
        </div>
      </div>

      {/* Full-Screen Receipt Viewing Modal for Owner */}
      {viewingReceiptOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col text-[#2D1F18] shadow-2xl">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18]">
                  Чек к заказу #{viewingReceiptOrder.orderId}
                </h3>
                <p className="text-xs text-stone-500">
                  Сумма: <strong className="text-emerald-700">{viewingReceiptOrder.finalTotal.toLocaleString('ru-RU')} ₽</strong> • {viewingReceiptOrder.form.customerName || 'Клиент'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceiptOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-stone-100">
              {viewingReceiptOrder.receiptImage ? (
                <img
                  src={viewingReceiptOrder.receiptImage}
                  alt="Чек об оплате"
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-md border border-stone-300"
                />
              ) : (
                <p className="text-stone-500 text-xs">Чек отсутствует</p>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-white flex items-center justify-between gap-2">
              {viewingReceiptOrder.paymentStatus !== 'paid' && (
                <button
                  type="button"
                  onClick={() => {
                    handleVerifyPayment(viewingReceiptOrder.orderId, true);
                    setViewingReceiptOrder(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Подтвердить оплату ({viewingReceiptOrder.finalTotal.toLocaleString('ru-RU')} ₽)</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setViewingReceiptOrder(null)}
                className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
