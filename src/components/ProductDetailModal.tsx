import React, { useState } from 'react';
import { Product } from '../data/storeData';
import { useTelegram } from '../context/TelegramContext';
import { X, Flame, Sparkles, Plus, Minus, Check, Leaf } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, sizeId?: string, toppings?: string[], quantity?: number) => void;
}

export function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const { triggerHaptic } = useTelegram();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0]?.id || '');
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState<number>(1);

  const sizeDelta = product.sizes?.find((s) => s.id === selectedSize)?.priceDelta || 0;
  const toppingsPrice = selectedToppings.reduce((acc, tId) => {
    const topping = product.toppings?.find((t) => t.id === tId);
    return acc + (topping ? topping.price : 0);
  }, 0);

  const unitPrice = product.price + sizeDelta + toppingsPrice;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (toppingId: string) => {
    triggerHaptic('light');
    setSelectedToppings((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

  const handleConfirm = () => {
    triggerHaptic('success');
    onAddToCart(product, selectedSize, selectedToppings, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl flex flex-col animate-in slide-in-from-bottom-6"
      >
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 w-full bg-slate-950 overflow-hidden shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />
          
          <div className="absolute bottom-3 left-4 flex flex-wrap gap-1.5">
            {product.isHit && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-bold uppercase tracking-wider shadow">
                🔥 Хит продаж
              </span>
            )}
            {product.isNew && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold uppercase tracking-wider shadow">
                ✨ Новинка
              </span>
            )}
            {product.isSpicy && (
              <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                <Flame className="w-3 h-3" /> Острое
              </span>
            )}
            {product.isVegan && (
              <span className="px-2.5 py-1 rounded-lg bg-teal-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow">
                <Leaf className="w-3 h-3" /> Веган
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-4 flex-1">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{product.name}</h2>
              <div className="text-right shrink-0">
                <span className="text-xl font-extrabold text-sky-400">{unitPrice} ₽</span>
                <div className="text-[11px] text-slate-400">{product.weight}</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Nutritional stats */}
          <div className="grid grid-cols-4 gap-2 bg-slate-950/70 border border-slate-800 rounded-2xl p-2.5 text-center text-[11px]">
            <div>
              <div className="text-slate-400 text-[10px]">Ккал</div>
              <div className="font-bold text-white mt-0.5">{product.calories}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Белки</div>
              <div className="font-bold text-white mt-0.5">{product.proteins} г</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Жиры</div>
              <div className="font-bold text-white mt-0.5">{product.fats} г</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">Углеводы</div>
              <div className="font-bold text-white mt-0.5">{product.carbs} г</div>
            </div>
          </div>

          {/* Sizes Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Выберите размер
              </label>
              <div className="grid grid-cols-2 gap-2">
                {product.sizes.map((s) => {
                  const isSelected = selectedSize === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedSize(s.id);
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-sky-500/15 border-sky-500 text-sky-300 shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{s.name}</span>
                      {s.priceDelta > 0 && (
                        <span className="text-[11px] opacity-80">+{s.priceDelta} ₽</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Toppings / Addons */}
          {product.toppings && product.toppings.length > 0 && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2">
                Дополнительные ингредиенты
              </label>
              <div className="space-y-1.5">
                {product.toppings.map((t) => {
                  const isChecked = selectedToppings.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleTopping(t.id)}
                      className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-sky-500/10 border-sky-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            isChecked ? 'bg-sky-500 border-sky-400 text-white' : 'border-slate-600 bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span className="font-medium">{t.name}</span>
                      </div>
                      <span className="font-bold text-sky-400">+{t.price} ₽</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 p-4 flex items-center gap-3">
          {/* Quantity stepper */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => {
                triggerHaptic('light');
                setQuantity((q) => Math.max(1, q - 1));
              }}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-90 text-white flex items-center justify-center transition-all"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-sm text-sky-400">{quantity}</span>
            <button
              onClick={() => {
                triggerHaptic('light');
                setQuantity((q) => q + 1);
              }}
              className="w-8 h-8 rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-90 text-white flex items-center justify-center transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to cart action */}
          <button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-sky-500/25 active:scale-[0.98] transition-all flex items-center justify-between"
          >
            <span>В корзину</span>
            <span className="bg-black/20 px-2 py-0.5 rounded-md font-mono">{totalPrice.toLocaleString()} ₽</span>
          </button>
        </div>
      </div>
    </div>
  );
}
