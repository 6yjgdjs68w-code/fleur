export interface BouquetWrapper {
  id: 'craft' | 'film' | 'fabric';
  name: string;
  desc: string;
  priceDelta: number;
}

export type StemCount = number;

export interface CustomStemOption {
  count: number;
  label: string;
  price: number;
}

export interface StemPrices {
  [count: number]: number | undefined;
}

export interface Bouquet {
  id: string;
  name: string;
  category: 'roses' | 'peonies' | 'tulips' | 'mix' | 'hydrangea';
  basePrice: number; // Base price for minimum stem count in craft
  stemPrices?: StemPrices; // Custom prices for any stem counts
  customStems?: CustomStemOption[]; // Arbitrary custom stem options designed by admin
  image: string;
  description: string;
  flowerComposition: string;
  dimensions: string;
  rating: number;
  reviewsCount: number;
  isBestseller?: boolean;
  isSecretVip?: boolean;
}

export const WRAPPER_OPTIONS: BouquetWrapper[] = [
  {
    id: 'craft',
    name: 'Эко-крафт',
    desc: 'Плотная фактурная дизайнерская бумага',
    priceDelta: 0,
  },
  {
    id: 'film',
    name: 'Матовая плёнка',
    desc: 'Французский матовый стиль с сатиновой лентой',
    priceDelta: 150,
  },
  {
    id: 'fabric',
    name: 'Лён & Шёлк',
    desc: 'Натуральный эко-текстиль и шёлковые ленты',
    priceDelta: 350,
  },
];

export const STEM_OPTIONS: { count: StemCount; label: string; multiplier: number }[] = [
  { count: 5, label: '5 цветов (Мини)', multiplier: 1.0 },
  { count: 7, label: '7 цветов (Классик)', multiplier: 1.35 },
  { count: 11, label: '11 цветов (Пышный)', multiplier: 1.9 },
];

/**
 * Curated authentic, high-resolution fresh floral photography
 * No AI slop or cartoons — genuine florist boutique photography
 */
export const BOUQUETS: Bouquet[] = [
  {
    id: 'fl-1',
    name: 'Розовая Нежность',
    category: 'roses',
    basePrice: 3400,
    // Real fresh blush garden roses in elegant wrapper
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=900&auto=format&fit=crop&q=85',
    description: 'Утонченный авторский монобукет из нежно-розовых садовых роз премиальных сортов с добавлением свежих веточек серебристого эвкалипта. Идеально раскрывается в вазе на 2–3 день.',
    flowerComposition: 'Садовые розы пастельного оттенка, кустовые розы, эвкалипт цинерея',
    dimensions: 'Высота: 45 см • Диаметр: 32 см',
    rating: 4.96,
    reviewsCount: 168,
    isBestseller: true,
  },
  {
    id: 'fl-2',
    name: 'Парижское Утро',
    category: 'peonies',
    basePrice: 4200,
    // Real fresh French Sarah Bernhardt blooming peonies
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=900&auto=format&fit=crop&q=85',
    description: 'Пышные французские пионы сорта Сара Бернар с бархатными лепестками, дополненные белоснежной кружевной маттиолой и веточками фисташки.',
    flowerComposition: 'Французские пионы, маттиола, белая эустома, зелень фисташ',
    dimensions: 'Высота: 50 см • Диаметр: 38 см',
    rating: 4.98,
    reviewsCount: 245,
    isBestseller: true,
  },
  {
    id: 'fl-3',
    name: 'Весенний Шарм',
    category: 'tulips',
    basePrice: 2600,
    // Crisp real fresh double peony tulips in florist arrangement
    image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?w=900&auto=format&fit=crop&q=85',
    description: 'Свежие голландские пионовидные махровые тюльпаны нежно-розовых и пудровых оттенков. Букет источает чистый весенний аромат утренней росы.',
    flowerComposition: 'Махровые пионовидные тюльпаны, ранункулюсы, свежая зелень',
    dimensions: 'Высота: 40 см • Диаметр: 28 см',
    rating: 4.89,
    reviewsCount: 112,
  },
  {
    id: 'fl-4',
    name: 'Лавандовый Закат',
    category: 'hydrangea',
    basePrice: 3900,
    // Real fresh blue Dutch hydrangea with roses
    image: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=900&auto=format&fit=crop&q=85',
    description: 'Воздушная небесно-голубая голландская гортензия премиального калибра в окружении кремовых кустовых роз и соцветий натуральной горной лаванды.',
    flowerComposition: 'Голландская гортензия, кустовые розы, сушеная лаванда, эвкалипт',
    dimensions: 'Высота: 50 см • Диаметр: 40 см',
    rating: 4.93,
    reviewsCount: 104,
    isBestseller: true,
  },
  {
    id: 'fl-5',
    name: 'Шёлковый Румянец',
    category: 'roses',
    basePrice: 3100,
    // Real fresh florist arrangement of cream & pastel roses
    image: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=900&auto=format&fit=crop&q=85',
    description: 'Нежная авторская композиция в тёплых персиково-кремовых полутонах: розы премиальных сортов, гвоздики диантус и кружевная гипсофила.',
    flowerComposition: 'Кремовые розы, пудровый диантус, гипсофила, лагурус',
    dimensions: 'Высота: 45 см • Диаметр: 30 см',
    rating: 4.91,
    reviewsCount: 78,
  },
  {
    id: 'fl-6',
    name: 'Королевский Сад',
    category: 'mix',
    basePrice: 4950,
    // Grand florist mix with real fresh blooms
    image: 'https://images.unsplash.com/photo-1533616688419-b7a585564566?w=900&auto=format&fit=crop&q=85',
    description: 'Торжественный ансамбль королевского размаха: отборные эквадорские розы, сиреневый дельфиниум, пудровая эустома и серебристый эвкалипт популус.',
    flowerComposition: 'Эквадорские розы, дельфиниум, лизиантус, эвкалипт популус',
    dimensions: 'Высота: 55 см • Диаметр: 45 см',
    rating: 4.99,
    reviewsCount: 342,
    isBestseller: true,
  },

  // SECRET VIP BOUQUETS for Founder's Circle members
  {
    id: 'fl-vip-1',
    name: 'Императорский Пион (Founder’s Edition)',
    category: 'peonies',
    basePrice: 8900,
    image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=900&auto=format&fit=crop&q=85',
    description: 'Закрытая клубная коллекция. Редкие селекционные пионы кораллового и кремового оттенков с каллиграфической карточкой на хлопковой бумаге.',
    flowerComposition: 'Редкие древовидные пионы Coral Sunset, маттиола, озотамнус, бархатная лента',
    dimensions: 'Высота: 60 см • Диаметр: 50 см',
    rating: 5.0,
    reviewsCount: 42,
    isSecretVip: true,
  },
  {
    id: 'fl-vip-2',
    name: 'Монмартр Гран Крю (Founder’s Edition)',
    category: 'roses',
    basePrice: 11500,
    image: 'https://images.unsplash.com/photo-1587556930799-8dca6a63ac91?w=900&auto=format&fit=crop&q=85',
    description: 'Роскошная композиция из 51 отборной розы в замшевой шляпной коробке с тиснением золотом. Собирается лично шеф-флористом Fleur.',
    flowerComposition: '51 отборная французская роза в шляпной коробке Haute Couture',
    dimensions: 'Высота: 48 см • Диаметр: 45 см',
    rating: 5.0,
    reviewsCount: 56,
    isSecretVip: true,
  },
];

export interface BouquetOfDayData {
  id: string;
  name: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  image: string;
  description: string;
  composition: string;
  dimensions: string;
  rating: number;
}

export const BOUQUET_OF_THE_DAY: BouquetOfDayData = {
  id: 'fl-day-1',
  name: 'Версальский Рассвет',
  originalPrice: 5200,
  discountedPrice: 3640,
  discountPercent: 30,
  image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=1000&auto=format&fit=crop&q=85',
  description: 'Специальный букет дня: пышные садовые розы, сиреневая маттиола и серебристый эвкалипт в эксклюзивной упаковке со скидкой 30%.',
  composition: 'Садовые розы пастель, французская маттиола, эвкалипт, шёлковая лента',
  dimensions: 'Высота: 50 см • Диаметр: 38 см',
  rating: 4.99,
};

