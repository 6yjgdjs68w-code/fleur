import React from 'react';
import { useTelegram, ThemePreset } from '../context/TelegramContext';
import { 
  Smartphone, Monitor, Moon, Sun, Copy, Check, Terminal, 
  Sparkles, UserCheck, Flame, Compass
} from 'lucide-react';

interface SimulatorControlsProps {
  onToggleConsole: () => void;
  isConsoleOpen: boolean;
}

export function SimulatorControls({ onToggleConsole, isConsoleOpen }: SimulatorControlsProps) {
  const { 
    deviceFrame, 
    setDeviceFrame, 
    theme, 
    setTheme, 
    user, 
    setUser, 
    appUrl, 
    triggerHaptic, 
    logs,
    activeTab,
    setActiveTab
  } = useTelegram();

  const [copied, setCopied] = React.useState(false);

  const copyUrl = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usersList = [
    {
      id: 792418042,
      first_name: 'Анна',
      last_name: 'Богатова',
      username: 'bogatova_user',
      is_premium: true,
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 1,
      first_name: 'Павел',
      last_name: 'Дуров',
      username: 'durov',
      is_premium: true,
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      id: 88921415,
      first_name: 'Иван',
      last_name: 'Разработчик',
      username: 'ivan_dev',
      is_premium: false,
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.75-.56 2.94-1.28 4.9-2.12 5.89-2.54 2.8-1.17 3.39-1.37 3.77-1.38.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">Telegram Mini App Studio</h1>
              <span className="hidden sm:inline-flex text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                WebApp SDK v7+ Ready
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Симулятор и готовый шаблон для Telegram ботов</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick tab jump */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('guide');
            }}
            className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'guide'
                ? 'bg-sky-500 text-white border-sky-400 shadow-sm'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-amber-300" />
            <span>Инструкция BotFather</span>
          </button>

          {/* Device Frame Selector */}
          <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => {
                triggerHaptic('light');
                setDeviceFrame('iphone');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                deviceFrame === 'iphone' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="iPhone 16 Pro Frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">iPhone</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setDeviceFrame('android');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                deviceFrame === 'android' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Android Phone Frame"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Android</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setDeviceFrame('fullscreen');
              }}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                deviceFrame === 'fullscreen' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Полный экран"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Экран</span>
            </button>
          </div>

          {/* Theme Selector */}
          <select
            value={theme}
            onChange={(e) => {
              triggerHaptic('light');
              setTheme(e.target.value as ThemePreset);
            }}
            aria-label="Выбор темы оформления"
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500"
          >
            <option value="telegram-dark">🌙 Telegram Dark</option>
            <option value="telegram-light">☀️ Telegram Light</option>
            <option value="midnight">🌌 Midnight Blue</option>
            <option value="cyberpunk">⚡ Cyberpunk Neon</option>
          </select>

          {/* User Profile Selector */}
          <select
            value={user.id}
            onChange={(e) => {
              triggerHaptic('light');
              const found = usersList.find((u) => u.id === Number(e.target.value));
              if (found) setUser(found);
            }}
            aria-label="Выбор тестового пользователя"
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-sky-500 hidden sm:block"
          >
            {usersList.map((u) => (
              <option key={u.id} value={u.id}>
                👤 {u.first_name} (@{u.username})
              </option>
            ))}
          </select>

          {/* Console Drawer Button */}
          <button
            onClick={onToggleConsole}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isConsoleOpen
                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Консоль ТМА</span>
            {logs.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center font-bold">
                {logs.length}
              </span>
            )}
          </button>

          {/* Copy URL for BotFather */}
          <button
            onClick={copyUrl}
            className="flex items-center gap-1.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано!' : 'URL для BotFather'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
