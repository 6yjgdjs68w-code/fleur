import React, { useState } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { 
  Vibrate, Bell, Eye, EyeOff, Check, AlertTriangle, 
  Terminal, ExternalLink, HelpCircle, Copy, CheckCheck, QrCode
} from 'lucide-react';

export function SdkTesterTab() {
  const { 
    triggerHaptic, 
    mainButton, 
    setMainButton, 
    backButton, 
    setBackButton, 
    showModalAlert, 
    showModalConfirm, 
    logs, 
    clearLogs,
    user 
  } = useTelegram();

  const [copiedCode, setCopiedCode] = useState(false);
  const [customAlertText, setCustomAlertText] = useState('Привет из Telegram Mini App!');
  const [popupResult, setPopupResult] = useState<string | null>(null);

  const testHapticStyles: Array<'light' | 'medium' | 'heavy' | 'rigid' | 'soft'> = [
    'light', 'medium', 'heavy', 'rigid', 'soft'
  ];

  const testHapticNotifs: Array<'success' | 'warning' | 'error'> = [
    'success', 'warning', 'error'
  ];

  const handleTestAlert = async () => {
    await showModalAlert('Telegram Alert', customAlertText);
  };

  const handleTestConfirm = async () => {
    const res = await showModalConfirm('Подтверждение', 'Вы уверены, что хотите протестировать это действие в Telegram?');
    setPopupResult(res ? 'Пользователь выбрал: ДА (Confirmed)' : 'Пользователь выбрал: НЕТ (Cancelled)');
  };

  const toggleMainButton = () => {
    setMainButton({
      isVisible: !mainButton.isVisible,
      text: mainButton.isVisible ? 'Кнопка скрыта' : 'Тестовая Главная Кнопка',
      color: '#2481cc',
      callback: () => {
        triggerHaptic('success');
      },
    });
  };

  const toggleMainButtonProgress = () => {
    setMainButton({
      isProgress: !mainButton.isProgress,
    });
  };

  const toggleBackButton = () => {
    setBackButton({
      isVisible: !backButton.isVisible,
    });
  };

  const copyInitSnippet = () => {
    const snippet = `// Инициализация Telegram WebApp в вашем React коде:
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

// Данные пользователя
const user = tg?.initDataUnsafe?.user;
console.log('User ID:', user?.id);

// Управление нижней кнопкой
tg?.MainButton.setText('Оплатить');
tg?.MainButton.show();
tg?.MainButton.onClick(() => {
  tg.sendData(JSON.stringify({ status: 'paid' }));
});`;

    navigator.clipboard.writeText(snippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="pb-28 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Terminal className="w-5 h-5 text-sky-400" />
          <span>Telegram WebApp SDK Тестер</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Интерактивная диагностика и вызов нативных методов Telegram API в реальном времени
        </p>
      </div>

      {/* Telegram User Object inspector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            Telegram.WebApp.initDataUnsafe
          </div>
          <span className="text-[10px] bg-sky-500/10 text-sky-400 border border-sky-500/30 px-2 py-0.5 rounded-md font-mono">
            SDK v7.10
          </span>
        </div>
        <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800/80">
          <pre>{JSON.stringify({
            user: {
              id: user.id,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              language_code: user.language_code || 'ru',
              is_premium: user.is_premium,
            },
            platform: typeof window !== 'undefined' && window.Telegram?.WebApp?.platform ? window.Telegram.WebApp.platform : 'weba',
            colorScheme: 'dark',
            isExpanded: true,
            viewportHeight: 680,
          }, null, 2)}</pre>
        </div>
      </div>

      {/* Haptic Feedback Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-200">
          <Vibrate className="w-4 h-4 text-sky-400" />
          <span>HapticFeedback (Тактильная отдача / Вибрация)</span>
        </div>
        <div className="text-[11px] text-slate-400 mb-3">
          В реальном Telegram вызывает вибромотор Taptic Engine на iPhone или вибрацию на Android.
        </div>

        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Сила удара (impactOccurred):
        </div>
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {testHapticStyles.map((style) => (
            <button
              key={style}
              onClick={() => triggerHaptic(style)}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs py-2 rounded-lg font-medium capitalize transition-all border border-slate-700/60"
            >
              {style}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Системные уведомления (notificationOccurred):
        </div>
        <div className="grid grid-cols-3 gap-2">
          {testHapticNotifs.map((type) => (
            <button
              key={type}
              onClick={() => triggerHaptic(type)}
              className={`py-2 text-xs font-semibold rounded-lg capitalize border active:scale-95 transition-all ${
                type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* MainButton & BackButton controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="text-xs font-bold text-slate-200 mb-2">
          Управление нативными кнопками (MainButton & BackButton)
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
          <button
            onClick={toggleMainButton}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg border border-slate-700 font-medium transition-all"
          >
            {mainButton.isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{mainButton.isVisible ? 'Скрыть MainButton' : 'Показать MainButton'}</span>
          </button>

          <button
            onClick={toggleMainButtonProgress}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg border border-slate-700 font-medium transition-all"
          >
            <span>{mainButton.isProgress ? 'Скрыть спиннер' : 'Показать спиннер'}</span>
          </button>
        </div>

        <button
          onClick={toggleBackButton}
          className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg border border-slate-700 text-xs font-medium transition-all"
        >
          <span>{backButton.isVisible ? 'Скрыть BackButton в шапке' : 'Показать BackButton в шапке'}</span>
        </button>
      </div>

      {/* Popups & Alerts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="text-xs font-bold text-slate-200 mb-2">
          Нативные диалоги Telegram (showAlert / showConfirm)
        </div>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={customAlertText}
            onChange={(e) => setCustomAlertText(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
            placeholder="Текст уведомления..."
          />
          <button
            onClick={handleTestAlert}
            className="bg-sky-500 hover:bg-sky-400 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
          >
            showAlert
          </button>
        </div>
        <button
          onClick={handleTestConfirm}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs py-2 rounded-lg border border-slate-700 active:scale-95 transition-all"
        >
          Тест showConfirm (Ок / Отмена)
        </button>

        {popupResult && (
          <div className="mt-2 text-[11px] p-2 bg-slate-950 border border-slate-800 text-sky-300 rounded-lg font-mono">
            {popupResult}
          </div>
        )}
      </div>

      {/* Code snippet quick copy */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200">Код интеграции в React</span>
          <button
            onClick={copyInitSnippet}
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 bg-sky-950/60 border border-sky-800/40 px-2 py-1 rounded-md transition-colors"
          >
            {copiedCode ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Скопировано!' : 'Скопировать'}</span>
          </button>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Всё приложение готово для работы прямо внутри Telegram WebApp без сторонних костылей.
        </p>
      </div>
    </div>
  );
}
