import React, { useState } from 'react';
import { BOUQUETS, Bouquet } from '../../data/fleurData';
import { LoyaltyTier } from '../../types/loyalty';
import { Sparkles, Star, Plus, Heart, Lock, Crown } from 'lucide-react';

interface CatalogScreenProps {
  onSelectBouquet: (bouquet: Bouquet) => void;
  userTier?: LoyaltyTier;
  onOpenStatusModal?: () => void;
  bouquets?: Bouquet[];
}

export function CatalogScreen({ onSelectBouquet, userTier, onOpenStatusModal, bouquets = BOUQUETS }: CatalogScreenProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(['fl-1', 'fl-2']);

  const filterButtons = [
    { id: 'all', label: '🌸 Все' },
    { id: 'roses', label: '🌹 Розы' },
    { id: 'peonies', label: '🪷 Пионы' },
    { id: 'tulips', label: '🌷 Тюльпаны' },
    { id: 'hydrangea', label: '🩵 Гортензии' },
    { id: 'mix', label: '✨ Авторские' },
  ];

  const hasSecretAccess = userTier?.hasSecretBouquets || false;

  const filteredBouquets = bouquets.filter((b) => {
    // If it's a secret bouquet and user doesn't have Founder's Circle access, only show if not strictly hidden
    if (selectedFilter !== 'all' && b.category !== selectedFilter) return false;
    return true;
  });

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Catalog Header */}
      <div className="text-center pt-1 pb-2">
        <h2 className="font-serif-fleur text-2xl text-[#FAF6F0] font-normal tracking-wide">
          Коллекция Fleur
        </h2>
        <p className="text-xs text-stone-300 mt-1 max-w-xs mx-auto">
          Каждый букет собирается флористом вручную прямо перед бережной отправкой
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
        {filterButtons.map((btn) => {
          const isActive = selectedFilter === btn.id;
          return (
            <button
              key={btn.id}
              onClick={() => setSelectedFilter(btn.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#F4B6C2] text-[#3E2C23] shadow-md shadow-[#F4B6C2]/20 font-bold'
                  : 'bg-[#4A352B] text-stone-200 border border-[#5A4236] hover:bg-[#5A4236]'
              }`}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Bouquets Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {filteredBouquets.map((bouquet) => {
          const isFav = favorites.includes(bouquet.id);
          const isLockedVip = bouquet.isSecretVip && !hasSecretAccess;

          return (
            <div
              key={bouquet.id}
              onClick={() => {
                if (isLockedVip && onOpenStatusModal) {
                  onOpenStatusModal();
                } else {
                  onSelectBouquet(bouquet);
                }
              }}
              className={`bg-white text-[#2D1F18] rounded-3xl overflow-hidden p-3 shadow-xl border flex flex-col justify-between cursor-pointer group hover:shadow-2xl transition-all relative ${
                bouquet.isSecretVip
                  ? 'border-[#FFD700]/70 ring-1 ring-[#FFD700]/40'
                  : 'border-stone-100'
              }`}
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 mb-2.5">
                  <img
                    src={bouquet.image}
                    alt={bouquet.name}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isLockedVip ? 'filter blur-[1.5px]' : 'group-hover:scale-105'
                    }`}
                    loading="lazy"
                  />

                  {/* VIP Lock Overlay if locked */}
                  {isLockedVip && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-2 text-center text-white">
                      <div className="w-8 h-8 rounded-full bg-[#FFD700] text-stone-950 flex items-center justify-center mb-1 shadow">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold tracking-wider text-[#FFD700]">
                        Founder's Circle
                      </span>
                      <span className="text-[9px] text-stone-200 mt-0.5">
                        От 15 заказов
                      </span>
                    </div>
                  )}

                  {/* Favorite button */}
                  {!isLockedVip && (
                    <button
                      onClick={(e) => toggleFavorite(e, bouquet.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#3E2C23] hover:text-[#C97A8B] transition-colors shadow cursor-pointer"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          isFav ? 'fill-[#C97A8B] text-[#C97A8B]' : 'text-stone-400'
                        }`}
                      />
                    </button>
                  )}

                  {/* Rating Badge */}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{bouquet.rating}</span>
                  </div>

                  {bouquet.isSecretVip ? (
                    <span className="absolute top-2 left-2 bg-[#FFD700] text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shadow flex items-center gap-1">
                      <Crown className="w-2.5 h-2.5" /> VIP
                    </span>
                  ) : bouquet.isBestseller ? (
                    <span className="absolute top-2 left-2 bg-[#F4B6C2] text-[#3E2C23] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow">
                      Хит
                    </span>
                  ) : null}
                </div>

                {/* Info */}
                <h3 className="font-serif-fleur font-semibold text-sm text-[#2D1F18] leading-tight line-clamp-1">
                  {bouquet.name}
                </h3>
                <p className="text-[10px] text-stone-500 line-clamp-2 mt-1 leading-snug">
                  {bouquet.flowerComposition}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                <div>
                  <div className="text-[9px] text-stone-400 uppercase font-semibold">Цена</div>
                  <div className="font-bold text-sm text-[#3E2C23] whitespace-nowrap shrink-0">
                    от&nbsp;{bouquet.basePrice.toLocaleString('ru-RU')}&nbsp;₽
                  </div>
                </div>

                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                    isLockedVip
                      ? 'bg-stone-200 text-stone-600'
                      : 'bg-[#FDE8ED] group-hover:bg-[#F4B6C2] text-[#3E2C23]'
                  }`}
                >
                  {isLockedVip ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-4 h-4 text-[#C97A8B] group-hover:text-[#3E2C23]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
