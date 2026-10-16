import React from 'react';
import { useTelegram } from '../context/TelegramContext';
import { OrderRecord } from '../data/storeData';
import { 
  X, User, ShieldCheck, Clock, MapPin, Repeat, MessageCircle, 
  ExternalLink, Moon, Sun, ChevronRight, Star, Heart 
} from 'lucide-react';

interface UserProfileModalProps {
  onClose: () => void;
  orders: OrderRecord[];
  onReorder: (order: OrderRecord) => void;
  starsBalance: number;
}

export function UserProfileModal({ onClose, orders, onReorder, starsBalance }: UserProfileModalProps) {
  const { user, triggerHaptic, theme, setTheme } = useTelegram();

  const handleSupportClick = () => {
    triggerHaptic('light');
    const supportUrl = 'https://t.me/telegram';
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(supportUrl);
    } else {
      window.open(supportUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-5 animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="font-bold text-base text-white">Профиль пользователя</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Telegram User Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user.first_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-sky-500/50"
              />
              {user.is_premium && (
                <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow">
                  ⭐
                </span>
              )}
            </div>

            <div>
              <div className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>{user.first_name} {user.last_name || ''}</span>
                {user.is_premium && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
                    Premium
                  </span>
                )}
              </div>
              <div className="text-xs text-sky-400 font-medium mt-0.5">
                @{user.username || 'tg_user'}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Постоянный гость</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-extrabold text-amber-300 flex items-center justify-end gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{starsBalance} ⭐</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Баланс бонусов</div>
          </div>
        </div>

        {/* VIP Loyalty Card */}
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm">
              👑
            </div>
            <div>
              <div className="font-bold text-white text-xs">Статус: Gold Privilege</div>
              <div className="text-[11px] text-amber-200/80">Кешбэк 15% звезд на все заказы</div>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-1 rounded-lg">
            Активен
          </span>
        </div>

        {/* Quick Menu / Settings */}
        <div className="space-y-2 mb-5">
          <button
            onClick={handleSupportClick}
            className="w-full bg-slate-950/60 hover:bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs transition-all"
          >
            <div className="flex items-center gap-2.5 text-slate-200">
              <MessageCircle className="w-4 h-4 text-sky-400" />
              <span className="font-semibold">Служба заботы в Telegram (24/7)</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setTheme(theme === 'telegram-dark' ? 'telegram-light' : 'telegram-dark');
            }}
            className="w-full bg-slate-950/60 hover:bg-slate-950 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between text-xs transition-all"
          >
            <div className="flex items-center gap-2.5 text-slate-200">
              {theme === 'telegram-dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span className="font-semibold">Тема оформления</span>
            </div>
            <span className="text-[11px] text-slate-400">{theme === 'telegram-dark' ? 'Темная' : 'Светлая'}</span>
          </button>
        </div>

        {/* Orders History */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>История заказов ({orders.length})</span>
            </h4>
          </div>

          <div className="space-y-2.5">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white font-mono">{ord.id}</span>
                  <span className="text-[10px] text-slate-400">{ord.date}</span>
                </div>

                <div className="text-[11px] text-slate-300 line-clamp-1 mb-2">
                  {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="font-extrabold text-sky-400">{ord.total.toLocaleString()} ₽</span>
                  <button
                    onClick={() => {
                      triggerHaptic('success');
                      onReorder(ord);
                      onClose();
                    }}
                    className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-700 active:scale-95 transition-all"
                  >
                    <Repeat className="w-3 h-3 text-sky-400" />
                    <span>Повторить заказ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
