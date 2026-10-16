import { BOUQUETS, Bouquet, BouquetOfDayData, BOUQUET_OF_THE_DAY } from '../../data/fleurData';
import { LoyaltyTier } from '../../types/loyalty';
import { BouquetOfDayCard } from './BouquetOfDayCard';
import { Sparkles, ArrowRight, Clock, ShieldCheck, Gift, Star, Award, Compass } from 'lucide-react';

interface HomeScreenProps {
  onOpenCatalog: () => void;
  onSelectBouquet: (bouquet: Bouquet) => void;
  onOpenBonuses: () => void;
  onOpenFortune: () => void;
  onOpenStatus: () => void;
  onOrderBouquetOfDay: (bouquet: Bouquet, price: number) => void;
  userTier: LoyaltyTier;
  bouquets?: Bouquet[];
  bouquetOfDayData?: BouquetOfDayData;
}

export function HomeScreen({
  onOpenCatalog,
  onSelectBouquet,
  onOpenBonuses,
  onOpenFortune,
  onOpenStatus,
  onOrderBouquetOfDay,
  userTier,
  bouquets = BOUQUETS,
  bouquetOfDayData = BOUQUET_OF_THE_DAY,
}: HomeScreenProps) {
  const bestsellers = bouquets.filter((b) => b.isBestseller).slice(0, 2);

  return (
    <div className="space-y-5 pb-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#4A352B] to-[#36251D] border border-[#5A4236] p-6 shadow-2xl text-center">
        {/* Soft Pink & Gold Glow Backdrops */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#F4B6C2]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#FFD700]/10 blur-3xl pointer-events-none" />

        {/* Brand Tagline */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4B6C2]/15 border border-[#F4B6C2]/30 text-[#F4B6C2] text-xs font-semibold mb-3 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fleur • Цветочный дом высокой флористики</span>
        </div>

        {/* Exact Requested Slogan */}
        <h1 className="font-serif-fleur text-2xl sm:text-3xl text-[#FAF6F0] font-normal tracking-wide leading-snug">
          Авторские букеты из свежайших роз, французских пионов и гортензий
        </h1>

        <p className="text-xs sm:text-sm text-stone-300 mt-2.5 max-w-sm mx-auto leading-relaxed">
          Безупречный сервис доставки цветов в Москве. Свежие поставки каждое утро и фото букета перед отправкой.
        </p>

        {/* Hero Image */}
        <div className="relative my-5 rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-16/9 group">
          <img
            src="https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=1000&auto=format&fit=crop&q=85"
            alt="Авторские букеты Fleur"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
            <span className="font-serif-fleur italic text-stone-200">Коллекция «Парижский романс»</span>
            <span className="bg-[#F4B6C2] text-[#3E2C23] font-bold px-2 py-0.5 rounded-full text-[10px]">
              Свежая поставка
            </span>
          </div>
        </div>

        {/* Action Button: Choose a Bouquet */}
        <button
          onClick={onOpenCatalog}
          className="w-full bg-[#F4B6C2] hover:bg-[#e8a3b0] active:scale-[0.98] text-[#3E2C23] font-bold py-3.5 px-6 rounded-2xl text-sm shadow-xl shadow-[#F4B6C2]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Выбрать букет</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Bouquet of the Day (Букет Дня) — 30% discount at 12:00 with flexible 24h delivery slot */}
      <BouquetOfDayCard onOrderBouquetOfDay={onOrderBouquetOfDay} bouquetOfDayData={bouquetOfDayData} />

      {/* Wheel of Fortune Interactive Banner */}
      <div
        onClick={onOpenFortune}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FFD700]/20 via-[#4A352B] to-[#F4B6C2]/20 border border-[#FFD700]/40 p-4 shadow-xl cursor-pointer hover:border-[#FFD700] transition-all group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFD700]/20 text-[#FFD700] flex items-center justify-center font-bold text-xl shrink-0 group-hover:rotate-12 transition-transform shadow-inner">
              🎡
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-serif-fleur font-bold text-sm text-[#FAF6F0]">
                <span>Колесо Фортуны</span>
                <span className="text-[10px] bg-[#FFD700] text-stone-950 font-bold px-1.5 py-0.2 rounded uppercase">
                  Спин в день
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                Крутите колесо и выигрывайте до 10% скидки или 100 бонусов
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#FFD700] group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
      </div>

      {/* VIP Club Status Banner */}
      <div
        onClick={onOpenStatus}
        className="rounded-3xl bg-white text-[#2D1F18] p-4 shadow-xl border border-stone-100 flex items-center justify-between cursor-pointer hover:border-[#FFD700] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF3D1] text-[#D4AF37] flex items-center justify-center text-xl shrink-0">
            {userTier.badge}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Ваш клубный статус
            </div>
            <div className="font-serif-fleur font-bold text-sm text-[#2D1F18] flex items-center gap-1.5">
              <span>{userTier.name} Member</span>
              <span className="text-xs">{userTier.badge}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-[#C97A8B] font-bold">
          <span>Привилегии</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Boutique Highlights (White cards with rounded corners) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white text-[#2D1F18] rounded-3xl p-4 shadow-lg border border-stone-100 flex flex-col justify-between">
          <div className="w-9 h-9 rounded-2xl bg-[#FDE8ED] text-[#3E2C23] flex items-center justify-center mb-2.5">
            <Clock className="w-4 h-4 text-[#C97A8B]" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-[#2D1F18] font-serif-fleur text-sm">Доставка за 60 мин</h3>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">В аквабоксе со свежей водой и подкормкой</p>
          </div>
        </div>

        <div className="bg-white text-[#2D1F18] rounded-3xl p-4 shadow-lg border border-stone-100 flex flex-col justify-between">
          <div className="w-9 h-9 rounded-2xl bg-[#FDE8ED] text-[#3E2C23] flex items-center justify-center mb-2.5">
            <ShieldCheck className="w-4 h-4 text-[#C97A8B]" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-[#2D1F18] font-serif-fleur text-sm">Гарантия стойкости</h3>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">Букеты стоят от 5 до 10 дней или заменим</p>
          </div>
        </div>

        <div className="bg-white text-[#2D1F18] rounded-3xl p-4 shadow-lg border border-stone-100 flex flex-col justify-between">
          <div className="w-9 h-9 rounded-2xl bg-[#FDE8ED] text-[#3E2C23] flex items-center justify-center mb-2.5">
            <Gift className="w-4 h-4 text-[#C97A8B]" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-[#2D1F18] font-serif-fleur text-sm">Открытка в подарок</h3>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">Флорист аккуратно выведет ваши слова от руки</p>
          </div>
        </div>

        <div 
          onClick={onOpenBonuses}
          className="bg-white text-[#2D1F18] rounded-3xl p-4 shadow-lg border border-stone-100 flex flex-col justify-between cursor-pointer hover:border-[#F4B6C2] transition-colors"
        >
          <div className="w-9 h-9 rounded-2xl bg-[#FDE8ED] text-[#3E2C23] flex items-center justify-center mb-2.5">
            <Sparkles className="w-4 h-4 text-[#C97A8B]" />
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-xs text-[#2D1F18] font-serif-fleur text-sm">
              <span>Скидка -10%</span>
              <span className="text-[9px] bg-[#F4B6C2] px-1 rounded text-[#3E2C23]">FIRST</span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">Промокод на ваш первый заказ</p>
          </div>
        </div>
      </div>

      {/* Featured Bouquets Teaser */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="font-serif-fleur text-lg text-[#FAF6F0] font-normal tracking-wide">
              Избранные букеты
            </h2>
            <p className="text-[11px] text-stone-300">Свежие поставки роз и пионов</p>
          </div>
          <button
            onClick={onOpenCatalog}
            className="text-xs text-[#F4B6C2] hover:underline font-medium flex items-center gap-0.5 cursor-pointer"
          >
            <span>В каталог</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {bestsellers.map((bouquet) => (
            <div
              key={bouquet.id}
              onClick={() => onSelectBouquet(bouquet)}
              className="bg-white text-[#2D1F18] rounded-3xl overflow-hidden p-3 shadow-xl border border-stone-100 flex flex-col justify-between cursor-pointer group hover:shadow-2xl transition-all"
            >
              <div>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 mb-2.5">
                  <img
                    src={bouquet.image}
                    alt={bouquet.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 bg-[#F4B6C2] text-[#3E2C23] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shadow">
                    Хит
                  </span>
                </div>
                <h3 className="font-serif-fleur font-semibold text-sm text-[#2D1F18] line-clamp-1">
                  {bouquet.name}
                </h3>
                <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                  {bouquet.flowerComposition}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                <span className="font-bold text-sm text-[#3E2C23] whitespace-nowrap shrink-0">
                  от&nbsp;{bouquet.basePrice.toLocaleString('ru-RU')}&nbsp;₽
                </span>
                <span className="text-[11px] text-[#C97A8B] font-bold group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
