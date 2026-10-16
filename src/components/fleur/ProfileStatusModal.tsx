import React from 'react';
import { LoyaltyTier, LOYALTY_TIERS, getLoyaltyTier, LoyaltyTierKey } from '../../types/loyalty';
import { X, Award, Crown, Sparkles, Check, Lock, ChevronRight, Truck, Star, ShieldCheck } from 'lucide-react';

interface ProfileStatusModalProps {
  ordersCount: number;
  onClose: () => void;
}

export function ProfileStatusModal({
  ordersCount,
  onClose,
}: ProfileStatusModalProps) {
  const currentTier = getLoyaltyTier(ordersCount);

  // Compute orders remaining for next tier
  let nextTier: LoyaltyTier | null = null;
  let ordersNeeded = 0;
  let progressPercent = 100;

  if (ordersCount < 1) {
    nextTier = LOYALTY_TIERS.connoisseur;
    ordersNeeded = 1 - ordersCount;
    progressPercent = 0;
  } else if (ordersCount < 3) {
    nextTier = LOYALTY_TIERS.curator;
    ordersNeeded = 3 - ordersCount;
    progressPercent = Math.round(((ordersCount - 1) / (3 - 1)) * 100);
  } else if (ordersCount < 7) {
    nextTier = LOYALTY_TIERS.patron;
    ordersNeeded = 7 - ordersCount;
    progressPercent = Math.round(((ordersCount - 3) / (7 - 3)) * 100);
  } else if (ordersCount < 15) {
    nextTier = LOYALTY_TIERS.founders_circle;
    ordersNeeded = 15 - ordersCount;
    progressPercent = Math.round(((ordersCount - 7) / (15 - 7)) * 100);
  } else {
    nextTier = null;
    ordersNeeded = 0;
    progressPercent = 100;
  }

  const allTiersList = Object.values(LOYALTY_TIERS);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#2D1F18] border border-[#FFD700]/30 text-white shadow-2xl flex flex-col p-4 sm:p-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center pt-0.5 pb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] text-xs font-semibold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fleur Private Club</span>
          </div>
          <h2 className="font-serif-fleur text-xl sm:text-2xl text-[#FAF6F0] font-normal">
            Привилегии закрытого клуба
          </h2>
          <p className="text-[11px] text-stone-300 mt-0.5 max-w-xs mx-auto">
            Статус повышается автоматически с каждым выполненным заказом
          </p>
        </div>

        {/* Private Club Metal VIP Membership Card */}
        <div className="relative rounded-3xl p-4 sm:p-5 my-1.5 shadow-2xl overflow-hidden border border-[#FFD700]/40 text-stone-900 bg-gradient-to-br from-[#FFF3D1] via-[#FFE29A] to-[#D4AF37]">
          {/* Subtle Platinum/Gold Sheen Pattern */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/30 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 translate-x-3 translate-y-3 opacity-15 text-7xl font-serif select-none pointer-events-none">
            {currentTier.badge}
          </div>

          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[9px] font-bold uppercase tracking-widest text-stone-800/80 truncate">
                Клубная карта Fleur
              </div>
              <div className="font-serif-fleur text-xl sm:text-2xl font-black text-[#2D1F18] mt-0.5 flex items-center gap-1.5 truncate">
                <span>{currentTier.name}</span>
                <span className="text-base sm:text-lg shrink-0">{currentTier.badge}</span>
              </div>
            </div>

            <div className="bg-black/15 px-2.5 py-1 rounded-full text-[11px] font-bold text-stone-900 backdrop-blur-xs shrink-0 whitespace-nowrap">
              {ordersCount === 0 ? '0 заказов' : `${ordersCount} ${ordersCount === 1 ? 'заказ' : ordersCount < 5 ? 'заказа' : 'заказов'}`}
            </div>
          </div>

          <p className="relative z-10 text-[11px] sm:text-xs text-stone-800 mt-2 font-medium leading-relaxed">
            {currentTier.description}
          </p>

          {/* Progress Bar to next tier */}
          <div className="relative z-10 mt-3 pt-2.5 border-t border-stone-800/20">
            {nextTier ? (
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-900 mb-1 gap-2">
                  <span className="truncate">До статуса {nextTier.name} {nextTier.badge}:</span>
                  <span className="font-extrabold text-[#2D1F18] shrink-0 whitespace-nowrap">
                    {ordersNeeded} {ordersNeeded === 1 ? 'заказ' : ordersNeeded >= 2 && ordersNeeded <= 4 ? 'заказа' : 'заказов'}
                  </span>
                </div>
                <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#2D1F18] rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(8, progressPercent)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                <Crown className="w-4 h-4 text-stone-900 shrink-0" />
                <span>Вы достигли высшей ложи Founder's Circle!</span>
              </div>
            )}
          </div>
        </div>

        {/* Tier Hierarchy Showcase */}
        <div className="mt-4 space-y-2.5">
          <div className="text-xs font-bold text-[#FFD700] uppercase tracking-wider px-1">
            Все уровни привилегий клуба:
          </div>

          {allTiersList.map((tier) => {
            const isCurrent = currentTier.key === tier.key;
            const isUnlocked = ordersCount >= tier.minOrders;

            return (
              <div
                key={tier.key}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-gradient-to-r from-[#4A352B] to-[#3E2C23] border-[#FFD700] ring-1 ring-[#FFD700]/50 shadow-lg'
                    : isUnlocked
                    ? 'bg-[#3A271E] border-stone-700/60 opacity-90'
                    : 'bg-[#241712] border-stone-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{tier.badge}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif-fleur font-bold text-sm text-white">
                          {tier.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] bg-[#FFD700] text-stone-950 font-bold px-2 py-0.5 rounded-full uppercase">
                            Ваш статус
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {tier.minOrders === 0 ? 'При регистрации' : `От ${tier.minOrders} заказов`}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {tier.hasFreeDelivery && (
                      <span className="text-[10px] text-[#F4B6C2] font-semibold block">
                        Бесплатная доставка 0 ₽
                      </span>
                    )}
                    {tier.hasPriorityAssembly && (
                      <span className="text-[10px] text-[#FFD700] font-semibold block">
                        Приоритетная сборка
                      </span>
                    )}
                    {tier.hasSecretBouquets && (
                      <span className="text-[10px] text-amber-300 font-bold block">
                        Скрытые букеты VIP
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-white/10 flex flex-wrap gap-1.5">
                  {tier.perks.map((perk, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-stone-300"
                    >
                      ✓ {perk}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Automatic Loyalty Notice */}
        <div className="mt-5 p-3.5 bg-white/5 rounded-2xl border border-white/10 text-center">
          <div className="flex items-center justify-center gap-2 text-xs text-[#FFD700] font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-[#FFD700]" />
            <span>Автоматический рост привилегий</span>
          </div>
          <p className="text-[11px] text-stone-300 max-w-xs mx-auto leading-relaxed">
            Ваш уровень и скидки повышаются автоматически после каждого доставленного заказа цветов.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold py-3 rounded-2xl text-xs transition-all cursor-pointer"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
