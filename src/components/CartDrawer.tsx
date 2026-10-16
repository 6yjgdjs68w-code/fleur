import React, { useState } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { Product, OrderRecord } from '../data/storeData';
import { 
  ShoppingBag, Trash2, Plus, Minus, X, Tag, Star, CreditCard, 
  MapPin, Clock, ShieldCheck, ChevronRight, Sparkles, CheckCircle2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface CartLineItem {
  cartId: string;
  product: Product;
  sizeId?: string;
  toppings?: string[];
  quantity: number;
  unitPrice: number;
}

interface CartDrawerProps {
  items: CartLineItem[];
  onClose: () => void;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onOrderCreated: (order: OrderRecord) => void;
  userStarsBalance: number;
  onSpendStars: (amount: number) => void;
}

export function CartDrawer({
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCreated,
  userStarsBalance,
  onSpendStars,
}: CartDrawerProps) {
  const { user, triggerHaptic, sendDataToBot } = useTelegram();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [address, setAddress] = useState('ул. Тверская, 14, кв. 32');
  const [entrance, setEntrance] = useState('2');
  const [floor, setFloor] = useState('5');
  const [intercom, setIntercom] = useState('32К');
  const [comment, setComment] = useState('Оставить у двери, ребенок спит');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>({
    code: 'TELEGRAM',
    discountPercent: 20,
  });
  const [promoError, setPromoError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stars' | 'card'>('stars');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial calculations
  const rawSubtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const pickupDiscount = deliveryType === 'pickup' ? Math.round(rawSubtotal * 0.1) : 0;
  const promoDiscount = appliedPromo ? Math.round((rawSubtotal - pickupDiscount) * (appliedPromo.discountPercent / 100)) : 0;
  const deliveryFee = deliveryType === 'delivery' ? (rawSubtotal >= 1200 ? 0 : 190) : 0;
  const finalTotal = Math.max(0, rawSubtotal - pickupDiscount - promoDiscount + deliveryFee);
  
  // Telegram stars calculation (1 Star = ~2 RUB)
  const starsNeeded = Math.ceil(finalTotal / 2);
  const cashbackStars = Math.round(finalTotal * 0.1);

  const handleApplyPromo = () => {
    const cleaned = promoInput.trim().toUpperCase();
    if (!cleaned) return;
    triggerHaptic('light');

    if (cleaned === 'TELEGRAM') {
      setAppliedPromo({ code: 'TELEGRAM', discountPercent: 20 });
      setPromoError(null);
    } else if (cleaned === 'DUROV') {
      setAppliedPromo({ code: 'DUROV', discountPercent: 25 });
      setPromoError(null);
    } else if (cleaned === 'STARS') {
      setAppliedPromo({ code: 'STARS', discountPercent: 15 });
      setPromoError(null);
    } else {
      setPromoError('Промокод не найден. Попробуйте TELEGRAM');
    }
  };

  const handleCreateOrder = () => {
    if (items.length === 0) return;
    setIsSubmitting(true);
    triggerHaptic('success');

    try {
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2481cc', '#38bdf8', '#f59e0b', '#10b981'],
      });
    } catch (e) {}

    const orderId = `TG-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: OrderRecord = {
      id: orderId,
      date: 'Сегодня, прямо сейчас',
      status: 'cooking',
      statusText: 'Шеф-повар готовит',
      items: items.map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.unitPrice,
      })),
      total: finalTotal,
      starsCashback: cashbackStars,
      deliveryAddress: deliveryType === 'delivery' ? `${address}, под. ${entrance}, эт. ${floor}` : 'Самовывоз: Ресторан TON Gastro',
    };

    if (paymentMethod === 'stars') {
      onSpendStars(Math.min(userStarsBalance, starsNeeded));
    }

    // Official Telegram sendData payload
    sendDataToBot({
      event: 'order_created',
      order_id: orderId,
      user_id: user.id,
      total_rub: finalTotal,
      payment_method: paymentMethod,
      items_count: items.length,
      delivery_type: deliveryType,
    });

    onOrderCreated(newOrder);
    onClearCart();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl flex flex-col animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-base text-white">Ваша корзина</h2>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
              {items.reduce((s, i) => s + i.quantity, 0)} шт
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center my-auto">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-white text-base">Корзина пуста</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Выберите вкуснейшую пиццу, свежие роллы или кофе из нашего меню
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all"
            >
              Перейти к меню
            </button>
          </div>
        ) : (
          <div className="p-5 space-y-5 flex-1">
            
            {/* Items List */}
            <div className="space-y-3 divide-y divide-slate-800/60">
              {items.map((item) => (
                <div key={item.cartId} className="pt-3 first:pt-0 flex items-start gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-semibold text-xs text-slate-100 truncate">{item.product.name}</h4>
                      <button
                        onClick={() => onRemoveItem(item.cartId)}
                        className="text-slate-500 hover:text-rose-400 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {item.sizeId && <span>{item.sizeId === 'xl' ? 'Большая 35см' : 'Стандарт 28см'} • </span>}
                      {item.toppings && item.toppings.length > 0 && (
                        <span>+{item.toppings.length} топп. • </span>
                      )}
                      <span className="font-bold text-sky-400">{item.unitPrice} ₽</span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, -1)}
                          className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold text-xs text-white">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.cartId, 1)}
                          className="w-6 h-6 rounded-md bg-sky-500 hover:bg-sky-400 active:scale-90 text-white flex items-center justify-center"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-extrabold text-xs text-white">
                        {(item.unitPrice * item.quantity).toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery or Pickup toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Способ получения</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setDeliveryType('delivery');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    deliveryType === 'delivery'
                      ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    <span>Доставка</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">~30–40 мин • {rawSubtotal >= 1200 ? 'Бесплатно' : '190 ₽'}</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setDeliveryType('pickup');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    deliveryType === 'pickup'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs text-white">
                    <span>Самовывоз</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">-10%</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Готовность через ~15 мин</div>
                </button>
              </div>
            </div>

            {/* Delivery Address Details */}
            {deliveryType === 'delivery' && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 text-xs">
                <div>
                  <label className="text-slate-400 text-[11px] font-medium block mb-1">Адрес доставки</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                    placeholder="Улица, дом, квартира"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-slate-400 text-[10px] font-medium block mb-1">Подъезд</label>
                    <input
                      type="text"
                      value={entrance}
                      onChange={(e) => setEntrance(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-medium block mb-1">Этаж</label>
                    <input
                      type="text"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 text-[10px] font-medium block mb-1">Домофон</label>
                    <input
                      type="text"
                      value={intercom}
                      onChange={(e) => setIntercom(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] font-medium block mb-1">Комментарий курьеру</label>
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {/* Promo Code Input */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                <span>Промокод</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="TELEGRAM, DUROV, STARS"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs uppercase tracking-wider text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 text-slate-200 transition-all"
                >
                  Применить
                </button>
              </div>

              {appliedPromo && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1.5 rounded-lg">
                  <span>Применен промокод <strong>{appliedPromo.code}</strong> (-{appliedPromo.discountPercent}%)</span>
                  <button onClick={() => setAppliedPromo(null)} className="text-slate-400 hover:text-white">✕</button>
                </div>
              )}
              {promoError && (
                <div className="mt-1 text-[11px] text-rose-400">{promoError}</div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">Способ оплаты</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPaymentMethod('stars');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'stars'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-amber-300">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>Telegram Stars</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {starsNeeded} ⭐ (~{finalTotal} ₽)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPaymentMethod('card');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-sky-500/15 border-sky-500 text-sky-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                    <CreditCard className="w-4 h-4 text-sky-400" />
                    <span>Карта / СБП</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">СБП, МИР, Любые карты</div>
                </button>
              </div>
            </div>

            {/* Summary Breakdown */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Сумма заказа:</span>
                <span className="text-slate-200">{rawSubtotal.toLocaleString()} ₽</span>
              </div>
              {pickupDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Скидка за самовывоз (10%):</span>
                  <span>-{pickupDiscount} ₽</span>
                </div>
              )}
              {promoDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Скидка по промокоду:</span>
                  <span>-{promoDiscount} ₽</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Доставка:</span>
                <span className="text-slate-200">{deliveryFee === 0 ? 'Бесплатно' : `${deliveryFee} ₽`}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline font-bold">
                <span className="text-white text-sm">Итого к оплате:</span>
                <span className="text-lg text-sky-400 font-extrabold">{finalTotal.toLocaleString()} ₽</span>
              </div>
              <div className="text-[11px] text-amber-400/90 pt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Вам начислится +{cashbackStars} ⭐ бонусов Telegram Stars</span>
              </div>
            </div>

            {/* Action Checkout Button */}
            <button
              onClick={handleCreateOrder}
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold py-4 px-4 rounded-2xl text-sm shadow-xl shadow-sky-500/25 active:scale-[0.98] transition-all flex items-center justify-between"
            >
              <span>Оформить заказ • {deliveryType === 'delivery' ? '~35 мин' : 'Самовывоз'}</span>
              <div className="flex items-center gap-1">
                <span>{finalTotal.toLocaleString()} ₽</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
