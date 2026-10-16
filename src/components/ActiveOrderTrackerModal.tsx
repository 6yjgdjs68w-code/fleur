import React, { useState, useEffect } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { OrderRecord } from '../data/storeData';
import { 
  X, CheckCircle, Clock, MapPin, Phone, MessageSquare, 
  ChefHat, Bike, ShieldCheck, Sparkles 
} from 'lucide-react';

interface ActiveOrderTrackerModalProps {
  order: OrderRecord;
  onClose: () => void;
}

export function ActiveOrderTrackerModal({ order, onClose }: ActiveOrderTrackerModalProps) {
  const { triggerHaptic } = useTelegram();
  const [currentStep, setCurrentStep] = useState<number>(2); // 1: Confirmed, 2: Cooking, 3: Delivering, 4: Delivered
  const [minutesLeft, setMinutesLeft] = useState<number>(26);

  useEffect(() => {
    const timer = setInterval(() => {
      setMinutesLeft((prev) => (prev > 1 ? prev - 1 : 1));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const steps = [
    { num: 1, label: 'Принят', desc: 'Ресторан принял заказ' },
    { num: 2, label: 'Кухня', desc: 'Шеф собирает блюда' },
    { num: 3, label: 'Доставка', desc: 'Курьер мчит по адресу' },
    { num: 4, label: 'У двери', desc: 'Приятного аппетита' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-5 animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-400 font-mono">{order.id}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h3 className="font-bold text-base text-white mt-0.5">Отслеживание заказа</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ETA Badge */}
        <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg mb-4 text-center">
          <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80 mb-1">
            Примерное время доставки
          </div>
          <div className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-sky-200" />
            <span>~{minutesLeft} минут</span>
          </div>
          <div className="text-xs text-sky-100 mt-1">
            {order.deliveryAddress}
          </div>
        </div>

        {/* Steps Timeline */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-4">
          <div className="grid grid-cols-4 gap-2 text-center relative mb-4">
            {/* Progress line */}
            <div className="absolute top-3.5 left-6 right-6 h-1 bg-slate-800 -z-0">
              <div 
                className="h-full bg-sky-500 transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
            </div>

            {steps.map((st) => {
              const isDone = st.num < currentStep;
              const isCurrent = st.num === currentStep;

              return (
                <div key={st.num} className="flex flex-col items-center z-10">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-sky-500 text-white ring-4 ring-sky-500/20 animate-pulse'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? <CheckCircle className="w-4 h-4" /> : st.num}
                  </div>
                  <div className={`text-[10px] font-bold mt-1.5 ${isCurrent ? 'text-sky-400' : 'text-slate-400'}`}>
                    {st.label}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-xs text-slate-300 text-center bg-slate-900 rounded-xl p-2.5 border border-slate-800">
            {currentStep === 2 && (
              <div className="flex items-center justify-center gap-2 text-amber-300 font-medium">
                <ChefHat className="w-4 h-4" />
                <span>Пицца выпекается в печи при 380°C. Добавлена свежая руккола.</span>
              </div>
            )}
            {currentStep === 3 && (
              <div className="flex items-center justify-center gap-2 text-sky-300 font-medium">
                <Bike className="w-4 h-4" />
                <span>Курьер забрал заказ из ресторана и едет к вам.</span>
              </div>
            )}
          </div>
        </div>

        {/* Courier Info Card */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
                alt="Курьер"
                className="w-11 h-11 rounded-full object-cover border border-sky-500/40"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-slate-950" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Алексей (Курьер)</span>
                <span className="text-[10px] text-amber-400">★ 4.98</span>
              </div>
              <div className="text-[11px] text-slate-400">Электроскутер • Везет в термосумке</div>
            </div>
          </div>

          <button
            onClick={() => triggerHaptic('light')}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 active:scale-95 transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-sky-400" />
            <span>Звонок</span>
          </button>
        </div>

        {/* Order Items Summary */}
        <div className="bg-slate-950/50 border border-slate-800/80 rounded-2xl p-3.5 mb-4 text-xs space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Содержимое заказа
          </div>
          {order.items.map((it, idx) => (
            <div key={idx} className="flex justify-between items-center py-1 border-b border-slate-800/40 last:border-0">
              <span className="text-slate-300">{it.quantity}× {it.name}</span>
              <span className="font-bold text-white">{(it.price * it.quantity).toLocaleString()} ₽</span>
            </div>
          ))}
          <div className="pt-2 flex justify-between font-extrabold text-sm border-t border-slate-800">
            <span className="text-slate-300">Итого:</span>
            <span className="text-sky-400">{order.total.toLocaleString()} ₽</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition-all"
        >
          Вернуться в приложение
        </button>
      </div>
    </div>
  );
}
