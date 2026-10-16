import React from 'react';
import { useTelegram } from '../context/TelegramContext';
import { Terminal, Trash2, X, Send, Vibrate, Check, ArrowDownCircle } from 'lucide-react';

interface ConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConsoleDrawer({ isOpen, onClose }: ConsoleDrawerProps) {
  const { logs, clearLogs, lastSentData, user, appUrl } = useTelegram();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-950 border-l border-slate-800 text-slate-200 flex flex-col shadow-2xl animate-in slide-in-from-right-5">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-sky-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Telegram SDK Консоль
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              title="Очистить логи"
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick summary stats */}
      <div className="p-3 bg-slate-900/60 border-b border-slate-800 text-[11px] grid grid-cols-2 gap-2">
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
          <div className="text-slate-500 text-[10px]">Активный пользователь</div>
          <div className="font-semibold text-sky-400 truncate">@{user.username || 'user'} (ID {user.id})</div>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
          <div className="text-slate-500 text-[10px]">Событий зафиксировано</div>
          <div className="font-semibold text-emerald-400">{logs.length}</div>
        </div>
      </div>

      {/* Last Sent Data Preview */}
      {lastSentData && (
        <div className="p-3 bg-slate-900/40 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 mb-1">
            <Send className="w-3 h-3" />
            <span>Последний payload в tg.sendData():</span>
          </div>
          <pre className="text-[10px] font-mono bg-slate-950 p-2 rounded border border-slate-800 text-amber-200 overflow-x-auto max-h-32">
            {JSON.stringify(lastSentData, null, 2)}
          </pre>
        </div>
      )}

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Событий пока нет.</p>
            <p className="text-[11px] mt-1 text-slate-600">Нажимайте кнопки в приложении, добавляйте товары или переключайте табы.</p>
          </div>
        ) : (
          logs.map((log) => {
            const badgeColor = {
              haptic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
              button: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
              data: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              system: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
              popup: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            }[log.type];

            return (
              <div key={log.id} className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded border uppercase font-bold text-[9px] ${badgeColor}`}>
                    {log.type}
                  </span>
                  <span className="text-slate-500">{log.time}</span>
                </div>
                <div className="text-slate-200 text-[11px] font-sans font-medium">{log.message}</div>
                {log.payload && (
                  <pre className="text-[10px] text-slate-400 bg-slate-950 p-1.5 rounded overflow-x-auto border border-slate-900">
                    {JSON.stringify(log.payload, null, 2)}
                  </pre>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
