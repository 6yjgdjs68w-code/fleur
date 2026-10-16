import React, { useState } from 'react';
import { PlacedOrder, OrderStatus, StoreSettings } from '../../types/fleur';
import { 
  Package, Clock, CheckCircle2, Truck, AlertCircle, 
  MapPin, Calendar, MessageSquare, Phone, Send, ArrowRight,
  Sparkles, Flower2, ChevronRight, RefreshCw, ShoppingBag,
  Receipt, Eye, X
} from 'lucide-react';

interface OrdersScreenProps {
  orders: PlacedOrder[];
  onOpenCatalog: () => void;
  storeSettings: StoreSettings;
}

export function OrdersScreen({ orders, onOpenCatalog, storeSettings }: OrdersScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const getStatusBadge = (status?: OrderStatus) => {
    switch (status) {
      case 'accepted':
        return {
          label: 'Принят в работу',
          subtext: 'Заказ передан в флористическую студию Fleur',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-500',
          icon: <Clock className="w-3.5 h-3.5" />,
          step: 1,
        };
      case 'assembling':
        return {
          label: 'Собирается флористом',
          subtext: 'Флорист собирает букет из свежих цветов',
          bg: 'bg-pink-100 text-[#3E2C23] border-pink-300',
          dot: 'bg-[#F4B6C2]',
          icon: <Flower2 className="w-3.5 h-3.5 text-[#C97A8B]" />,
          step: 2,
        };
      case 'waiting_delivery':
      default:
        return {
          label: 'Ожидает доставки',
          subtext: 'Букет готов и передан в курьерскую службу',
          bg: 'bg-sky-100 text-sky-900 border-sky-300',
          dot: 'bg-sky-500 animate-pulse',
          icon: <Truck className="w-3.5 h-3.5 text-sky-600" />,
          step: 3,
        };
      case 'delivered':
        return {
          label: 'Доставлено',
          subtext: 'Букет бережно вручен получателю',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          step: 4,
        };
      case 'cancelled':
        return {
          label: 'Отменен',
          subtext: 'Заказ отменен по согласованию с клиентом',
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-500',
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-600" />,
          step: 0,
        };
    }
  };

  const activeOrders = orders.filter((o) => (o.orderStatus || 'waiting_delivery') !== 'delivered' && (o.orderStatus || 'waiting_delivery') !== 'cancelled');
  const completedOrders = orders.filter((o) => (o.orderStatus || 'waiting_delivery') === 'delivered' || (o.orderStatus || 'waiting_delivery') === 'cancelled');

  const filteredOrders = activeFilter === 'active' 
    ? activeOrders 
    : activeFilter === 'completed' 
    ? completedOrders 
    : orders;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="text-center pt-1 pb-1">
        <h2 className="font-serif-fleur text-2xl text-[#FAF6F0] font-normal tracking-wide">
          Мои заказы
        </h2>
        <p className="text-xs text-stone-300 mt-1 max-w-xs mx-auto">
          Отслеживание статуса доставки и история ваших букетов
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-[#36251E] p-1 rounded-2xl border border-[#523B2F] text-xs font-semibold">
        <button
          onClick={() => setActiveFilter('active')}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFilter === 'active'
              ? 'bg-[#F4B6C2] text-[#3E2C23] font-bold shadow-sm'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <span>Активные</span>
          {activeOrders.length > 0 && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === 'active' ? 'bg-[#3E2C23] text-white' : 'bg-[#F4B6C2] text-[#3E2C23]'
            }`}>
              {activeOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter('completed')}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeFilter === 'completed'
              ? 'bg-[#F4B6C2] text-[#3E2C23] font-bold shadow-sm'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          <span>Доставленные</span>
          {completedOrders.length > 0 && (
            <span className="text-[10px] bg-white/20 text-stone-200 px-1.5 py-0.2 rounded-full font-bold">
              {completedOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#F4B6C2] text-[#3E2C23] font-bold shadow-sm'
              : 'text-stone-300 hover:text-white'
          }`}
        >
          Все ({orders.length})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white text-[#2D1F18] rounded-3xl p-8 text-center shadow-xl border border-stone-100 my-4">
          <div className="w-16 h-16 rounded-full bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center mx-auto mb-3 text-2xl shadow-inner">
            🌸
          </div>
          <h3 className="font-serif-fleur text-lg font-bold text-[#2D1F18]">
            {activeFilter === 'active' ? 'Нет активных заказов' : 'Заказов не найдено'}
          </h3>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {activeFilter === 'active'
              ? 'Здесь будет отображаться живой статус сборки и доставки вашего букета'
              : 'Вы пока не оформляли заказы в бутике Fleur'}
          </p>

          <button
            onClick={onOpenCatalog}
            className="mt-5 bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold text-xs py-3 px-6 rounded-2xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Выбрать букет в каталоге</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const currentStatus = order.orderStatus || 'waiting_delivery';
            const statusInfo = getStatusBadge(currentStatus);
            const isCompleted = currentStatus === 'delivered';

            return (
              <div
                key={order.orderId}
                className="bg-white text-[#2D1F18] rounded-3xl p-5 shadow-xl border border-stone-100 space-y-4 overflow-hidden relative"
              >
                {/* Header: Order Number & Date */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-[#3E2C23]">
                      #{order.orderId}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      от {order.createdAt}
                    </span>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${statusInfo.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
                    <span>{statusInfo.label}</span>
                  </div>
                </div>

                {/* Visual Delivery Status Progress Stepper */}
                <div className="bg-[#FAF6F0] rounded-2xl p-3.5 border border-stone-200/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Этап выполнения заказа
                    </span>
                    <span className="text-[11px] font-bold text-[#3E2C23] flex items-center gap-1">
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* 4-Step Progress Bar */}
                  <div className="grid grid-cols-4 gap-1.5 my-2">
                    <div className={`h-1.5 rounded-full transition-colors ${statusInfo.step >= 1 ? 'bg-[#C97A8B]' : 'bg-stone-200'}`} />
                    <div className={`h-1.5 rounded-full transition-colors ${statusInfo.step >= 2 ? 'bg-[#C97A8B]' : 'bg-stone-200'}`} />
                    <div className={`h-1.5 rounded-full transition-colors ${statusInfo.step >= 3 ? 'bg-[#C97A8B]' : 'bg-stone-200'}`} />
                    <div className={`h-1.5 rounded-full transition-colors ${statusInfo.step >= 4 ? 'bg-emerald-500' : 'bg-stone-200'}`} />
                  </div>

                  <p className="text-[11px] text-stone-600 mt-1.5">
                    {statusInfo.subtext}
                  </p>
                </div>

                {/* Major Characteristics: Items */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold text-[#3E2C23] uppercase tracking-wider">
                    Состав букета и характеристики
                  </div>

                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 bg-stone-50/80 p-2.5 rounded-2xl border border-stone-100"
                    >
                      <img
                        src={item.bouquet.image}
                        alt={item.bouquet.name}
                        className="w-14 h-14 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200/70"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif-fleur font-bold text-sm text-[#2D1F18] truncate">
                          {item.bouquet.name}
                        </h4>
                        <div className="text-[11px] text-stone-500 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                          <span className="font-semibold text-[#C97A8B]">
                            {item.stemCount} цветов
                          </span>
                          <span>•</span>
                          <span>{item.wrapper?.name || 'Фирменная упаковка'}</span>
                          <span>•</span>
                          <span>{item.quantity} шт</span>
                        </div>
                      </div>
                      <div className="text-right font-serif-fleur font-bold text-xs text-[#3E2C23] whitespace-nowrap">
                        {(item.unitPrice * item.quantity).toLocaleString('ru-RU')}&nbsp;₽
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Verification Status Box */}
                <div className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                  order.paymentStatus === 'reviewing'
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : order.paymentStatus === 'paid'
                    ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                    : 'bg-stone-50 border-stone-200 text-stone-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Статус оплаты:</span>
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      order.paymentStatus === 'paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.paymentStatus === 'reviewing'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-200 text-stone-700'
                    }`}>
                      {order.paymentStatus === 'paid' ? '✅ Оплата подтверждена' :
                       order.paymentStatus === 'reviewing' ? '⏳ Чек на проверке' : '⏳ Ожидает оплаты'}
                    </span>
                  </div>

                  {order.paymentStatus === 'reviewing' && (
                    <p className="text-[11px] text-amber-900 leading-snug">
                      Флорист сверяет поступление {order.finalTotal.toLocaleString('ru-RU')} ₽ на счёт самозанятой. После подтверждения статуса начнется сборка букета.
                    </p>
                  )}

                  {order.paymentStatus === 'paid' && (
                    <p className="text-[11px] text-emerald-900 leading-snug">
                      Оплата успешно зачислена! Букет собирается и доставляется флористами Fleur.
                    </p>
                  )}

                  {order.receiptImage && (
                    <div className="flex items-center gap-2 pt-1 border-t border-black/5">
                      <img
                        src={order.receiptImage}
                        alt="Чек об оплате"
                        onClick={() => setViewingReceipt(order.receiptImage!)}
                        className="w-10 h-10 object-cover rounded-lg border border-stone-300 cursor-pointer hover:opacity-90 transition-opacity shrink-0 shadow-2xs"
                        title="Нажмите для увеличения чека"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-stone-500 block">Прикрепленный чек:</span>
                        <button
                          type="button"
                          onClick={() => setViewingReceipt(order.receiptImage!)}
                          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                        >
                          Посмотреть фото чека
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delivery & Recipient Details */}
                <div className="bg-[#FAF6F0] rounded-2xl p-3 text-xs space-y-2 border border-stone-200/60">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#C97A8B] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-stone-400 text-[10px] block font-semibold">Дата и слот доставки:</span>
                      <span className="font-bold text-[#3E2C23]">
                        {order.form.deliveryDate}, {order.form.deliveryTimeSlot}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C97A8B] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-stone-400 text-[10px] block font-semibold">Адрес доставки:</span>
                      <span className="font-medium text-[#3E2C23]">
                        {order.form.contactRecipient ? 'Уточнить у получателя по телефону' : order.form.deliveryAddress}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#C97A8B] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-stone-400 text-[10px] block font-semibold">Получатель:</span>
                      <span className="font-medium text-[#3E2C23]">
                        {order.form.recipientPhone} {order.form.sendAsSurprise ? '(Доставка-сюрприз)' : ''}
                      </span>
                    </div>
                  </div>

                  {order.form.cardMessage && (
                    <div className="flex items-start gap-2 pt-1 border-t border-stone-200/60">
                      <MessageSquare className="w-3.5 h-3.5 text-[#C97A8B] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span className="text-stone-400 text-[10px] block font-semibold">Текст на открытке Fleur:</span>
                        <p className="text-[11px] italic text-stone-700">«{order.form.cardMessage}»</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer: Payment Method & Total & Support */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-stone-400 font-semibold uppercase">
                      Оплата: {order.paymentMethod === 'stars' ? '⭐ Telegram Stars' : order.paymentMethod === 'sbp' ? '⚡ СБП' : '💳 Карта'}
                    </div>
                    <div className="font-serif-fleur font-black text-base text-[#3E2C23]">
                      {order.finalTotal.toLocaleString('ru-RU')}&nbsp;₽
                      {order.paymentMethod === 'stars' && (
                        <span className="text-xs text-amber-600 font-mono ml-1.5">
                          ({order.starsAmount} ⭐)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Bot / Support Button */}
                  <a
                    href={storeSettings.telegramSupportUrl || 'https://t.me/linaloveinal'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#3E2C23] hover:bg-[#4E382D] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5 text-[#F4B6C2]" />
                    <span>Чат с бутиком</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-Screen Receipt View Modal for Customer */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative bg-white rounded-3xl max-w-sm w-full max-h-[85vh] overflow-hidden flex flex-col text-[#2D1F18] shadow-2xl">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18]">
                Ваш прикрепленный чек
              </h3>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-stone-100">
              <img
                src={viewingReceipt}
                alt="Чек об оплате"
                className="max-h-[55vh] max-w-full object-contain rounded-xl shadow-md border border-stone-300"
              />
            </div>

            <div className="p-3 border-t border-stone-200 bg-white text-center">
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="w-full bg-[#3E2C23] hover:bg-[#4E382D] text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer"
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
