import React from 'react';
import { PlacedOrder } from '../../types/fleur';
import { CheckCircle2, Heart, Clock, MapPin, Sparkles } from 'lucide-react';

interface OrderSuccessModalProps {
  order: PlacedOrder;
  onClose: () => void;
}

export function OrderSuccessModal({ order, onClose }: OrderSuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-white text-[#2D1F18] p-6 shadow-2xl text-center animate-in zoom-in-95">
        
        {/* Flower Celebration Badge */}
        <div className="w-16 h-16 rounded-full bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Heart className="w-8 h-8 fill-[#F4B6C2] text-[#C97A8B]" />
        </div>

        <h3 className="font-serif-fleur text-2xl font-bold text-[#2D1F18]">
          Спасибо за заказ!
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Номер заказа: <strong className="text-[#3E2C23] font-mono">{order.orderId}</strong>
        </p>

        {/* Order Details Card */}
        <div className="bg-[#FAF6F0] rounded-2xl p-3.5 my-4 text-xs text-left space-y-2 border border-stone-200/60">
          <div className="flex items-center justify-between text-stone-500">
            <span>Оплата:</span>
            <span className="font-bold text-[#3E2C23]">
              {order.paymentMethod === 'stars'
                ? `⭐ ${order.starsAmount} Stars (XTR)`
                : order.paymentMethod === 'sbp'
                ? '⚡ Оплачено через СБП'
                : '💳 Банковская карта'}
            </span>
          </div>

          <div className="flex items-center justify-between text-stone-500">
            <span>Сумма:</span>
            <span className="font-bold text-[#3E2C23]">{order.finalTotal.toLocaleString()} ₽</span>
          </div>

          <div className="flex items-start justify-between text-stone-500 pt-1.5 border-t border-stone-200/60">
            <span>Доставка:</span>
            <span className="font-medium text-[#2D1F18] text-right max-w-[170px] truncate">
              {order.form.contactRecipient
                ? 'Уточнить у получателя'
                : `${order.form.deliveryDate}, ${order.form.deliveryTimeSlot}`}
            </span>
          </div>

          <div className="flex items-start justify-between text-stone-500">
            <span>Получатель:</span>
            <span className="font-medium text-[#2D1F18]">{order.form.recipientPhone}</span>
          </div>

          {order.form.sendAsSurprise && (
            <div className="pt-2 border-t border-stone-200/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#C97A8B]">
                <span>🎁</span>
                <span>Отправлено сюрпризом (Тайный поклонник)</span>
              </div>
              <div className="bg-gradient-to-br from-[#2D1F18] to-[#3E2C23] text-[#FAF6F0] p-2.5 rounded-xl border border-[#FFD700]/30 text-[10px]">
                <div className="text-[#FFD700] font-mono text-[9px] mb-1 flex justify-between">
                  <span>⚜️ Анонимная карточка Fleur</span>
                  <span>{order.form.hideSenderUntilDelivery ? 'Личность скрыта до вручения' : 'Имя скрыто'}</span>
                </div>
                <div className="italic text-stone-200 font-serif-fleur text-[11px]">
                  "{order.form.cardMessage}"
                </div>
                <div className="text-[9px] text-[#F4B6C2] mt-1 text-right">
                  Откроется получателю только после доставки ✨
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-[11px] text-stone-500 leading-relaxed mb-5">
          Флорист уже подбирает самые свежие цветы для вашего букета. Перед отправкой мы пришлем фото в Telegram!
        </p>

        <button
          onClick={onClose}
          className="w-full bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-xl shadow-[#F4B6C2]/25 transition-all cursor-pointer"
        >
          Вернуться в бутик Fleur
        </button>
      </div>
    </div>
  );
}
