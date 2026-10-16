import React, { useState } from 'react';
import { useTelegram } from '../context/TelegramContext';
import { 
  X, Bot, Copy, Check, ExternalLink, Terminal, 
  Smartphone, Sparkles, CheckCheck 
} from 'lucide-react';

interface BotFatherInfoModalProps {
  onClose: () => void;
}

export function BotFatherInfoModal({ onClose }: BotFatherInfoModalProps) {
  const { appUrl, triggerHaptic } = useTelegram();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const copyUrl = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const pythonSnippet = `# Быстрый запуск в Telegram боте (aiogram 3.x)
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

bot = Bot(token="ВАШ_ТОКЕН")
dp = Dispatcher()

@dp.message(CommandStart())
async def start(message: types.Message):
    kb = InlineKeyboardMarkup(inline_keyboard=[[
        InlineKeyboardButton(text="🍕 Открыть меню и сделать заказ", web_app=WebAppInfo(url="${appUrl}"))
    ]])
    await message.answer("Добро пожаловать в TON Gastro!", reply_markup=kb)

# Прием заказа из корзины Mini App
@dp.message(F.web_app_data)
async def webapp_handler(message: types.Message):
    await message.answer(f"✅ Получен заказ:\\n<code>{message.web_app_data.data}</code>", parse_mode="HTML")`;

  const copyCode = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(pythonSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xs p-0 sm:p-4">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl p-5 animate-in slide-in-from-bottom-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-base text-white">Подключение к вашему Telegram-боту</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 mb-4">
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
            Прямая ссылка на это приложение (URL для BotFather):
          </label>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-sky-300 truncate flex-1 select-all bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
              {appUrl}
            </code>
            <button
              onClick={copyUrl}
              className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-sm"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Скопировано!' : 'Копировать'}</span>
            </button>
          </div>
        </div>

        {/* 3 Step Instruction */}
        <div className="space-y-3 mb-4 text-xs">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 border border-sky-500/30">1</span>
            <div>
              <div className="font-bold text-white">Откройте @BotFather в Telegram</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Найдите официального бота <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline inline-flex items-center gap-0.5">@BotFather <ExternalLink className="w-2.5 h-2.5" /></a>
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 border border-sky-500/30">2</span>
            <div>
              <div className="font-bold text-white">Команда /newapp или /setmenubutton</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Отправьте <code className="text-sky-300">/setmenubutton</code>, выберите бота и вставьте скопированную ссылку. Кнопка меню сразу появится в диалоге!
              </p>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex gap-3">
            <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 border border-sky-500/30">3</span>
            <div>
              <div className="font-bold text-white">Готово! Приложение открывается у всех клиентов</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Клиенты нажимают «Запустить» в Telegram и сразу попадают в приложение. Никакого Google, паролей или SMS — Telegram сам авторизует пользователя!
              </p>
            </div>
          </div>
        </div>

        {/* Note on Google login vs Telegram Native */}
        <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-3 text-xs mb-4">
          <div className="font-bold text-sky-300 text-[11px] mb-1">
            🔒 Почему предпросмотр в AI Studio мог запросить Google:
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Внутренний тестовый стенд Cloud Run временно защищен аккаунтом разработчика. Когда приложение опубликовано или запускается внутри Telegram, пользователи <strong>вообще не видят экранов Google</strong> — авторизация происходит на 100% автоматически через их Telegram-профиль!
          </p>
        </div>

        {/* Python Snippet */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-300 text-[11px]">Код бота на Python</span>
            <button
              onClick={copyCode}
              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              {copiedCode ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode ? 'Скопировано' : 'Копировать'}</span>
            </button>
          </div>
          <pre className="font-mono text-[10px] text-slate-300 overflow-x-auto max-h-36 leading-relaxed">
            {pythonSnippet}
          </pre>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}
