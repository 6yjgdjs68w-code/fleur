import React, { useState, useEffect } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { ShieldCheck, CheckCircle2, User, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function TelegramAuthBadge() {
  const { user, isInsideTelegram, triggerHaptic } = useTelegram();
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    // Auto hide the welcome auth toast after 5 seconds
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 5500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          className="mx-4 mt-2 bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-2.5 text-xs text-slate-200 shadow-xl flex items-center justify-between gap-2 backdrop-blur-md"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 font-bold text-white leading-tight">
                <span className="truncate">Вход через Telegram: {user.first_name}</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                  @{user.username || 'tg_user'}
                </span>
              </div>
              <div className="text-[10px] text-emerald-400/90 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Без Google и паролей • Вход по нажатию кнопки в ТГ</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setShowToast(false);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
