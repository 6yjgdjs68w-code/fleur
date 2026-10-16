import React, { useState, useEffect } from 'react';
import { MOCK_PRODUCTS, Product } from '../../data/mockProducts';
import { useTelegram } from '../../context/TelegramContext';
import { Plus, Minus, ShoppingBag, CheckCircle2, Sparkles, X, ChevronRight, CreditCard, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

export function CatalogTab() {
  const { setMainButton, triggerHaptic, sendDataToBot, user } = useTelegram();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('ул. Тверская, 14, кв. 32');
  const [orderComment, setOrderComment] = useState('Домофон 32К, оставить у двери');
  const [paymentMethod, setPaymentMethod] = useState<'stars' | 'card' | 'cash'>('stars');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const categories = [
    { id: 'all', label: '🔥 Все меню' },
    { id: 'pizza', label: '🍕 Пицца' },
    { id: 'sushi', label: '🍣 Суши & Роллы' },
    { id: 'drinks', label: '🥤 Напитки' },
    { id: 'desserts', label: '🍰 Десерты' },
  ];

  const filteredProducts = selectedCategory === 'all'
    ? MOCK_PRODUCTS
    : MOCK_PRODUCTS.filter((p) => p.category === selectedCategory);

  const totalItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const product = MOCK_PRODUCTS.find((p) => p.id === id);
    return sum + (product ? product.price * qty : 0);
  }, 0);

  const handleAddToCart = (product: Product) => {
    triggerHaptic('light');
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    triggerHaptic('light');
    setCart((prev) => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  // Sync Telegram MainButton
  useEffect(() => {
    if (orderSuccess) {
      setMainButton({
        isVisible: true,
        text: 'Сделать новый заказ',
        color: '#10b981',
        callback: () => {
          setOrderSuccess(false);
          setIsCheckoutOpen(false);
          setCart({});
        },
      });
      return;
    }

    if (isCheckoutOpen) {
      setMainButton({
        isVisible: true,
        text: `Оплатить ${totalPrice.toLocaleString()} ₽ • Отправить боту`,
        color: '#2481cc',
        callback: () => handleFinalizeOrder(),
      });
    } else if (totalItemsCount > 0) {
      setMainButton({
        isVisible: true,
        text: `Корзина (${totalItemsCount}) • ${totalPrice.toLocaleString()} ₽`,
        color: '#2481cc',
        callback: () => {
          triggerHaptic('medium');
          setIsCheckoutOpen(true);
        },
      });
    } else {
      setMainButton({
        isVisible: false,
      });
    }
  }, [totalItemsCount, totalPrice, isCheckoutOpen, orderSuccess]);

  const handleFinalizeOrder = () => {
    triggerHaptic('success');
    
    // Launch confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#2481cc', '#38bdf8', '#f59e0b', '#10b981'],
      });
    } catch (e) {
      // ignore
    }

    const orderPayload = {
      action: 'create_order',
      order_id: `TG-${Math.floor(100000 + Math.random() * 900000)}`,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name || ''}`.trim(),
        username: user.username,
      },
      items: Object.entries(cart).map(([id, qty]) => {
        const p = MOCK_PRODUCTS.find((item) => item.id === id);
        return {
          id,
          name: p?.name,
          price: p?.price,
          quantity: qty,
          subtotal: (p?.price || 0) * qty,
        };
      }),
      total: totalPrice,
      payment_method: paymentMethod,
      delivery_address: deliveryAddress,
      comment: orderComment,
      timestamp: new Date().toISOString(),
    };

    sendDataToBot(orderPayload);
    setOrderSuccess(true);
  };

  return (
    <div className="pb-28">
      {/* Mini App Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-4 text-white shadow-lg mb-4">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-2 opacity-15 text-8xl pointer-events-none">
          🛍️
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-xs font-medium mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Telegram WebApp Demo</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Гастро-Доставка в ТГ</h2>
          <p className="text-xs text-sky-100 mt-1 max-w-[260px]">
            Настоящий магазин внутри Telegram с кнопкой MainButton и отправкой заказа боту через tg.sendData()
          </p>
        </div>
      </div>

      {/* Categories Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-4 -mx-1 px-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                triggerHaptic('light');
                setSelectedCategory(cat.id);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredProducts.map((product) => {
          const qty = cart[product.id] || 0;
          return (
            <div
              key={product.id}
              className="group flex flex-col justify-between rounded-xl bg-slate-900/90 border border-slate-800 p-3 hover:border-slate-700 transition-all shadow-sm"
            >
              <div>
                <div className="relative h-36 w-full overflow-hidden rounded-lg bg-slate-800 mb-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {product.isPopular && (
                    <span className="absolute top-2 left-2 rounded-md bg-amber-500/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-slate-950 uppercase tracking-wide">
                      Хит
                    </span>
                  )}
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/60 backdrop-blur-sm px-1.5 py-0.5 text-[10px] text-slate-300 font-medium">
                    {product.weight}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-slate-100 line-clamp-1">{product.name}</h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-base font-bold text-sky-400">{product.price} ₽</span>
                  {product.oldPrice && (
                    <span className="text-xs line-through text-slate-500">{product.oldPrice} ₽</span>
                  )}
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex items-center gap-1 bg-sky-500 hover:bg-sky-400 active:scale-95 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>В корзину</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    <button
                      onClick={() => handleRemoveFromCart(product.id)}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-700 hover:bg-slate-600 active:scale-90 text-white transition-all"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-1 text-sky-300 min-w-4 text-center">{qty}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-6 h-6 flex items-center justify-center rounded-md bg-sky-500 hover:bg-sky-400 active:scale-90 text-white transition-all"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Bottom Sheet Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
          <div className="relative w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-slate-900 border border-slate-800 p-5 text-slate-100 shadow-2xl animate-in slide-in-from-bottom-5">
            {orderSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white">Заказ отправлен боту!</h3>
                <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
                  Данные заказа переданы через <code className="text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded">tg.sendData()</code>. В реальном боте сработает хендлер <code className="text-sky-300 bg-sky-950/60 px-1.5 py-0.5 rounded">F.web_app_data</code>!
                </p>

                <div className="bg-slate-950 rounded-xl p-3 text-left border border-slate-800 my-4 text-xs">
                  <div className="text-slate-400 text-[11px] mb-1 font-semibold uppercase tracking-wider">
                    Сводка заказа
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Покупатель:</span>
                    <span className="font-medium text-slate-200">{user.first_name} (@{user.username || 'user'})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Оплата:</span>
                    <span className="font-medium text-amber-300">{paymentMethod === 'stars' ? '⭐ Telegram Stars' : 'Банковская карта'}</span>
                  </div>
                  <div className="flex justify-between py-1 pt-1.5 font-bold">
                    <span className="text-white">Итого:</span>
                    <span className="text-sky-400">{totalPrice.toLocaleString()} ₽</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setOrderSuccess(false);
                    setIsCheckoutOpen(false);
                    setCart({});
                  }}
                  className="w-full bg-sky-500 hover:bg-sky-400 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-md"
                >
                  Вернуться в меню
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-sky-400" />
                    <h3 className="font-bold text-base text-white">Оформление заказа</h3>
                  </div>
                  <button
                    onClick={() => setIsCheckoutOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items summary */}
                <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                  {Object.entries(cart).map(([id, qty]) => {
                    const product = MOCK_PRODUCTS.find((p) => p.id === id);
                    if (!product) return null;
                    return (
                      <div key={id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sky-400">{qty}×</span>
                          <span className="text-slate-200 font-medium">{product.name}</span>
                        </div>
                        <span className="font-semibold text-slate-300">{product.price * qty} ₽</span>
                      </div>
                    );
                  })}
                </div>

                {/* Customer & Address Form */}
                <div className="space-y-3 text-xs mb-5">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Получатель (из профиля TG)</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                        {user.first_name[0]}
                      </div>
                      <span className="font-medium">{user.first_name} {user.last_name || ''}</span>
                      <span className="text-slate-500 text-[11px]">@{user.username || 'tg_user'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Адрес доставки</label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                      placeholder="Город, улица, дом, квартира"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Комментарий курьеру</label>
                    <input
                      type="text"
                      value={orderComment}
                      onChange={(e) => setOrderComment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
                      placeholder="Код домофона, этаж, пожелания"
                    />
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="block text-slate-400 font-medium mb-1.5">Способ оплаты</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPaymentMethod('stars');
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === 'stars'
                            ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <div>
                          <div className="text-xs">Telegram Stars</div>
                          <div className="text-[10px] text-slate-500">Внутренняя валюта ТГ</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPaymentMethod('card');
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                          paymentMethod === 'card'
                            ? 'bg-sky-500/10 border-sky-500 text-sky-300 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-sky-400" />
                        <div>
                          <div className="text-xs">Карта онлайн</div>
                          <div className="text-[10px] text-slate-500">ЮKassa / СБП в боте</div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="flex items-center justify-between text-sm font-bold border-t border-slate-800 pt-3 mb-4">
                  <span className="text-slate-300">Итого к оплате:</span>
                  <span className="text-lg text-sky-400 font-extrabold">{totalPrice.toLocaleString()} ₽</span>
                </div>

                {/* Action button inside modal */}
                <button
                  onClick={handleFinalizeOrder}
                  className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span>Подтвердить и отправить боту</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
