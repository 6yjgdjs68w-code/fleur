import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { TelegramUser, TelegramThemeParams, TMATab } from '../types/telegram';

interface EventLog {
  id: string;
  time: string;
  type: 'haptic' | 'button' | 'data' | 'system' | 'popup';
  message: string;
  payload?: any;
}

interface MainButtonConfig {
  isVisible: boolean;
  text: string;
  color: string;
  textColor: string;
  isActive: boolean;
  isProgress: boolean;
  callback?: () => void;
}

interface BackButtonConfig {
  isVisible: boolean;
  callback?: () => void;
}

export type ThemePreset = 'telegram-dark' | 'telegram-light' | 'midnight' | 'cyberpunk';

interface TelegramContextValue {
  isInsideTelegram: boolean;
  user: TelegramUser;
  setUser: (user: TelegramUser) => void;
  theme: ThemePreset;
  setTheme: (theme: ThemePreset) => void;
  activeTab: TMATab;
  setActiveTab: (tab: TMATab) => void;
  deviceFrame: 'iphone' | 'android' | 'fullscreen';
  setDeviceFrame: (frame: 'iphone' | 'android' | 'fullscreen') => void;
  
  // Telegram Controls
  mainButton: MainButtonConfig;
  setMainButton: (config: Partial<MainButtonConfig>) => void;
  triggerMainButtonClick: () => void;
  backButton: BackButtonConfig;
  setBackButton: (config: Partial<BackButtonConfig>) => void;
  triggerBackButtonClick: () => void;

  // Actions
  triggerHaptic: (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error') => void;
  sendDataToBot: (payload: any) => void;
  showModalAlert: (title: string, message: string) => Promise<void>;
  showModalConfirm: (title: string, message: string) => Promise<boolean>;

  // Debug & logs
  logs: EventLog[];
  addLog: (type: EventLog['type'], message: string, payload?: any) => void;
  clearLogs: () => void;
  lastSentData: any | null;
  setLastSentData: (data: any | null) => void;
  appUrl: string;
}

const defaultUser: TelegramUser = {
  id: 792418042,
  first_name: 'Анна',
  last_name: 'Богатова',
  username: 'bogatova_user',
  language_code: 'ru',
  is_premium: true,
  photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const TelegramContext = createContext<TelegramContextValue | null>(null);

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isInsideTelegram, setIsInsideTelegram] = useState<boolean>(false);
  const [user, setUser] = useState<TelegramUser>(defaultUser);
  const [theme, setTheme] = useState<ThemePreset>('telegram-dark');
  const [activeTab, setActiveTab] = useState<TMATab>('catalog');
  const [deviceFrame, setDeviceFrame] = useState<'iphone' | 'android' | 'fullscreen'>('iphone');
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [lastSentData, setLastSentData] = useState<any | null>(null);

  const [mainButton, setMainButtonState] = useState<MainButtonConfig>({
    isVisible: false,
    text: 'Продолжить',
    color: '#2481cc',
    textColor: '#ffffff',
    isActive: true,
    isProgress: false,
  });

  const [backButton, setBackButtonState] = useState<BackButtonConfig>({
    isVisible: false,
  });

  const mainButtonCallbackRef = useRef<(() => void) | undefined>(undefined);
  const backButtonCallbackRef = useRef<(() => void) | undefined>(undefined);

  const addLog = useCallback((type: EventLog['type'], message: string, payload?: any) => {
    const newLog: EventLog = {
      id: Math.random().toString(36).substring(2, 9),
      time: new Date().toLocaleTimeString('ru-RU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message,
      payload,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const setMainButton = useCallback((config: Partial<MainButtonConfig>) => {
    setMainButtonState((prev) => {
      const updated = { ...prev, ...config };
      if (config.callback !== undefined) {
        mainButtonCallbackRef.current = config.callback;
      }
      return updated;
    });

    // If real Telegram WebApp exists, sync it
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.MainButton) {
      const tgMb = window.Telegram.WebApp.MainButton;
      if (config.text !== undefined) tgMb.setText(config.text);
      if (config.color !== undefined) tgMb.setParams({ color: config.color });
      if (config.textColor !== undefined) tgMb.setParams({ text_color: config.textColor });
      if (config.isVisible === true) tgMb.show();
      if (config.isVisible === false) tgMb.hide();
      if (config.isActive === true) tgMb.enable();
      if (config.isActive === false) tgMb.disable();
      if (config.isProgress === true) tgMb.showProgress();
      if (config.isProgress === false) tgMb.hideProgress();
    }
  }, []);

  const setBackButton = useCallback((config: Partial<BackButtonConfig>) => {
    setBackButtonState((prev) => {
      const updated = { ...prev, ...config };
      if (config.callback !== undefined) {
        backButtonCallbackRef.current = config.callback;
      }
      return updated;
    });

    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.BackButton) {
      const tgBb = window.Telegram.WebApp.BackButton;
      if (config.isVisible === true) tgBb.show();
      if (config.isVisible === false) tgBb.hide();
    }
  }, []);

  const triggerMainButtonClick = useCallback(() => {
    addLog('button', 'Нажата MainButton', { text: mainButton.text });
    if (mainButtonCallbackRef.current) {
      mainButtonCallbackRef.current();
    }
  }, [mainButton.text, addLog]);

  const triggerBackButtonClick = useCallback(() => {
    addLog('button', 'Нажата BackButton');
    if (backButtonCallbackRef.current) {
      backButtonCallbackRef.current();
    } else {
      setActiveTab('catalog');
    }
  }, [addLog]);

  const triggerHaptic = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error') => {
    addLog('haptic', `Вибрация HapticFeedback: ${style}`);
    
    // 1. If in real Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.HapticFeedback) {
      if (style === 'success' || style === 'warning' || style === 'error') {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(style);
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      }
    }

    // 2. Browser navigator.vibrate fallback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        switch (style) {
          case 'light': navigator.vibrate(10); break;
          case 'medium': navigator.vibrate(25); break;
          case 'heavy': navigator.vibrate(50); break;
          case 'rigid': navigator.vibrate(15); break;
          case 'soft': navigator.vibrate(20); break;
          case 'success': navigator.vibrate([15, 40, 30]); break;
          case 'warning': navigator.vibrate([30, 50, 30]); break;
          case 'error': navigator.vibrate([40, 40, 60, 40]); break;
        }
      } catch (e) {
        // ignore audio/vibration permission blocks
      }
    }
  }, [addLog]);

  const sendDataToBot = useCallback((payload: any) => {
    const jsonStr = JSON.stringify(payload);
    setLastSentData(payload);
    addLog('data', 'Отправлены данные боту через tg.sendData()', payload);

    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.sendData) {
      try {
        window.Telegram.WebApp.sendData(jsonStr);
      } catch (err) {
        console.warn('sendData error in browser (expected outside real Telegram):', err);
      }
    }
  }, [addLog]);

  const showModalAlert = useCallback(async (title: string, message: string): Promise<void> => {
    addLog('popup', `Алерт: ${title} - ${message}`);
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showAlert) {
      return new Promise((resolve) => {
        window.Telegram!.WebApp.showAlert(message, () => resolve());
      });
    }
    // Fallback in simulation
    return new Promise((resolve) => {
      window.alert(`${title}\n\n${message}`);
      resolve();
    });
  }, [addLog]);

  const showModalConfirm = useCallback(async (title: string, message: string): Promise<boolean> => {
    addLog('popup', `Подтверждение: ${title} - ${message}`);
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.showConfirm) {
      return new Promise((resolve) => {
        window.Telegram!.WebApp.showConfirm(message, (res) => resolve(res));
      });
    }
    return new Promise((resolve) => {
      const res = window.confirm(`${title}\n\n${message}`);
      resolve(res);
    });
  }, [addLog]);

  // Initial Telegram detection
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
          setIsInsideTelegram(true);
          setUser(tg.initDataUnsafe.user);
          setDeviceFrame('fullscreen');
          addLog('system', 'Обнаружен реальный Telegram WebApp!', {
            user: tg.initDataUnsafe.user,
            platform: tg.platform,
            version: tg.version,
          });
        } else {
          addLog('system', 'Запущено в симуляторе TMA (браузер)');
        }

        // Attach listeners if real TG buttons are clicked
        tg.MainButton.onClick(() => {
          if (mainButtonCallbackRef.current) mainButtonCallbackRef.current();
        });
        tg.BackButton.onClick(() => {
          if (backButtonCallbackRef.current) backButtonCallbackRef.current();
        });
      } catch (err) {
        console.log('TG Init info:', err);
      }
    }
  }, [addLog]);

  const appUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-cae34xvan6zflgkiw6wk3s-598613913611.asia-east1.run.app';

  return (
    <TelegramContext.Provider
      value={{
        isInsideTelegram,
        user,
        setUser,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        deviceFrame,
        setDeviceFrame,
        mainButton,
        setMainButton,
        triggerMainButtonClick,
        backButton,
        setBackButton,
        triggerBackButtonClick,
        triggerHaptic,
        sendDataToBot,
        showModalAlert,
        showModalConfirm,
        logs,
        addLog,
        clearLogs,
        lastSentData,
        setLastSentData,
        appUrl,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const ctx = useContext(TelegramContext);
  if (!ctx) throw new Error('useTelegram must be used within TelegramProvider');
  return ctx;
}
