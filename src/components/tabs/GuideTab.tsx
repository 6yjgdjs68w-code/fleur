import React, { useState } from 'react';
import { useTelegram } from '../../context/TelegramContext';
import { 
  Bot, Check, Copy, ExternalLink, Sparkles, Terminal, 
  HelpCircle, Smartphone, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';

export function GuideTab() {
  const { appUrl, triggerHaptic } = useTelegram();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCodeType, setCopiedCodeType] = useState<string | null>(null);
  const [activeCodeLang, setActiveCodeLang] = useState<'python' | 'nodejs'>('python');

  const copyUrlToClipboard = () => {
    triggerHaptic('success');
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2200);
  };

  const pythonSnippet = `# Бот на Python (aiogram 3.x) с кнопкой открытия этого Mini App
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, MenuButtonWebApp

BOT_TOKEN = "ВАШ_ТОКЕН_ОТ_BOTFATHER"
APP_URL = "${appUrl}"

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    # 1. Кнопка в сообщении
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Открыть Mini App", web_app=WebAppInfo(url=APP_URL))]
    ])
    
    # 2. Кнопка Menu Button в левом нижнем углу
    await bot.set_chat_menu_button(
        chat_id=message.chat.id,
        menu_button=MenuButtonWebApp(text="Магазин", web_app=WebAppInfo(url=APP_URL))
    )

    await message.answer(
        f"Привет, {message.from_user.first_name}! Нажми кнопку ниже, чтобы открыть приложение:",
        reply_markup=keyboard
    )

# Обработка данных, отправленных из Mini App через tg.sendData()
@dp.message(F.web_app_data)
async def handle_webapp_data(message: types.Message):
    data = message.web_app_data.data
    await message.answer(f"📦 Получен заказ из Mini App:\\n<code>{data}</code>", parse_mode="HTML")

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())`;

  const nodejsSnippet = `// Бот на Node.js (Telegraf) с поддержкой Mini App
import { Telegraf, Markup } from 'telegraf';

const BOT_TOKEN = 'ВАШ_ТОКЕН_ОТ_BOTFATHER';
const APP_URL = '${appUrl}';

const bot = new Telegraf(BOT_TOKEN);

bot.start(async (ctx) => {
  // Кнопка в чате
  await ctx.reply('Нажмите кнопку, чтобы запустить Telegram Mini App:', 
    Markup.inlineKeyboard([
      Markup.button.webApp('🚀 Запустить приложение', APP_URL)
    ])
  );
  
  // Кнопка Menu Button внизу экрана
  await ctx.setChatMenuButton({
    type: 'web_app',
    text: 'Открыть App',
    web_app: { url: APP_URL }
  });
});

// Получение данных из tg.sendData()
bot.on('message', async (ctx) => {
  if (ctx.message.web_app_data) {
    const payload = JSON.parse(ctx.message.web_app_data.data);
    await ctx.reply(\`✅ Принят заказ #\${payload.order_id} на сумму \${payload.total} ₽!\`);
  }
});

bot.launch();
console.log('Бот запущен!');`;

  const copyCode = (type: 'python' | 'nodejs') => {
    triggerHaptic('success');
    const text = type === 'python' ? pythonSnippet : nodejsSnippet;
    navigator.clipboard.writeText(text);
    setCopiedCodeType(type);
    setTimeout(() => setCopiedCodeType(null), 2000);
  };

  return (
    <div className="pb-28 space-y-4">
      {/* Hero card */}
      <div className="rounded-2xl bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-800 p-5 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-15 text-9xl pointer-events-none select-none">
          ✈️
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Официальная технология Telegram Mini Apps (TMA)</span>
          </div>
          <h2 className="text-xl font-black tracking-tight leading-snug">
            Да! Вы можете создать любое приложение для Telegram
          </h2>
          <p className="text-xs text-sky-100 mt-1.5 leading-relaxed max-w-sm">
            Telegram Mini App — это веб-приложение (React, Vue, HTML5), которое открывается прямо внутри Telegram на смартфонах и компьютерах без загрузки из App Store.
          </p>
        </div>
      </div>

      {/* Direct App URL card with copy button */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
            Прямой URL этого приложения для подключения к боту:
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-medium">
            Онлайн
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 mb-3">
          <code className="text-xs font-mono text-sky-300 truncate flex-1 select-all">
            {appUrl}
          </code>
          <button
            onClick={copyUrlToClipboard}
            className="shrink-0 flex items-center gap-1 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? 'Скопировано!' : 'Копировать'}</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          Эту ссылку можно прямо сейчас вставить в бота через <span className="text-sky-400 font-semibold">@BotFather</span>, и она откроется прямо в окне Telegram!
        </p>
      </div>

      {/* Step by step instructions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Bot className="w-4 h-4 text-sky-400" />
          <span>Как подключить к Telegram за 4 шага (инструкция)</span>
        </h3>

        <div className="space-y-3.5 text-xs">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-500/40">
              1
            </div>
            <div>
              <div className="font-bold text-slate-200">Откройте официального бота @BotFather</div>
              <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                В строке поиска Telegram найдите бота с синей галочкой <code className="text-sky-300">@BotFather</code> или перейдите по ссылке <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline inline-flex items-center gap-0.5">t.me/BotFather <ExternalLink className="w-2.5 h-2.5" /></a>.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-500/40">
              2
            </div>
            <div>
              <div className="font-bold text-slate-200">Создайте бота или используйте существующего</div>
              <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Отправьте команду <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">/newbot</code>, укажите название (например, <em>Мой Магазин</em>) и юзернейм (например, <em>my_shop_app_bot</em>). Вы получите токен API.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-500/40">
              3
            </div>
            <div>
              <div className="font-bold text-slate-200">Создайте Mini App через команду /newapp</div>
              <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Отправьте <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">/newapp</code> в @BotFather:
              </p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-400 pl-1">
                <li>Выберите вашего бота</li>
                <li>Введите заголовок и описание</li>
                <li>Загрузите аватарку (640x360 px)</li>
                <li>Вставьте URL: <strong className="text-sky-300">{appUrl}</strong></li>
                <li>Задайте короткое имя (short name), например: <code className="text-sky-300">app</code></li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-500/40">
              4
            </div>
            <div>
              <div className="font-bold text-slate-200">Настройте кнопку Меню (/setmenubutton)</div>
              <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">
                Чтобы приложение открывалось большой кнопкой в углу экрана у каждого пользователя, отправьте <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">/setmenubutton</code>, выберите бота и укажите тот же URL!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code snippets */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Готовый код Telegram Бота
            </h4>
          </div>
          <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[11px]">
            <button
              onClick={() => setActiveCodeLang('python')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeCodeLang === 'python' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Python (aiogram)
            </button>
            <button
              onClick={() => setActiveCodeLang('nodejs')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeCodeLang === 'nodejs' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Node.js (Telegraf)
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="bg-slate-950 text-slate-200 font-mono text-[11px] p-3 rounded-lg overflow-x-auto border border-slate-800 max-h-64 leading-relaxed">
            {activeCodeLang === 'python' ? pythonSnippet : nodejsSnippet}
          </pre>
          <button
            onClick={() => copyCode(activeCodeLang)}
            className="absolute top-2.5 right-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-medium text-[11px] px-2.5 py-1 rounded border border-slate-700 flex items-center gap-1 shadow"
          >
            {copiedCodeType === activeCodeLang ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copiedCodeType === activeCodeLang ? 'Скопировано!' : 'Копировать код'}</span>
          </button>
        </div>
      </div>

      {/* Feature capabilities banner */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="text-amber-400 font-bold mb-1 flex items-center gap-1">
            <span>⭐</span>
            <span>Telegram Stars</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Официальная валюта Telegram для приема цифровых платежей прямо в Mini App без внешних эквайрингов.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="text-sky-400 font-bold mb-1 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Haptic Feedback</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Настоящая тактильная вибрация смартфона при нажатии кнопок, покупках и играх через официальный SDK.
          </p>
        </div>
      </div>
    </div>
  );
}
