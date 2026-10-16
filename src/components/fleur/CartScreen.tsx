import React, { useState } from 'react';
import { CartItem } from '../../types/fleur';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, Sparkles, Check } from 'lucide-react';

import { PromoCodeItem } from './AdminPanelModal';

interface CartScreenProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenCheckout: (discountPercent: number, appliedPoints: number) => void;
  onOpenCatalog: () => void;
  userBonusPoints: number;
  promoCodes?: PromoCodeItem[];
  ordersCount?: number;
}

export function CartScreen({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onOpenCheckout,
  onOpenCatalog,
  userBonusPoints,
  promoCodes = [{ code: 'FIRST', discountPercent: 10, description: 'Скидка 10%' }],
  ordersCount = 0,
}: CartScreenProps) {
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [useBonusPoints, setUseBonusPoints] = useState<boolean>(false);

  const rawSubtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  const handleApplyPromo = () => {
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'FIRST' && ordersCount > 0) {
      setPromoMessage({ 
        text: 'Промокод FIRST действует только на 1-й заказ нового клиента. Используйте промокоды клуба или баллы.', 
        isError: true 
      });
      return;
    }

    const matched = promoCodes.find((p) => p.code === clean);
    if (matched) {
      setAppliedDiscountPercent(matched.discountPercent);
      setPromoMessage({ text: `Промокод ${matched.code} применен (-${matched.discountPercent}%)` });
    } else {
      setPromoMessage({ 
        text: ordersCount === 0 ? 'Промокод не найден. Попробуйте FIRST' : 'Промокод не найден или срок действия истек', 
        isError: true 
      });
    }
  };

  const promoDiscount = Math.round(rawSubtotal * (appliedDiscountPercent / 100));
  const pointsToUse = useBonusPoints ? Math.min(userBonusPoints, Math.round(rawSubtotal * 0.3)) : 0;
  const deliveryFee = rawSubtotal >= 3000 || items.length === 0 ? 0 : 350;
  const finalTotal = Math.max(0, rawSubtotal - promoDiscount - pointsToUse + deliveryFee);

  if (items.length === 0) {
    return (
      <div className="bg-white text-[#2D1F18] rounded-3xl p-8 text-center my-6 shadow-xl border border-stone-100">
        <div className="w-16 h-16 rounded-full bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="font-serif-fleur text-xl font-bold text-[#2D1F18]">Корзина пуста</h3>
        <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
          Выберите букет в нашем каталоге, чтобы порадовать близкого человека
        </p>
        <button
          onClick={onOpenCatalog}
          className="mt-5 bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold text-xs py-3 px-6 rounded-2xl shadow-md transition-all cursor-pointer"
        >
          Перейти в каталог
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="text-center pt-1 pb-1">
        <h2 className="font-serif-fleur text-2xl text-[#FAF6F0] font-normal tracking-wide">
          Ваш заказ ({items.reduce((s, i) => s + i.quantity, 0)} шт)
        </h2>
      </div>

      {/* Items List (White cards with rounded corners) */}
      <div className="bg-white text-[#2D1F18] rounded-3xl p-4 shadow-xl border border-stone-100 divide-y divide-stone-100">
        {items.map((item) => (
          <div key={item.id} className="pt-3.5 pb-3.5 first:pt-0 last:pb-0 flex items-center gap-3">
            <img
              src={item.bouquet.image}
              alt={item.bouquet.name}
              className="w-18 h-18 rounded-2xl object-cover shrink-0 bg-stone-100 border border-stone-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-1">
                <h4 className="font-serif-fleur font-bold text-sm text-[#2D1F18] truncate">
                  {item.bouquet.name}
                </h4>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-stone-400 hover:text-rose-500 p-0.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-stone-500 mt-0.5">
                <span>{item.stemCount} цветов • {item.wrapper.name}</span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 bg-[#FAF6F0] rounded-xl p-1 border border-stone-200/60">
                  <button
                    onClick={() => onUpdateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-lg bg-white hover:bg-stone-100 text-[#3E2C23] flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer active:scale-90"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-xs text-[#2D1F18]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-lg bg-[#F4B6C2] text-[#3E2C23] flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer active:scale-90"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <span className="font-serif-fleur font-bold text-sm text-[#3E2C23] whitespace-nowrap shrink-0">
                  {(item.unitPrice * item.quantity).toLocaleString('ru-RU')}&nbsp;₽
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code & Bonuses Box */}
      <div className="bg-white text-[#2D1F18] rounded-3xl p-4 shadow-xl border border-stone-100 space-y-3">
        {/* Promo Code Input */}
        <div>
          <label className="text-xs font-bold text-[#3E2C23] flex items-center gap-1.5 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-[#C97A8B]" />
            <span>Промокод на скидку</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={ordersCount === 0 ? "Введите FIRST (-10%)" : "Введите промокод"}
              className="flex-1 bg-[#FAF6F0] border border-stone-200 rounded-xl px-3 py-2 text-xs uppercase tracking-wider text-[#2D1F18] focus:outline-none focus:border-[#F4B6C2]"
            />
            <button
              onClick={handleApplyPromo}
              className="bg-[#3E2C23] hover:bg-[#4E382D] text-white font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Применить
            </button>
          </div>

          {promoMessage && (
            <div
              className={`text-[11px] mt-1.5 font-medium ${
                promoMessage.isError ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {promoMessage.text}
            </div>
          )}
        </div>

        {/* Bonus points redemption */}
        {userBonusPoints > 0 && (
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C97A8B]" />
              <div>
                <div className="text-xs font-bold text-[#2D1F18]">
                  Списать баллы Fleur
                </div>
                <div className="text-[10px] text-stone-500">
                  Доступно: {userBonusPoints} баллов
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setUseBonusPoints((v) => !v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                useBonusPoints
                  ? 'bg-[#F4B6C2] text-[#3E2C23]'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {useBonusPoints ? `Списано -${pointsToUse} ₽` : 'Использовать'}
            </button>
          </div>
        )}
      </div>

      {/* Cost Breakdown & Total */}
      <div className="bg-white text-[#2D1F18] rounded-3xl p-4 shadow-xl border border-stone-100 space-y-2 text-xs">
        <div className="flex justify-between text-stone-500">
          <span>Сумма букетов:</span>
          <span className="font-medium text-stone-800 whitespace-nowrap">{rawSubtotal.toLocaleString('ru-RU')}&nbsp;₽</span>
        </div>

        {promoDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Скидка по промокоду ({appliedDiscountPercent}%):</span>
            <span className="whitespace-nowrap">-{promoDiscount.toLocaleString('ru-RU')}&nbsp;₽</span>
          </div>
        )}

        {pointsToUse > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Оплата баллами Fleur:</span>
            <span className="whitespace-nowrap">-{pointsToUse}&nbsp;₽</span>
          </div>
        )}

        <div className="flex justify-between text-stone-500">
          <span>Доставка:</span>
          <span className="font-medium text-stone-800 whitespace-nowrap">
            {deliveryFee === 0 ? 'Бесплатно (от 3 000 ₽)' : `${deliveryFee}\u00A0₽`}
          </span>
        </div>

        <div className="pt-2.5 border-t border-stone-100 flex items-baseline justify-between font-bold">
          <span className="text-[#3E2C23] text-sm font-serif-fleur">Итого к оплате:</span>
          <span className="text-xl text-[#3E2C23] font-serif-fleur font-extrabold whitespace-nowrap shrink-0">
            {finalTotal.toLocaleString('ru-RU')}&nbsp;₽
          </span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={() => onOpenCheckout(appliedDiscountPercent, pointsToUse)}
        className="w-full bg-[#F4B6C2] hover:bg-[#e8a3b0] active:scale-[0.98] text-[#3E2C23] font-bold py-3.5 px-6 rounded-2xl text-sm shadow-xl shadow-[#F4B6C2]/30 transition-all flex items-center justify-between cursor-pointer"
      >
        <span>Перейти к оформлению</span>
        <div className="flex items-center gap-1 font-extrabold whitespace-nowrap shrink-0">
          <span>{finalTotal.toLocaleString('ru-RU')}&nbsp;₽</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </div>
      </button>
    </div>
  );
}
