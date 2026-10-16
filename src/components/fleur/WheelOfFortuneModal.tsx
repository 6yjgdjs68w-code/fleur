import React, { useState } from 'react';
import { X, Sparkles, Trophy, Gift, ArrowRight, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export interface FortunePrize {
  id: number;
  label: string;
  type: 'discount' | 'points' | 'empty';
  value: number;
  probabilityWeight: number;
  color: string;
  textColor: string;
}

export const WHEEL_SECTORS: FortunePrize[] = [
  { id: 0, label: '5% скидка', type: 'discount', value: 5, probabilityWeight: 30, color: '#F4B6C2', textColor: '#3E2C23' },
  { id: 1, label: 'Пусто', type: 'empty', value: 0, probabilityWeight: 12, color: '#2D1F18', textColor: '#FAF6F0' },
  { id: 2, label: '100 бонусов', type: 'points', value: 100, probabilityWeight: 15, color: '#FFD700', textColor: '#3E2C23' },
  { id: 3, label: '10% скидка', type: 'discount', value: 10, probabilityWeight: 5, color: '#E8A3B0', textColor: '#3E2C23' }, // RARE!
  { id: 4, label: 'Пусто', type: 'empty', value: 0, probabilityWeight: 13, color: '#3A271E', textColor: '#FAF6F0' },
  { id: 5, label: '50 бонусов', type: 'points', value: 50, probabilityWeight: 25, color: '#FFE4B5', textColor: '#3E2C23' },
];

interface WheelOfFortuneModalProps {
  onClose: () => void;
  onPrizeWon: (prize: FortunePrize) => void;
  hasSpunToday: boolean;
}

export function WheelOfFortuneModal({ onClose, onPrizeWon, hasSpunToday }: WheelOfFortuneModalProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<FortunePrize | null>(null);

  const spinWheel = () => {
    if (isSpinning || hasSpunToday) return;
    setIsSpinning(true);

    // Weighted random selection
    const totalWeight = WHEEL_SECTORS.reduce((acc, s) => acc + s.probabilityWeight, 0);
    let rand = Math.random() * totalWeight;
    let selectedSector = WHEEL_SECTORS[0];

    for (const sector of WHEEL_SECTORS) {
      if (rand < sector.probabilityWeight) {
        selectedSector = sector;
        break;
      }
      rand -= sector.probabilityWeight;
    }

    // Each sector spans 60 degrees.
    // Pointer is at the top (0 degrees).
    // To align sector `i` to the top, target angle = 360 - (i * 60 + 30)
    const sectorAngle = 60;
    const targetAngle = 360 - (selectedSector.id * sectorAngle + 30);
    const fullSpins = 5 * 360; // 5 full revolutions
    const finalRotation = fullSpins + targetAngle + (Math.random() * 20 - 10); // slight random jitter inside sector

    setRotation(finalRotation);

    // Trigger haptics if available
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([20, 50, 20, 50, 30, 80]);
      } catch (e) {}
    }

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(selectedSector);
      onPrizeWon(selectedSector);

      if (selectedSector.type !== 'empty') {
        try {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#F4B6C2', '#FAF6F0', '#E5E4E2'],
          });
        } catch (e) {}
      }
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#4A352B] via-[#3E2C23] to-[#2D1F18] border border-[#FFD700]/30 text-white p-6 shadow-2xl text-center overflow-hidden">
        
        {/* Soft Golden/Pink Glow Background */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#FFD700]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#F4B6C2]/20 blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFD700]/15 border border-[#FFD700]/30 text-[#FFD700] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Колесо Фортуны Fleur</span>
        </div>
        <h2 className="font-serif-fleur text-2xl text-[#FAF6F0] font-normal">
          Крутите и выигрывайте
        </h2>
        <p className="text-[11px] text-stone-300 mt-1 max-w-xs mx-auto">
          Один бесплатный спин каждый день. Скидки и баллы для вашего букета.
        </p>

        {/* Wheel Container */}
        <div className="relative w-64 h-64 mx-auto my-6 flex items-center justify-center">
          {/* Outer Golden Rim Glow */}
          <div className="absolute inset-0 rounded-full border-4 border-[#FFD700]/60 shadow-[0_0_35px_rgba(255,215,0,0.35)] pointer-events-none z-10" />

          {/* Golden Top Pointer Arrow */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-[#FFD700]" />
          </div>

          {/* Rotating Wheel (SVG with 6 sectors) */}
          <div
            className="w-full h-full rounded-full transition-transform duration-4500 ease-[cubic-bezier(0.15,0.9,0.2,1)]"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full rounded-full select-none">
              <defs>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFE082" />
                  <stop offset="100%" stopColor="#FFB300" />
                </linearGradient>
                <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FDE8ED" />
                  <stop offset="100%" stopColor="#F4B6C2" />
                </linearGradient>
              </defs>

              {WHEEL_SECTORS.map((sector, i) => {
                // 60 degrees arc per sector
                const startAngle = i * 60;
                const endAngle = startAngle + 60;
                const r = 50;
                const cx = 50;
                const cy = 50;

                const startRad = ((startAngle - 90) * Math.PI) / 180;
                const endRad = ((endAngle - 90) * Math.PI) / 180;

                const x1 = cx + r * Math.cos(startRad);
                const y1 = cy + r * Math.sin(startRad);
                const x2 = cx + r * Math.cos(endRad);
                const y2 = cy + r * Math.sin(endRad);

                const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;

                // Center of text
                const textAngle = startAngle + 30;
                const textRad = ((textAngle - 90) * Math.PI) / 180;
                const tx = cx + 32 * Math.cos(textRad);
                const ty = cy + 32 * Math.sin(textRad);

                return (
                  <g key={sector.id}>
                    <path
                      d={d}
                      fill={
                        sector.id === 2
                          ? 'url(#goldGrad)'
                          : sector.id === 0 || sector.id === 3
                          ? 'url(#pinkGrad)'
                          : sector.color
                      }
                      stroke="#FAF6F0"
                      strokeWidth="0.75"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill={sector.textColor}
                      fontSize="4.2"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                      className="font-sans select-none"
                    >
                      {sector.label}
                    </text>
                  </g>
                );
              })}

              {/* Center Golden Pin */}
              <circle cx="50" cy="50" r="10" fill="#2D1F18" stroke="#FFD700" strokeWidth="2" />
              <circle cx="50" cy="50" r="5" fill="#FFD700" />
            </svg>
          </div>
        </div>

        {/* Spin Action Button */}
        {hasSpunToday ? (
          <div className="bg-white/10 rounded-2xl p-3 border border-white/15 text-xs text-stone-200">
            <span className="font-semibold text-[#F4B6C2]">Вы уже крутили колесо сегодня ✨</span>
            <div className="text-[10px] text-stone-400 mt-0.5">Возвращайтесь завтра за новым подарком!</div>
          </div>
        ) : (
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm tracking-wide transition-all shadow-xl cursor-pointer ${
              isSpinning
                ? 'bg-stone-600 text-stone-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#FFD700] via-[#FFDF73] to-[#F4B6C2] text-[#3E2C23] hover:opacity-95 active:scale-95 shadow-[#FFD700]/25'
            }`}
          >
            {isSpinning ? 'Колесо вращается...' : 'Испытать удачу (Крутить)'}
          </button>
        )}

        {/* Winning Result Modal Window */}
        {wonPrize && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in zoom-in-95">
            <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl text-[#2D1F18] border border-[#FFD700]/40">
              <div className="w-16 h-16 rounded-full bg-[#FDE8ED] text-[#3E2C23] flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner">
                {wonPrize.type === 'empty' ? '🌸' : '🎁'}
              </div>

              <div className="text-[10px] font-bold text-[#C97A8B] uppercase tracking-widest">
                Результат спина
              </div>

              <h3 className="font-serif-fleur text-xl font-bold text-[#2D1F18] mt-1">
                {wonPrize.type === 'empty' ? 'Почти повезло!' : `Ваш приз: ${wonPrize.label}`}
              </h3>

              <div className="bg-[#FAF6F0] rounded-2xl p-3 my-3 text-xs text-stone-600 border border-stone-200">
                {wonPrize.type === 'discount' && (
                  <p className="font-semibold text-emerald-700">
                    Скидка {wonPrize.value}% действует 24 часа. Она уже активирована в вашей корзине!
                  </p>
                )}
                {wonPrize.type === 'points' && (
                  <p className="font-semibold text-amber-700">
                    +{wonPrize.value} баллов зачислено на ваш баланс Fleur. Скидка действует 24 часа.
                  </p>
                )}
                {wonPrize.type === 'empty' && (
                  <p>В этот раз колесо остановилось на пустом секторе. Не расстраивайтесь, завтра новый бесплатный спин!</p>
                )}
              </div>

              <button
                onClick={() => {
                  setWonPrize(null);
                  onClose();
                }}
                className="w-full bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold py-3 rounded-2xl text-xs transition-all shadow-md cursor-pointer"
              >
                Отлично, к букетам!
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
