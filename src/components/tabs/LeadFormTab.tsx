import React, { useState, useEffect } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { Send, CheckCircle, User, ShieldCheck, Briefcase, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

export function LeadFormTab() {
  const { user, triggerHaptic, sendDataToBot, setMainButton } = useTelegram();
  const [serviceType, setServiceType] = useState('tma_shop');
  const [budget, setBudget] = useState('medium');
  const [description, setDescription] = useState('Хочу создать магазин кроссовок в Telegram с приемом платежей через СБП и Stars.');
  const [contactPhone, setContactPhone] = useState('+7 (999) 000-00-00');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const services = [
    { id: 'tma_shop', label: '🛍️ Магазин / Mini App', desc: 'Каталог, корзина, оплата Stars & картой' },
    { id: 'tap_game', label: '🎮 Кликер / Web3 игра', desc: 'Вирусная механика, бусты, лидерборды' },
    { id: 'booking', label: '📅 Онлайн-запись / CRM', desc: 'Выбор времени, бронь, напоминания' },
    { id: 'bot_custom', label: '🤖 Telegram бот с ИИ', desc: 'Автоответчик, поддержка 24/7' },
  ];

  const budgets = [
    { id: 'starter', label: 'До 30 000 ₽', sub: 'Базовый MVP' },
    { id: 'medium', label: '30 000 — 70 000 ₽', sub: 'Стандарт' },
    { id: 'pro', label: 'От 70 000 ₽', sub: 'Сложный проект' },
  ];

  const handleSubmit = () => {
    triggerHaptic('success');
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}

    const payload = {
      action: 'new_lead_submission',
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        is_premium: user.is_premium,
      },
      service: serviceType,
      budget,
      description,
      phone: contactPhone,
      submitted_at: new Date().toISOString(),
    };

    sendDataToBot(payload);
    setIsSubmitted(true);
  };

  useEffect(() => {
    if (isSubmitted) {
      setMainButton({
        isVisible: true,
        text: 'Отправить еще одну заявку',
        color: '#10b981',
        callback: () => setIsSubmitted(false),
      });
    } else {
      setMainButton({
        isVisible: true,
        text: 'Отправить заявку в Telegram',
        color: '#2481cc',
        callback: handleSubmit,
      });
    }
  }, [isSubmitted, serviceType, budget, description, contactPhone]);

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-sky-400" />
          <span>Заявка на разработку в Telegram</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Пример формы сбора лидов с автоматическим заполнением профиля пользователя Telegram
        </p>
      </div>

      {isSubmitted ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center animate-in zoom-in-95">
          <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Заявка успешно отправлена!</h3>
          <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
            Менеджер свяжется с вами прямо в Telegram по аккаунту <span className="text-sky-400 font-semibold">@{user.username || 'user'}</span>.
          </p>

          <div className="mt-5 bg-slate-950 rounded-xl p-3 text-left border border-slate-800/80 text-xs">
            <div className="text-slate-500 text-[10px] uppercase font-semibold mb-2">Переданный пакет данных:</div>
            <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify({ service: serviceType, budget, phone: contactPhone }, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* User Auto-Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={user.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.first_name}
                  className="w-10 h-10 rounded-full object-cover border border-sky-500/40"
                />
                {user.is_premium && (
                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full p-0.5 text-[9px]">
                    ⭐
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>{user.first_name} {user.last_name || ''}</span>
                  {user.is_premium && (
                    <span className="text-[10px] text-amber-400 font-normal">Premium</span>
                  )}
                </div>
                <div className="text-[11px] text-sky-400">@{user.username || 'tg_user'} • ID: {user.id}</div>
              </div>
            </div>
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-1 rounded-md">
              Авторизован в TG
            </span>
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Какой проект планируете?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {services.map((item) => {
                const isSelected = serviceType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setServiceType(item.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-sky-500/10 border-sky-500 text-white shadow-sm shadow-sky-500/10'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Ориентировочный бюджет
            </label>
            <div className="grid grid-cols-3 gap-2">
              {budgets.map((b) => {
                const isSelected = budget === b.id;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setBudget(b.id);
                    }}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500 text-sky-300 font-semibold'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{b.label}</div>
                    <div className="text-[10px] text-slate-400">{b.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              <span>Опишите вашу идею или задачи</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              placeholder="Например: нужен интернет-магазин цветов с приемом оплат и выбором времени доставки..."
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Телефон для связи (опционально)
            </label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
              placeholder="+7 (999) 000-00-00"
            />
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-sky-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Отправить заявку разработчику</span>
          </button>
        </div>
      )}
    </div>
  );
}
