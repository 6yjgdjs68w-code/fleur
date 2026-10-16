import React, { useState, useMemo } from 'react';
import { Bouquet, BouquetWrapper, StemCount, WRAPPER_OPTIONS, STEM_OPTIONS } from '../../data/fleurData';
import { X, Star, Check, Sparkles, Heart, Shield, RefreshCw } from 'lucide-react';

interface BouquetDetailsModalProps {
  bouquet: Bouquet;
  onClose: () => void;
  onAddToCart: (bouquet: Bouquet, wrapper: BouquetWrapper, stemCount: StemCount, quantity: number, unitPrice: number) => void;
}

export function BouquetDetailsModal({ bouquet, onClose, onAddToCart }: BouquetDetailsModalProps) {
  const [selectedWrapper, setSelectedWrapper] = useState<BouquetWrapper>(WRAPPER_OPTIONS[0]);

  // Compute available stem options dynamically based on admin's custom settings
  const availableStems = useMemo(() => {
    if (bouquet.customStems && bouquet.customStems.length > 0) {
      return bouquet.customStems.map((s) => ({
        count: s.count,
        label: `${s.count} цветов`,
        subLabel: s.label || 'Авторский',
        price: s.price,
      }));
    }

    if (bouquet.stemPrices && Object.keys(bouquet.stemPrices).length > 0) {
      const counts = Object.keys(bouquet.stemPrices)
        .map(Number)
        .filter((c) => !isNaN(c) && (bouquet.stemPrices![c] ?? 0) > 0)
        .sort((a, b) => a - b);

      if (counts.length > 0) {
        return counts.map((count) => {
          const price = bouquet.stemPrices![count]!;
          const std = STEM_OPTIONS.find((s) => s.count === count);
          const subLabel = std
            ? std.count === 5
              ? 'Мини'
              : std.count === 7
              ? 'Классик'
              : 'Пышный'
            : count <= 7
            ? 'Компактный'
            : count <= 15
            ? 'Пышный'
            : count <= 35
            ? 'Роскошный'
            : 'Гранд';
          return {
            count,
            label: `${count} цветов`,
            subLabel,
            price,
          };
        });
      }
    }

    return STEM_OPTIONS.map((stem) => ({
      count: stem.count,
      label: `${stem.count} цветов`,
      subLabel: stem.count === 5 ? 'Мини' : stem.count === 7 ? 'Классик' : 'Пышный',
      price: Math.round(bouquet.basePrice * stem.multiplier),
    }));
  }, [bouquet]);

  const [selectedStemCount, setSelectedStemCount] = useState<number>(() => {
    return availableStems[0]?.count ?? 5;
  });

  const currentStemOption = availableStems.find((s) => s.count === selectedStemCount) || availableStems[0];
  const calculatedPrice = (currentStemOption ? currentStemOption.price : bouquet.basePrice) + selectedWrapper.priceDelta;

  const handleAdd = () => {
    onAddToCart(bouquet, selectedWrapper, selectedStemCount, 1, calculatedPrice);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white text-[#2D1F18] shadow-2xl flex flex-col animate-in slide-in-from-bottom-8">
        
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Large Image Header */}
        <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-stone-100 shrink-0">
          <img
            src={bouquet.image}
            alt={bouquet.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Floating Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{bouquet.rating}</span>
              <span className="text-stone-300 font-normal text-[11px]">({bouquet.reviewsCount} отзывов)</span>
            </div>

            <span className="bg-[#F4B6C2] text-[#3E2C23] text-xs font-bold px-3 py-1 rounded-full shadow">
              Авторский букет
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 flex-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-serif-fleur text-2xl font-bold text-[#2D1F18] leading-tight">
                {bouquet.name}
              </h2>
              <div className="text-right shrink-0">
                <span className="font-serif-fleur text-2xl font-extrabold text-[#3E2C23] whitespace-nowrap shrink-0">
                  {calculatedPrice.toLocaleString('ru-RU')}&nbsp;₽
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-600 mt-2 leading-relaxed">
              {bouquet.description}
            </p>
          </div>

          {/* Bouquet Details Box */}
          <div className="bg-[#FAF6F0] rounded-2xl p-3 text-xs space-y-1.5 border border-stone-200/60">
            <div className="flex justify-between">
              <span className="text-stone-500">Состав:</span>
              <span className="font-medium text-right text-stone-800 max-w-[240px] truncate">
                {bouquet.flowerComposition}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Параметры:</span>
              <span className="font-medium text-stone-800">{bouquet.dimensions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">В комплекте:</span>
              <span className="font-medium text-stone-800">Аквабокс, кризал, открытка Fleur</span>
            </div>
          </div>

          {/* Quantity selection (Custom stem options) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#3E2C23] uppercase tracking-wider">
                1. Количество цветов в букете
              </label>
              <span className="text-[11px] text-[#C97A8B] font-semibold">
                {selectedStemCount} стеблей
              </span>
            </div>

            <div className={`grid gap-2 ${availableStems.length <= 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {availableStems.map((stem) => {
                const isSelected = selectedStemCount === stem.count;
                const stemPrice = stem.price + selectedWrapper.priceDelta;

                return (
                  <button
                    key={stem.count}
                    type="button"
                    onClick={() => setSelectedStemCount(stem.count)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FDE8ED] border-[#F4B6C2] text-[#3E2C23] shadow-sm ring-1 ring-[#F4B6C2]'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-sm font-bold">{stem.count} цветов</div>
                    <div className="text-[10px] text-stone-500 mt-0.5 truncate">
                      {stem.subLabel}
                    </div>
                    <div className="text-xs font-bold text-[#3E2C23] mt-1 whitespace-nowrap">
                      {stemPrice.toLocaleString('ru-RU')}&nbsp;₽
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wrapper selection (craft, film, fabric) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#3E2C23] uppercase tracking-wider">
                2. Оформление и упаковка
              </label>
              <span className="text-[11px] text-stone-500">
                {selectedWrapper.name}
              </span>
            </div>

            <div className="space-y-2">
              {WRAPPER_OPTIONS.map((wrapper) => {
                const isSelected = selectedWrapper.id === wrapper.id;

                return (
                  <button
                    key={wrapper.id}
                    type="button"
                    onClick={() => setSelectedWrapper(wrapper)}
                    className={`w-full p-3 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FDE8ED] border-[#F4B6C2] text-[#3E2C23] ring-1 ring-[#F4B6C2]'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'bg-[#F4B6C2] border-[#C97A8B] text-[#3E2C23]'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-[#2D1F18]">{wrapper.name}</div>
                        <div className="text-[10px] text-stone-500">{wrapper.desc}</div>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-[#3E2C23] whitespace-nowrap shrink-0">
                      {wrapper.priceDelta > 0 ? `+${wrapper.priceDelta.toLocaleString('ru-RU')}\u00A0₽` : 'Включено'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-stone-100 p-4">
          <button
            onClick={handleAdd}
            className="w-full bg-[#F4B6C2] hover:bg-[#e8a3b0] active:scale-[0.98] text-[#3E2C23] font-bold py-3.5 px-6 rounded-2xl text-sm shadow-xl shadow-[#F4B6C2]/30 transition-all flex items-center justify-between cursor-pointer"
          >
            <span>Добавить в корзину</span>
            <span className="font-extrabold text-base whitespace-nowrap shrink-0">{calculatedPrice.toLocaleString('ru-RU')}&nbsp;₽</span>
          </button>
        </div>
      </div>
    </div>
  );
}
