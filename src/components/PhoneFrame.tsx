import React from 'react';
import { useTelegram, ThemePreset } from '../context/TelegramContext';
import { TMATab } from '../types/telegram';
import { 
  ShoppingBag, Flame, Briefcase, Terminal, BookOpen, 
  ArrowLeft, X, MoreVertical, Wifi, Battery, Loader2, Sparkles 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  const { 
    deviceFrame, 
    theme, 
    activeTab, 
    setActiveTab, 
    mainButton, 
    triggerMainButtonClick, 
    backButton, 
    triggerBackButtonClick,
    triggerHaptic,
    user 
  } = useTelegram();

  const currentTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  // Theme styling mapping
  const themeStyles: Record<ThemePreset, { bg: string; text: string; header: string; tabBg: string }> = {
    'telegram-dark': {
      bg: 'bg-[#17212b]',
      text: 'text-white',
      header: 'bg-[#242f3d] border-[#101921]',
      tabBg: 'bg-[#242f3d]/95 border-[#101921]',
    },
    'telegram-light': {
      bg: 'bg-[#ffffff]',
      text: 'text-[#1c242b]',
      header: 'bg-[#5288c1] border-[#4172a6] text-white',
      tabBg: 'bg-[#ffffff]/95 border-slate-200 text-slate-800',
    },
    'midnight': {
      bg: 'bg-[#0f172a]',
      text: 'text-slate-100',
      header: 'bg-[#1e293b] border-slate-800',
      tabBg: 'bg-[#1e293b]/95 border-slate-800',
    },
    'cyberpunk': {
      bg: 'bg-[#09090b]',
      text: 'text-emerald-300',
      header: 'bg-[#18181b] border-emerald-950',
      tabBg: 'bg-[#18181b]/95 border-emerald-950',
    },
  };

  const currentTheme = themeStyles[theme] || themeStyles['telegram-dark'];

  const tabs: Array<{ id: TMATab; label: string; icon: React.ReactNode }> = [
    { id: 'catalog', label: 'Магазин', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'clicker', label: 'Кликер', icon: <Flame className="w-5 h-5" /> },
    { id: 'leadform', label: 'Заявка', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'sdk_tester', label: 'SDK Тест', icon: <Terminal className="w-5 h-5" /> },
    { id: 'guide', label: 'Гайд ТГ', icon: <BookOpen className="w-5 h-5" /> },
  ];

  if (deviceFrame === 'fullscreen') {
    return (
      <div className={`w-full min-h-[calc(100vh-64px)] ${currentTheme.bg} ${currentTheme.text} flex flex-col relative`}>
        {/* Telegram Top bar in fullscreen */}
        <div className={`sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b ${currentTheme.header}`}>
          <div className="flex items-center gap-3">
            {backButton.isVisible ? (
              <button 
                onClick={triggerBackButtonClick}
                className="p-1 rounded-full hover:bg-white/10 active:scale-95 transition-transform"
                title="Назад"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow">
                TG
              </div>
            )}
            <div>
              <div className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                <span>Telegram Mini App</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-[11px] opacity-70">
                {user.first_name} • bot
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => triggerHaptic('light')}
              className="p-1.5 rounded-lg hover:bg-white/10 opacity-80 hover:opacity-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            <button 
              onClick={() => triggerHaptic('light')}
              className="p-1.5 rounded-lg hover:bg-white/10 opacity-80 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 max-w-2xl w-full mx-auto p-4">
          {children}
        </main>

        {/* Telegram MainButton (Fixed at bottom) */}
        <AnimatePresence>
          {mainButton.isVisible && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-18 left-0 right-0 z-30 p-3 pointer-events-none flex justify-center"
            >
              <button
                disabled={!mainButton.isActive || mainButton.isProgress}
                onClick={triggerMainButtonClick}
                style={{ backgroundColor: mainButton.color, color: mainButton.textColor }}
                className="pointer-events-auto max-w-md w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {mainButton.isProgress && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{mainButton.text}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Tab Bar */}
        <nav className={`sticky bottom-0 z-20 border-t backdrop-blur-md px-2 py-1.5 ${currentTheme.tabBg}`}>
          <div className="max-w-md mx-auto flex items-center justify-around">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab(tab.id);
                  }}
                  className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-all ${
                    isActive
                      ? 'text-sky-400 font-bold'
                      : 'opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="mb-0.5">{tab.icon}</div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  // Mobile Device Frame (iPhone 16 or Android)
  const isIphone = deviceFrame === 'iphone';

  return (
    <div className="py-6 px-2 flex justify-center items-center">
      {/* Outer Phone Bezel */}
      <div 
        className={`relative w-full max-w-[390px] h-[780px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-[5px] border-slate-700/80 ring-1 ring-white/10 flex flex-col overflow-hidden`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Dynamic Island or Camera Hole */}
        {isIphone ? (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-md">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
          </div>
        ) : (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-40 border border-slate-800" />
        )}

        {/* Screen Container */}
        <div className={`relative flex-1 rounded-[36px] overflow-hidden flex flex-col ${currentTheme.bg} ${currentTheme.text}`}>
          
          {/* iOS / Android Status Bar */}
          <div className={`pt-3.5 pb-1 px-6 flex items-center justify-between text-[11px] font-semibold opacity-90 select-none z-30 ${currentTheme.header}`}>
            <span className="font-mono text-xs">{currentTime}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px]">5G</span>
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* Telegram Header */}
          <div className={`px-4 py-2 flex items-center justify-between border-b z-20 select-none ${currentTheme.header}`}>
            <div className="flex items-center gap-2.5">
              {backButton.isVisible ? (
                <button
                  onClick={triggerBackButtonClick}
                  className="p-1 rounded-full hover:bg-white/10 active:scale-90 transition-transform"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center font-bold text-white text-[10px] shadow">
                  TG
                </div>
              )}
              <div>
                <div className="font-bold text-xs leading-none flex items-center gap-1">
                  <span>Gastro & MiniApp Bot</span>
                </div>
                <div className="text-[10px] opacity-70 mt-0.5">
                  bot • mini app
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button 
                onClick={() => triggerHaptic('light')}
                className="p-1.5 rounded-lg hover:bg-white/10 opacity-75 hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              <button 
                onClick={() => triggerHaptic('light')}
                className="p-1.5 rounded-lg hover:bg-white/10 opacity-75 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main App Content Scrollable View */}
          <div className="flex-1 overflow-y-auto px-3.5 pt-3 pb-24 scrollbar-none">
            {children}
          </div>

          {/* Telegram MainButton (Fixed over the tabs if visible) */}
          <AnimatePresence>
            {mainButton.isVisible && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="absolute bottom-14 left-0 right-0 z-30 px-3 py-2 pointer-events-none"
              >
                <button
                  disabled={!mainButton.isActive || mainButton.isProgress}
                  onClick={triggerMainButtonClick}
                  style={{ backgroundColor: mainButton.color, color: mainButton.textColor }}
                  className="pointer-events-auto w-full py-3 px-4 rounded-xl font-bold text-xs shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {mainButton.isProgress && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{mainButton.text}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Tab Bar */}
          <div className={`absolute bottom-0 left-0 right-0 z-20 border-t backdrop-blur-md px-1 py-1.5 select-none ${currentTheme.tabBg}`}>
            <div className="flex items-center justify-around">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveTab(tab.id);
                    }}
                    className={`flex flex-col items-center py-1 px-2 rounded-lg text-[9px] font-medium transition-all ${
                      isActive
                        ? 'text-sky-400 font-bold scale-105'
                        : 'opacity-55 hover:opacity-90'
                    }`}
                  >
                    <div className="mb-0.5">{tab.icon}</div>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            {/* iOS Home indicator bar */}
            {isIphone && (
              <div className="w-28 h-1 bg-white/30 rounded-full mx-auto mt-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
