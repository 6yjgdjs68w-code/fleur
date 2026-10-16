import React, { useState } from 'react';
import { X, Star, Award, User, Check, Sparkles, ShieldCheck, ArrowRight, RefreshCw, Edit3, KeyRound } from 'lucide-react';
import { getTelegramUser, getUserStorageKey } from '../../services/telegramUser';
import { LoyaltyTier } from '../../types/loyalty';
import { UserRole } from '../../types/fleur';

interface UserAccountModalProps {
  userStarsBalance: number;
  userBonusPoints: number;
  ordersCount: number;
  userTier: LoyaltyTier;
  onUpdateStarsBalance: (stars: number) => void;
  onClose: () => void;
  onOpenOrders: () => void;
  onOpenBonuses: () => void;
  userRole?: UserRole;
  onSwitchRole?: (role: UserRole) => void;
  onRequestAdminLogin?: () => void;
  onOpenAdminPanel?: () => void;
}

export function UserAccountModal({
  userStarsBalance,
  userBonusPoints,
  ordersCount,
  userTier,
  onUpdateStarsBalance,
  onClose,
  onOpenOrders,
  onOpenBonuses,
  userRole = 'client',
  onSwitchRole,
  onRequestAdminLogin,
  onOpenAdminPanel,
}: UserAccountModalProps) {
  const tgUser = getTelegramUser();
  const [isEditingStars, setIsEditingStars] = useState(false);
  const [customStarsInput, setCustomStarsInput] = useState<string>(String(userStarsBalance));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const displayName = tgUser
    ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}`
    : 'Гость бутика Fleur';

  const username = tgUser?.username ? `@${tgUser.username}` : null;
  const telegramId = tgUser?.id ? String(tgUser.id) : 'Локальный сеанс';

  const handleSaveCustomStars = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customStarsInput, 10);
    const validStars = isNaN(parsed) || parsed < 0 ? 0 : parsed;
    onUpdateStarsBalance(validStars);
    setIsEditingStars(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const setPresetStars = (amount: number) => {
    setCustomStarsInput(String(amount));
    onUpdateStarsBalance(amount);
    setIsEditingStars(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-white text-[#2D1F18] shadow-2xl p-5 border border-stone-100 flex flex-col space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3E2C23] to-[#5A4236] text-white flex items-center justify-center font-bold text-base shadow-sm overflow-hidden">
              {tgUser?.photo_url ? (
                <img src={tgUser.photo_url} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-[#F4B6C2]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif-fleur font-bold text-sm text-[#2D1F18] leading-tight">
                  {displayName}
                </h3>
                {tgUser?.is_premium && (
                  <span className="text-[10px] text-amber-500 font-bold" title="Telegram Premium">⭐</span>
                )}
              </div>
              <div className="text-[11px] text-stone-500 font-mono">
                {username ? username : `ID: ${telegramId}`}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telegram Stars Balance Card */}
        <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-[#FAF6F0] rounded-2xl p-4 border border-amber-200/80 shadow-xs space-y-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center font-bold text-base">
                ⭐
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80">
                  Баланс Telegram Stars
                </div>
                <div className="font-serif-fleur text-2xl font-black text-amber-950 flex items-center gap-1.5">
                  <span>{userStarsBalance.toLocaleString('ru-RU')}</span>
                  <span className="text-sm font-normal text-amber-700">Stars (XTR)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditingStars(!isEditingStars)}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingStars ? 'Отмена' : 'Изменить'}</span>
            </button>
          </div>

          <p className="text-[10px] text-stone-600 leading-snug">
            Официальные цифровые звёзды вашего Telegram-аккаунта. Ими можно оплачивать букеты в нашем бутике.
          </p>

          {/* Edit Stars Amount Form */}
          {isEditingStars ? (
            <form onSubmit={handleSaveCustomStars} className="bg-white p-3 rounded-xl border border-amber-300 space-y-2 animate-in zoom-in-95">
              <label className="text-[10px] font-bold text-stone-700 block">
                Укажите точное количество Stars на вашем счёте в Telegram:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={customStarsInput}
                  onChange={(e) => setCustomStarsInput(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-stone-50 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                >
                  Сохранить
                </button>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 pt-1 text-[10px]">
                <span className="text-stone-400">Быстрый выбор:</span>
                {[0, 50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setPresetStars(amt)}
                    className="bg-stone-100 hover:bg-amber-100 text-stone-700 font-bold px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    {amt} ⭐
                  </button>
                ))}
              </div>
            </form>
          ) : savedSuccess ? (
            <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Баланс звёзд успешно обновлён!</span>
            </div>
          ) : null}
        </div>

        {/* Bonus Points Card */}
        <div className="bg-[#FAF6F0] rounded-2xl p-3.5 border border-stone-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center font-bold text-sm">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-stone-500 uppercase font-semibold">
                Баллы лояльности Fleur
              </div>
              <div className="font-serif-fleur text-lg font-bold text-[#3E2C23]">
                {userBonusPoints} <span className="text-xs font-normal text-[#C97A8B]">баллов (₽)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenBonuses();
            }}
            className="bg-[#3E2C23] hover:bg-[#4E382D] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl cursor-pointer transition-all active:scale-95"
          >
            Бонусы
          </button>
        </div>

        {/* Loyalty Tier Info */}
        <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">{userTier.badge}</span>
            <div>
              <div className="font-bold text-[#2D1F18]">{userTier.name} Member</div>
              <div className="text-[10px] text-stone-500">
                Заказов оформлено: <strong>{ordersCount}</strong> • Клуб: <strong>{userTier.name}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenOrders();
            }}
            className="text-[11px] text-[#C97A8B] font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
          >
            <span>Заказы</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* User Role Card (Telegram CloudStorage Synced) */}
        <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                userRole === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
              }`}>
                {userRole === 'admin' ? <ShieldCheck className="w-4 h-4 text-amber-600" /> : <User className="w-4 h-4 text-stone-600" />}
              </div>
              <div>
                <div className="text-[10px] text-stone-500 uppercase font-semibold flex items-center gap-1">
                  <span>Роль пользователя</span>
                  <span className="text-[9px] bg-sky-100 text-sky-800 px-1 py-0.2 rounded font-normal">
                    CloudStorage ☁️
                  </span>
                </div>
                <div className="font-bold text-xs text-[#2D1F18]">
                  {userRole === 'admin' ? 'Администратор бутика' : 'Клиент (Покупатель)'}
                </div>
              </div>
            </div>

            {userRole === 'admin' ? (
              <div className="flex items-center gap-1.5">
                {onOpenAdminPanel && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminPanel();
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-2.5 py-1 rounded-xl text-[10px] cursor-pointer transition-all active:scale-95"
                  >
                    Панель
                  </button>
                )}
                {onSwitchRole && (
                  <button
                    onClick={() => onSwitchRole('client')}
                    className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold px-2 py-1 rounded-xl text-[10px] cursor-pointer transition-all active:scale-95"
                    title="Переключиться в режим клиента"
                  >
                    Выйти
                  </button>
                )}
              </div>
            ) : (
              onRequestAdminLogin && (
                <button
                  onClick={() => {
                    onClose();
                    onRequestAdminLogin();
                  }}
                  className="bg-[#3E2C23] hover:bg-[#5A4236] text-white font-bold px-2.5 py-1.5 rounded-xl text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                >
                  <KeyRound className="w-3 h-3 text-[#F4B6C2]" />
                  <span>Войти как админ</span>
                </button>
              )
            )}
          </div>
          <div className="text-[10px] text-stone-500 leading-snug">
            {userRole === 'admin'
              ? 'Ваша роль администратора сохранена в Telegram CloudStorage и остаётся активной при повторных входах.'
              : 'Обычный клиентский режим. Вы можете войти по PIN-коду администратора, и роль сохранится.'}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-[#FAF6F0] hover:bg-[#f0e8de] text-[#3E2C23] font-bold py-2.5 rounded-2xl text-xs transition-colors cursor-pointer"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
