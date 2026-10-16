import React, { useState, useEffect, useRef } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { Zap, Flame, Trophy, Award, Sparkles, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface FloatingNumber {
  id: number;
  x: number;
  y: number;
  amount: number;
}

export function ClickerTab() {
  const { triggerHaptic, setMainButton, user, sendDataToBot } = useTelegram();
  const [balance, setBalance] = useState<number>(14250);
  const [energy, setEnergy] = useState<number>(950);
  const maxEnergy = 1000;
  const [tapPower, setTapPower] = useState<number>(3);
  const [multitapLevel, setMultitapLevel] = useState<number>(1);
  const [autoclickerActive, setAutoclickerActive] = useState<boolean>(false);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [claimedDaily, setClaimedDaily] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'tap' | 'boosts' | 'leaders'>('tap');
  const coinRef = useRef<HTMLDivElement>(null);

  // Energy regeneration
  useEffect(() => {
    const timer = setInterval(() => {
      setEnergy((prev) => Math.min(maxEnergy, prev + 2));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Autoclicker passive income
  useEffect(() => {
    if (!autoclickerActive) return;
    const interval = setInterval(() => {
      setBalance((b) => b + 2);
    }, 1500);
    return () => clearInterval(interval);
  }, [autoclickerActive]);

  const handleTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (energy < tapPower) {
      triggerHaptic('warning');
      return;
    }

    triggerHaptic('light');
    setEnergy((prev) => Math.max(0, prev - tapPower));
    setBalance((prev) => prev + tapPower);

    // Calculate coordinates for floating number
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = coinRef.current?.getBoundingClientRect();
    const x = rect ? clientX - rect.left : 100;
    const y = rect ? clientY - rect.top : 100;

    const newId = Date.now() + Math.random();
    setFloatingNumbers((prev) => [...prev, { id: newId, x, y, amount: tapPower }]);

    setTimeout(() => {
      setFloatingNumbers((prev) => prev.filter((item) => item.id !== newId));
    }, 800);
  };

  const claimDailyReward = () => {
    if (claimedDaily) return;
    triggerHaptic('success');
    setBalance((b) => b + 500);
    setClaimedDaily(true);

    try {
      confetti({
        particleCount: 70,
        spread: 55,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    sendDataToBot({
      action: 'claim_daily_reward',
      reward: 500,
      user_id: user.id,
      new_balance: balance + 500,
    });
  };

  const buyMultitap = () => {
    const cost = multitapLevel * 300;
    if (balance < cost) {
      triggerHaptic('error');
      return;
    }
    triggerHaptic('success');
    setBalance((b) => b - cost);
    setTapPower((p) => p + 2);
    setMultitapLevel((l) => l + 1);
  };

  const buyAutoclicker = () => {
    const cost = 2500;
    if (balance < cost || autoclickerActive) {
      triggerHaptic('error');
      return;
    }
    triggerHaptic('success');
    setBalance((b) => b - cost);
    setAutoclickerActive(true);
  };

  // Sync MainButton for Daily Reward when available
  useEffect(() => {
    if (!claimedDaily) {
      setMainButton({
        isVisible: true,
        text: '🎁 Забрать бонус дня (+500 ⭐)',
        color: '#f59e0b',
        textColor: '#0f172a',
        callback: claimDailyReward,
      });
    } else {
      setMainButton({
        isVisible: false,
      });
    }
  }, [claimedDaily, balance]);

  return (
    <div className="pb-28">
      {/* Subtab Selector */}
      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-4">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('tap');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'tap'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Тапалка</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('boosts');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'boosts'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Бусты</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('leaders');
          }}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'leaders'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Топ</span>
        </button>
      </div>

      {/* Balance Header */}
      <div className="text-center my-3">
        <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Баланс Монет TG</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-3xl font-black tracking-tight text-white">
            {balance.toLocaleString('ru-RU')}
          </span>
          <span className="text-2xl">🪙</span>
        </div>
        <div className="text-[11px] text-sky-400 mt-0.5">
          Сила тапа: +{tapPower} за клик {autoclickerActive && '• Автобот активен ⚡'}
        </div>
      </div>

      {activeSubTab === 'tap' && (
        <div className="flex flex-col items-center">
          {/* 3D Coin Tapper */}
          <div className="relative my-6 select-none" ref={coinRef}>
            <motion.div
              whileTap={{ scale: 0.92, rotate: -2 }}
              onClick={handleTap}
              className="relative w-56 h-56 rounded-full cursor-pointer touch-manipulation flex items-center justify-center shadow-2xl transition-shadow"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #38bdf8 0%, #0284c7 45%, #0369a1 80%, #075985 100%)',
                boxShadow: '0 0 50px -10px rgba(14, 165, 233, 0.45), inset 0 4px 12px rgba(255, 255, 255, 0.5), inset 0 -6px 14px rgba(0, 0, 0, 0.6)',
              }}
            >
              {/* Inner Ring */}
              <div className="w-44 h-44 rounded-full border-2 border-white/25 flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent backdrop-blur-[1px]">
                {/* Telegram Logo Icon */}
                <div className="relative">
                  <svg className="w-24 h-24 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.75-.56 2.94-1.28 4.9-2.12 5.89-2.54 2.8-1.17 3.39-1.37 3.77-1.38.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Floating Numbers Animation */}
            <AnimatePresence>
              {floatingNumbers.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 1, y: item.y - 20, x: item.x }}
                  animate={{ opacity: 0, y: item.y - 90, scale: 1.25 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                  className="absolute pointer-events-none font-black text-2xl text-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                >
                  +{item.amount}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Energy Progress Bar */}
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-md">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Zap className="w-4 h-4 fill-amber-400" />
                <span>Энергия</span>
              </div>
              <span className="text-slate-300 font-mono">
                {energy} / {maxEnergy}
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 transition-all duration-300 rounded-full"
                style={{ width: `${(energy / maxEnergy) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'boosts' && (
        <div className="space-y-3">
          {/* Daily streak card */}
          <div className="bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                🎁
              </div>
              <div>
                <div className="text-sm font-bold text-white">Ежедневная награда</div>
                <div className="text-[11px] text-slate-400">+500 монет каждый день</div>
              </div>
            </div>
            {claimedDaily ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                Получено
              </span>
            ) : (
              <button
                onClick={claimDailyReward}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
              >
                Забрать
              </button>
            )}
          </div>

          {/* Multitap Upgrade */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg">
                👆
              </div>
              <div>
                <div className="text-sm font-bold text-white">Мульти-тап (Ур. {multitapLevel})</div>
                <div className="text-[11px] text-slate-400">+2 к силе нажатия</div>
              </div>
            </div>
            <button
              onClick={buyMultitap}
              disabled={balance < multitapLevel * 300}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                balance >= multitapLevel * 300
                  ? 'bg-sky-500 hover:bg-sky-400 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {multitapLevel * 300} 🪙
            </button>
          </div>

          {/* Autoclicker Bot */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                🤖
              </div>
              <div>
                <div className="text-sm font-bold text-white">ТГ-Автобот</div>
                <div className="text-[11px] text-slate-400">Фармит монеты пассивно</div>
              </div>
            </div>
            {autoclickerActive ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5" />
                Включен
              </span>
            ) : (
              <button
                onClick={buyAutoclicker}
                disabled={balance < 2500}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                  balance >= 2500
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                2 500 🪙
              </button>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'leaders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Лидеры Telegram Mini App
            </h4>
          </div>

          <div className="space-y-2 text-xs">
            {[
              { rank: 1, name: 'Pavel Durov', tag: '@durov', score: '1,500,000 🪙', badge: '🥇' },
              { rank: 2, name: `${user.first_name} (Вы)`, tag: `@${user.username || 'user'}`, score: `${balance.toLocaleString()} 🪙`, badge: '🥈', isMe: true },
              { rank: 3, name: 'Nikolay', tag: '@nikolay_tg', score: '12,400 🪙', badge: '🥉' },
              { rank: 4, name: 'CryptoDev', tag: '@cryptodev', score: '9,810 🪙' },
              { rank: 5, name: 'Alex Bot', tag: '@alexbot', score: '6,200 🪙' },
            ].map((player, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  player.isMe
                    ? 'bg-sky-500/10 border border-sky-500/40 text-sky-200'
                    : 'bg-slate-950/60 border border-slate-800/60 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 text-center font-bold text-xs">
                    {player.badge || `#${player.rank}`}
                  </span>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-[10px] text-slate-500">{player.tag}</div>
                  </div>
                </div>
                <span className="font-bold font-mono text-xs">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
