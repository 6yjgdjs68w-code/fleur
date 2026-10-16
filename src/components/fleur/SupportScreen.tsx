import React from 'react';
import { MessageCircle, Phone, MapPin, Clock, HelpCircle, Shield, ChevronDown, Settings, Wrench, ShieldCheck } from 'lucide-react';
import { StoreSettings } from './AdminPanelModal';
import { UserRole } from '../../types/fleur';

interface SupportScreenProps {
  storeSettings?: StoreSettings;
  onOpenAdmin?: () => void;
  userRole?: UserRole;
}

export function SupportScreen({ storeSettings, onOpenAdmin, userRole = 'client' }: SupportScreenProps) {
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const telegramUrl = storeSettings?.telegramSupportUrl || 'https://t.me/linaloveinal';
  const phone = storeSettings?.phone || '+7 (495) 890-21-44';
  const address = storeSettings?.address || 'г. Москва, ул. Большая Никитская, 22';
  const workingHours = storeSettings?.workingHours || '08:00 — 23:00 ежедневно';

  const handleContactSupport = () => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(telegramUrl);
    } else {
      window.open(telegramUrl, '_blank');
    }
  };

  const faqs = [
    {
      q: 'Присылаете ли вы фото букета перед доставкой?',
      a: 'Да! Флорист присылает фото собранного букета в Telegram перед передачей курьеру. Вы сможете внести любые пожелания.',
    },
    {
      q: 'Как работает доставка-сюрприз (без адреса)?',
      a: 'Вам достаточно указать номер телефона получателя. Наш вежливый курьер деликатно свяжется и уточнит удобное время и место, сохранив интригу.',
    },
    {
      q: 'Как ухаживать за цветами, чтобы они стояли дольше?',
      a: 'В подарок к каждому букету мы вкладываем аквабокс с водой, порошок кризала для продления жизни цветов и подробную инструкцию.',
    },
    {
      q: 'Какая гарантия свежести цветов?',
      a: 'Мы получаем поставки роз, пионов и тюльпанов каждые 24 часа. Если букет завянет раньше 5 дней при правильном уходе, мы бесплатно заменим его.',
    },
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="text-center pt-1 pb-1">
        <h2 className="font-serif-fleur text-2xl text-[#FAF6F0] font-normal tracking-wide">
          Служба заботы Fleur
        </h2>
        <p className="text-xs text-stone-300 mt-1 max-w-xs mx-auto">
          Всегда на связи, чтобы помочь с выбором идеального букета и ответить на любые вопросы
        </p>
      </div>

      {/* Main Support Card */}
      <div className="bg-white text-[#2D1F18] rounded-3xl p-5 shadow-xl border border-stone-100 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FDE8ED] text-[#C97A8B] flex items-center justify-center mx-auto mb-3 shadow-inner">
          <MessageCircle className="w-7 h-7" />
        </div>

        <h3 className="font-serif-fleur font-bold text-base text-[#2D1F18]">
          Персональный флорист в Telegram
        </h3>
        <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Отвечаем в течение 2 минут. Поможем составить индивидуальную композицию или согласовать особенное время доставки.
        </p>

        {/* Button: Поддержка */}
        <button
          onClick={handleContactSupport}
          className="w-full mt-4 bg-[#F4B6C2] hover:bg-[#e8a3b0] active:scale-[0.98] text-[#3E2C23] font-bold py-3.5 px-4 rounded-2xl text-xs sm:text-sm shadow-xl shadow-[#F4B6C2]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Поддержка</span>
        </button>
      </div>

      {/* Boutique Details Card */}
      <div className="bg-white text-[#2D1F18] rounded-3xl p-5 shadow-xl border border-stone-100 space-y-3">
        <h3 className="font-serif-fleur font-bold text-sm text-[#2D1F18]">
          Контакты бутика
        </h3>

        <div className="space-y-2.5 text-xs text-stone-600">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#C97A8B]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#3E2C23]">{phone}</div>
              <div className="text-[10px] text-stone-400">Прямой номер бутика</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#C97A8B]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#3E2C23]">{workingHours}</div>
              <div className="text-[10px] text-stone-400">Приём заказов и доставка</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#FAF6F0] flex items-center justify-center text-[#C97A8B]">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-[#3E2C23]">{address}</div>
              <div className="text-[10px] text-stone-400">Флагманский цветочный салон</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white text-[#2D1F18] rounded-3xl p-5 shadow-xl border border-stone-100 space-y-3">
        <h3 className="font-serif-fleur font-bold text-sm text-[#2D1F18] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#C97A8B]" />
          <span>Частые вопросы</span>
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-stone-100 rounded-2xl p-3 cursor-pointer hover:bg-stone-50 transition-colors"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#2D1F18]">
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {isOpen && (
                  <p className="text-[11px] text-stone-600 mt-2 leading-relaxed pt-2 border-t border-stone-100">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Discrete employee login for owner */}
      <div className="pt-4 pb-2 text-center">
        <button
          onClick={onOpenAdmin}
          className="text-[11px] text-stone-400 hover:text-[#F4B6C2] transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          {userRole === 'admin' ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-amber-200">Панель администратора (Вы вошли)</span>
            </>
          ) : (
            <span>© Fleur Boutique • Служебный вход</span>
          )}
        </button>
      </div>
    </div>
  );
}
