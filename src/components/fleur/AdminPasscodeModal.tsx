import React, { useState } from 'react';
import { Lock, X, Check, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AdminPasscodeModalProps {
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function AdminPasscodeModal({
  correctPin,
  onSuccess,
  onClose,
}: AdminPasscodeModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  const handleDigit = (digit: string) => {
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      if (nextPin === correctPin) {
        setTimeout(() => onSuccess(), 200);
      }
    }
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pin === correctPin) {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#FAF6F0] text-[#2D1F18] shadow-2xl p-6 flex flex-col items-center animate-in fade-in zoom-in-95 border border-[#523B2F]/20">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#3E2C23] text-[#FFD700] flex items-center justify-center text-2xl shadow-md mb-3">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="font-serif-fleur text-lg font-bold text-[#2D1F18] text-center">
          Вход для владельца
        </h3>
        <p className="text-xs text-stone-500 text-center mt-1 max-w-[260px]">
          Введите PIN-код для управления каталогом, ценами, Букетом Дня и заказами.
        </p>

        {/* PIN Input Display */}
        <form onSubmit={handleSubmit} className="w-full mt-5 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-2">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              maxLength={8}
              autoFocus
              className={`w-40 text-center tracking-widest text-2xl font-mono font-bold bg-white border-2 rounded-2xl py-2 px-3 shadow-inner text-[#2D1F18] focus:outline-none transition-all ${
                error
                  ? 'border-rose-500 bg-rose-50/50 text-rose-700'
                  : 'border-stone-300 focus:border-[#F4B6C2]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="p-2 text-stone-400 hover:text-stone-600 transition-colors cursor-pointer"
              title={showPin ? 'Скрыть PIN' : 'Показать PIN'}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="text-rose-600 text-xs font-semibold flex items-center gap-1 mb-2 animate-bounce">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Неверный PIN-код доступа</span>
            </div>
          )}

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-12 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-lg font-bold text-[#2D1F18] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="h-12 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-600 active:scale-95 transition-all cursor-pointer"
            >
              ⌫
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-12 rounded-xl bg-white hover:bg-stone-100 border border-stone-200 text-lg font-bold text-[#2D1F18] shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              0
            </button>
            <button
              type="submit"
              className="h-12 rounded-xl bg-[#3E2C23] hover:bg-[#4E382D] text-white text-xs font-bold shadow-md active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <Check className="w-5 h-5 text-[#F4B6C2]" />
            </button>
          </div>

          {/* Quick Submit Button */}
          <button
            type="submit"
            className="w-full mt-4 bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold text-xs py-2.5 rounded-xl shadow transition-all cursor-pointer active:scale-98"
          >
            Войти в управление бутиком
          </button>
        </form>

        <p className="text-[10px] text-stone-400 text-center mt-3">
          Клиенты магазина не знают ваш PIN-код и не имеют доступа к изменению цен.
        </p>
      </div>
    </div>
  );
}
