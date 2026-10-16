import React, { useState } from 'react';
import { Sparkles, Gift, Copy, Check, Star, ShieldCheck, Heart, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BonusesScreenProps {
  userBonusPoints: number;
  onAddBonusPoints: (points: number) => void;
  onOpenCatalog: () => void;
  ordersCount?: number;
}

export function BonusesScreen({ 
  userBonusPoints, 
  onAddBonusPoints, 
  onOpenCatalog,
  ordersCount = 0 
}: BonusesScreenProps) {
  const [copiedPromo, setCopiedPromo] = useState(false);
  const getTodayStr = () => new Date().toISOString().slice(0, 10);

  const [claimedToday, setClaimedToday] = useState<boolean>(() => {
    try {
      const lastClaim = localStorage.getItem('fleur_last_daily_bonus_date');
      return lastClaim === new Date().toISOString().slice(0, 10);
    } catch {
      return false;
    }
  });
  const [lastWonPoints, setLastWonPoints] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem('fleur_last_daily_bonus_points');
      return saved ? parseInt(saved, 10) : null;
    } catch {
      return null;
    }
  });

  const handleClaimDailyBonus = () => {
    if (claimedToday) return;

    // Random roll between 15 and 50 points
    const pointsOptions = [15, 20, 25, 30, 35, 40, 50];
    const rolled = pointsOptions[Math.floor(Math.random() * pointsOptions.length)];
    const today = getTodayStr();

    localStorage.setItem('fleur_last_daily_bonus_date', today);
    localStorage.setItem('fleur_last_daily_bonus_points', String(rolled));

    setLastWonPoints(rolled);
    setClaimedToday(true);
    onAddBonusPoints(rolled);

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F4B6C2', '#FAF6F0', '#FFD700', '#FDE8ED'],
      });
    } catch (e) {}
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText('FIRST');
    setCopiedPromo(true);
    setTimeout(() => setCopiedPromo(false), 2000);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="text-center pt-1 pb-1">
        <h2 className="font-serif-fleur text-2xl text-[#FAF6F0] font-normal tracking-wide">
          Привилегии & Бонусы
        </h2>
        <p className="text-xs text-stone-300 mt-1 max-w-xs mx-auto">
          Получайте баллы каждый день и оплачивайте ими до 30% стоимости букетов
        </p>
      </div>

      {/* Main Points Card (White with rounded corners) */}
      <div className="bg-white text-[#2D1F18] rounded-3xl p-5 shadow-xl border border-stone-100 text-center relative overflow-hidden">
        <div className="w-14 h-14 rounded-2xl bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Award className="w-7 h-7" />
        </div>

        <div className="text-xs text-stone-500 uppercase tracking-wider font-semibold">
          Ваш баланс баллов Fleur
        </div>
        <div className="font-serif-fleur text-4xl font-extrabold text-[#3E2C23] mt-1">
          {userBonusPoints} <span className="text-xl font-normal text-[#C97A8B]">баллов</span>
        </div>
        <p className="text-[11px] text-stone-500 mt-1">
          1 балл = 1 рубль скидки при заказе
        </p>

        {/* Daily Bonus Button: Strictly 1 time per day */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          {claimedToday ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-800 font-bold flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-1.5 text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Ежедневный бонус {lastWonPoints ? `+${lastWonPoints} баллов` : ''} уже получен сегодня ✨</span>
              </div>
              <span className="text-[10px] text-emerald-600/80 font-normal">Следующий бонус будет доступен завтра</span>
            </div>
          ) : (
            <button
              onClick={handleClaimDailyBonus}
              className="w-full bg-[#F4B6C2] hover:bg-[#e8a3b0] active:scale-[0.98] text-[#3E2C23] font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-xl shadow-[#F4B6C2]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Забрать ежедневный бонус (15–50 баллов)</span>
            </button>
          )}
        </div>
      </div>

      {/* Promo Code "FIRST" Card: ONLY displayed if user has NOT completed an order yet */}
      {ordersCount === 0 ? (
        <div className="bg-white text-[#2D1F18] rounded-3xl p-5 shadow-xl border border-stone-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-fleur font-bold text-sm text-[#2D1F18]">
                  Скидка 10% на первый заказ
                </h3>
                <p className="text-[10px] text-stone-500">
                  Приветственный подарок для нового клиента
                </p>
              </div>
            </div>
            <span className="bg-[#FFD700]/20 text-amber-800 border border-[#FFD700]/40 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
              1-й заказ
            </span>
          </div>

          {/* Coupon Code Block */}
          <div className="bg-[#FAF6F0] border border-stone-200/80 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-stone-400 font-semibold uppercase">Промокод</div>
              <div className="font-mono text-base font-black tracking-widest text-[#3E2C23]">
                FIRST
              </div>
            </div>

            <button
              onClick={copyPromoCode}
              className="flex items-center gap-1.5 bg-[#3E2C23] hover:bg-[#4E382D] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              {copiedPromo ? <Check className="w-3.5 h-3.5 text-[#F4B6C2]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPromo ? 'Скопировано!' : 'Скопировать'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-50 to-[#FAF6F0] text-[#2D1F18] rounded-3xl p-4 shadow-md border border-amber-200/70 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFD700]/20 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
            👑
          </div>
          <div>
            <div className="text-xs font-bold text-[#3E2C23]">
              Вы постоянный клиент клуба Fleur
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              С каждого вашего заказа начисляется персональный кешбэк баллами!
            </div>
          </div>
        </div>
      )}

      {/* VIP Club Perks */}
      <div className="bg-white text-[#2D1F18] rounded-3xl p-5 shadow-xl border border-stone-100 space-y-3">
        <h3 className="font-serif-fleur font-bold text-sm text-[#2D1F18]">
          Привилегии клуба Fleur
        </h3>

        <div className="space-y-2.5 text-xs text-stone-600">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>Кешбэк баллами и Telegram Stars с каждого заказа</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>Бесплатная открытка ручной работы от флориста к каждому букету</span>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <span>Аквабокс со свежей водой и подкормкой кризал для продления жизни цветов</span>
          </div>
        </div>

        <button
          onClick={onOpenCatalog}
          className="w-full mt-3 bg-[#FAF6F0] hover:bg-[#f3ece2] text-[#3E2C23] font-bold py-2.5 rounded-2xl text-xs transition-colors cursor-pointer"
        >
          Выбрать букет со скидкой
        </button>
      </div>
    </div>
  );
}
