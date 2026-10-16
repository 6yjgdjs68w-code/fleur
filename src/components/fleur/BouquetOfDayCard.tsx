import React from 'react';
import { BOUQUET_OF_THE_DAY, Bouquet, BouquetOfDayData } from '../../data/fleurData';
import { Sparkles, ArrowRight, Star } from 'lucide-react';

interface BouquetOfDayCardProps {
  onOrderBouquetOfDay: (bouquet: Bouquet, price: number) => void;
  bouquetOfDayData?: BouquetOfDayData;
}

export function BouquetOfDayCard({
  onOrderBouquetOfDay,
  bouquetOfDayData = BOUQUET_OF_THE_DAY,
}: BouquetOfDayCardProps) {
  const currentData = bouquetOfDayData;

  const handleOrder = () => {
    const bouquetObj: Bouquet = {
      id: currentData.id,
      name: `${currentData.name} (Спецпредложение)`,
      category: 'mix',
      basePrice: currentData.discountedPrice,
      image: currentData.image,
      description: currentData.description,
      flowerComposition: currentData.composition,
      dimensions: currentData.dimensions,
      rating: currentData.rating,
      reviewsCount: 88,
      isBestseller: true,
    };

    onOrderBouquetOfDay(bouquetObj, currentData.discountedPrice);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden p-3.5 sm:p-5 bg-gradient-to-b from-[#3E2C23] via-[#483328] to-[#36251D] border-2 border-[#FFD700] shadow-[0_0_25px_rgba(255,215,0,0.2)]">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#FFD700] via-[#FFE082] to-[#FFA000] text-stone-950 font-black text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md shrink-0">
          <Sparkles className="w-3.5 h-3.5 fill-stone-950 shrink-0" />
          <span>Специальное предложение</span>
        </span>

        <span className="text-[10px] sm:text-xs font-bold text-[#FFD700] bg-black/40 border border-[#FFD700]/30 px-2.5 py-1 rounded-full whitespace-nowrap">
          Скидка {currentData.discountPercent}%
        </span>
      </div>

      {/* Main Card Content */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Bouquet Photo */}
        <div className="relative w-full sm:w-40 h-44 sm:h-44 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10 group">
          <img
            src={currentData.image}
            alt={currentData.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2 bg-[#F4B6C2] text-[#3E2C23] text-[10px] font-black px-2 py-0.5 rounded-full shadow">
            -{currentData.discountPercent}%
          </div>
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-300" />
            <span>{currentData.rating}</span>
          </div>
        </div>

        {/* Bouquet Details */}
        <div className="flex-1 flex flex-col justify-between text-left min-w-0">
          <div>
            <h3 className="font-serif-fleur text-base sm:text-lg font-bold text-[#FAF6F0] leading-snug line-clamp-1">
              {currentData.name}
            </h3>

            <p className="text-[11px] sm:text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
              {currentData.description}
            </p>

            <div className="mt-1.5 text-[10px] text-stone-400 truncate">
              <span className="text-[#F4B6C2]">Состав:</span> {currentData.composition}
            </div>
          </div>

          {/* Pricing & CTA */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
            <div className="flex items-baseline gap-1.5 shrink-0 whitespace-nowrap">
              <span className="font-serif-fleur text-lg sm:text-xl font-black text-[#FFD700] whitespace-nowrap tracking-tight">
                {currentData.discountedPrice.toLocaleString('ru-RU')}&nbsp;₽
              </span>
              <span className="text-[11px] line-through text-stone-400 whitespace-nowrap">
                {currentData.originalPrice.toLocaleString('ru-RU')}&nbsp;₽
              </span>
            </div>

            <button
              onClick={handleOrder}
              className="shrink-0 whitespace-nowrap bg-gradient-to-r from-[#FFD700] via-[#FFE082] to-[#F4B6C2] hover:opacity-95 active:scale-95 text-[#3E2C23] font-bold text-xs py-2 px-3 sm:px-4 rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Заказать</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
