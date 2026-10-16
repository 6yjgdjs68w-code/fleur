import React, { useState } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { X, Star, Gift, Share2, Check, Sparkles, Trophy, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LoyaltyStarsModalProps {
  onClose: () => void;
  starsBalance: number;
  onClaimDailyStreak: (bonus: number) => void;
}

export function LoyaltyStarsModal({ onClose, starsBalance, onClaimDailyStreak }: LoyaltyStarsModalProps) {
  const { triggerHaptic, appUrl, user } = useTelegram();
  const [claimedDay, setClaimedDay] = useState<number | null>(null);

  const streakDays = [
    { day: 1, reward: 20, isCurrent: true },
    { day: 2, reward: 30 },
    { day: 3, reward: 40 },
    { day: 4, reward: 60 },
    { day: 5, reward: 80 },
    { day: 6, reward: 100 },
    { day: 7, reward: 200, isBig: true },
  ];

  const handleClaim = (day: number, amount: number) => {
    if (claimedDay) return;
    triggerHaptic('success');
    setClaimedDay(day);
    onClaimDailyStreak(amount);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#38bdf8'],
      });
    } catch (e) {}
  };

  const shareTelegramLink = () => {
    triggerHaptic('light');
    const shareText = encodeURIComponent(`Заказывай вкуснейшую пиццу и роллы в Telegram Mini App и получи скидку 20%! ⭐`);
    const shareUrl = encodeURIComponent(appUrl);
    const tgUrl = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`;
    
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(tgUrl);
    } else {
      window.open(tgUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-5 animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ⭐
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Клуб Telegram Stars</h3>
              <div className="text-[11px] text-slate-400">Программа лояльности и бонусы</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-amber-500/25 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-5 text-center mb-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 text-8xl pointer-events-none">
            ⭐
          </div>
          <div className="text-xs text-amber-300 font-semibold uppercase tracking-wider mb-1">
            Ваш бонусный баланс
          </div>
          <div className="text-4xl font-black text-white flex items-center justify-center gap-2">
            <span className="text-amber-400">⭐</span>
            <span>{starsBalance.toLocaleString()} Stars</span>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Эквивалентно <strong>{(starsBalance * 2).toLocaleString()} ₽</strong> скидки на ваши заказы
          </p>
        </div>

        {/* Daily Streak Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Ежедневные награды (Streak)</span>
            </div>
            <span className="text-[10px] text-slate-400">Заходите каждый день</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {streakDays.map((s) => {
              const isClaimed = claimedDay === s.day;

              return (
                <div
                  key={s.day}
                  className={`p-2 rounded-xl border text-center flex flex-col justify-between items-center transition-all ${
                    isClaimed
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-400'
                      : s.isCurrent
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-sm'
                      : 'bg-slate-950/80 border-slate-800/80 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-medium opacity-80">Д{s.day}</span>
                  <div className="my-1 text-sm font-black">
                    {isClaimed ? <Check className="w-4 h-4 mx-auto text-emerald-400" /> : `+${s.reward}`}
                  </div>
                  <span className="text-[9px] opacity-70">⭐</span>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => handleClaim(1, 20)}
            disabled={claimedDay !== null}
            className={`w-full mt-3 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              claimedDay !== null
                ? 'bg-slate-800 text-emerald-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md hover:from-amber-400 hover:to-yellow-400 active:scale-95'
            }`}
          >
            {claimedDay !== null ? (
              <>
                <Check className="w-4 h-4" />
                <span>Награда за сегодня получена (+20 ⭐)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Забрать награду дня (+20 ⭐)</span>
              </>
            )}
          </button>
        </div>

        {/* Invite friends banner */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Поделиться с друзьями</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Получите +50 ⭐ бонусов за каждого друга</div>
            </div>
          </div>

          <button
            onClick={shareTelegramLink}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Поделиться</span>
          </button>
        </div>
      </div>
    </div>
  );
}
