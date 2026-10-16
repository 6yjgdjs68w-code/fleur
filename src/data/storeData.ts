export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  category: 'pizza' | 'sushi' | 'bowls' | 'coffee' | 'desserts';
  price: number;
  oldPrice?: number;
  weight: string;
  calories: number;
  proteins: number;
  fats: number;
  carbs: number;
  description: string;
  image: string;
  isHit?: boolean;
  isNew?: boolean;
  isSpicy?: boolean;
  isVegan?: boolean;
  sizes?: { id: string; name: string; priceDelta: number }[];
  toppings?: ProductOption[];
}

export interface PromoStory {
  id: string;
  title: string;
  badge: string;
  subtitle: string;
  image: string;
  gradient: string;
  discountCode?: string;
}

export interface OrderRecord {
  id: string;
  date: string;
  status: 'delivered' | 'cooking' | 'delivering' | 'cancelled';
  statusText: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  starsCashback: number;
  deliveryAddress: string;
}

export const PROMO_STORIES: PromoStory[] = [
  {
    id: 's1',
    title: 'Скидка 20% на первый заказ',
    badge: 'ПРОМОКОД',
    subtitle: 'Введи промокод TELEGRAM в корзине',
    discountCode: 'TELEGRAM',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    id: 's2',
    title: 'Telegram Stars Кешбэк',
    badge: 'КЕШБЭК 15%',
    subtitle: 'Оплачивай звездами и копи бонусы',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 's3',
    title: 'Римская пицца недели',
    badge: 'ШЕФ-МЕНЮ',
    subtitle: 'Трюфельная салями с горгонзолой',
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80',
    gradient: 'from-rose-600 to-pink-700',
  },
];

export const PRODUCTS_LIST: Product[] = [
  {
    id: 'pz-1',
    name: 'Трюфельная Римская с прошутто',
    category: 'pizza',
    price: 890,
    oldPrice: 990,
    weight: '490 г',
    calories: 780,
    proteins: 32,
    fats: 28,
    carbs: 85,
    description: 'Хрустящее воздушное тесто на закваске, прошутто котто, моцарелла фьор ди латте, трюфельный крем и свежая руккола.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    isHit: true,
    sizes: [
      { id: 'std', name: 'Стандарт (28 см)', priceDelta: 0 },
      { id: 'xl', name: 'Большая (35 см)', priceDelta: 240 },
    ],
    toppings: [
      { id: 't1', name: 'Сырный бортик', price: 90 },
      { id: 't2', name: 'Двойная моцарелла', price: 110 },
      { id: 't3', name: 'Острый халапеньо', price: 40 },
    ],
  },
  {
    id: 'pz-2',
    name: 'Пепперони Диабло',
    category: 'pizza',
    price: 740,
    weight: '460 г',
    calories: 740,
    proteins: 29,
    fats: 31,
    carbs: 80,
    description: 'Пикантная чоризо, маринованный перец халапеньо, томатный соус Mutti и тянущийся сыр моцарелла.',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
    isSpicy: true,
    isHit: true,
    sizes: [
      { id: 'std', name: 'Стандарт (28 см)', priceDelta: 0 },
      { id: 'xl', name: 'Большая (35 см)', priceDelta: 220 },
    ],
    toppings: [
      { id: 't1', name: 'Сырный бортик', price: 90 },
      { id: 't3', name: 'Экстра халапеньо', price: 40 },
    ],
  },
  {
    id: 'pz-3',
    name: 'Страчателла и Вяленые Томаты',
    category: 'pizza',
    price: 820,
    weight: '470 г',
    calories: 650,
    proteins: 24,
    fats: 22,
    carbs: 84,
    description: 'Нежнейший сливочный сыр страчателла, сладкие вяленые томаты, кедровые орешки и домашний песто из базилика.',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
    isVegan: true,
    isNew: true,
    sizes: [
      { id: 'std', name: 'Стандарт (28 см)', priceDelta: 0 },
      { id: 'xl', name: 'Большая (35 см)', priceDelta: 230 },
    ],
  },
  {
    id: 'sh-1',
    name: 'Филадельфия Royal с лососем',
    category: 'sushi',
    price: 790,
    oldPrice: 890,
    weight: '290 г (8 шт)',
    calories: 520,
    proteins: 22,
    fats: 19,
    carbs: 58,
    description: 'Премиальный охлажденный фарерский лосось, толстый слой сыра Cremette, хрустящий огурчик и спелое авокадо.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
    isHit: true,
  },
  {
    id: 'sh-2',
    name: 'Ролл Дракон с копченым угрем',
    category: 'sushi',
    price: 840,
    weight: '280 г (8 шт)',
    calories: 540,
    proteins: 20,
    fats: 22,
    carbs: 60,
    description: 'Копченый угорь в карамельном унаги-соусе, спелый авокадо, сливочный сыр и золотистый кунжут.',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&auto=format&fit=crop&q=80',
    isHit: true,
  },
  {
    id: 'sh-3',
    name: 'Запеченный Сет Токио Хит',
    category: 'sushi',
    price: 1590,
    oldPrice: 1850,
    weight: '850 г (24 шт)',
    calories: 1250,
    proteins: 48,
    fats: 44,
    carbs: 140,
    description: 'Три вида запеченных роллов под сырной шапочкой: с крабом, лососем и креветками под соусом спайси.',
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
    isHit: true,
  },
  {
    id: 'bw-1',
    name: 'Боул с тунцом и киноа',
    category: 'bowls',
    price: 680,
    weight: '380 г',
    calories: 460,
    proteins: 34,
    fats: 12,
    carbs: 48,
    description: 'Свежий тунец Bluefin, киноа, бобы эдамаме, авокадо, чука, маринованный редис и понзу-заправка.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    isNew: true,
  },
  {
    id: 'bw-2',
    name: 'Зеленый Боул с лососем и яйцом пашот',
    category: 'bowls',
    price: 720,
    weight: '400 г',
    calories: 510,
    proteins: 31,
    fats: 22,
    carbs: 42,
    description: 'Слабосоленый лосось, шпинат, брокколи на пару, огурцы, тыквенные семечки и яйцо пашот с жидким желтком.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'cf-1',
    name: 'Фисташковый Раф',
    category: 'coffee',
    price: 360,
    weight: '350 мл',
    calories: 280,
    proteins: 6,
    fats: 14,
    carbs: 32,
    description: 'Двойной эспрессо, взбитый с горячими сливками, натуральной сицилийской фисташковой пастой и морской солью.',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    isHit: true,
  },
  {
    id: 'cf-2',
    name: 'Бамбл Карамельный Колдбрю',
    category: 'coffee',
    price: 380,
    weight: '400 мл',
    calories: 190,
    proteins: 2,
    fats: 1,
    carbs: 41,
    description: 'Свежевыжатый апельсиновый сок, холодный кофе cold brew, лед и карамельный сироп с цедрой.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
    isHit: true,
  },
  {
    id: 'ds-1',
    name: 'Баскский чизкейк Сан-Себастьян',
    category: 'desserts',
    price: 460,
    weight: '190 г',
    calories: 490,
    proteins: 9,
    fats: 32,
    carbs: 38,
    description: 'Обожженная карамельная корочка снаружи и тающая кремовая серединка внутри. Подается с ягодным кули.',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
    isHit: true,
  },
  {
    id: 'ds-2',
    name: 'Дубайский Шоколад с фисташкой',
    category: 'desserts',
    price: 590,
    weight: '150 г',
    calories: 580,
    proteins: 8,
    fats: 36,
    carbs: 52,
    description: 'Хрустящее тесто катаифи, густая фисташковая паста с тахини в оболочке из бельгийского молочного шоколада.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    isNew: true,
    isHit: true,
  },
];

export const INITIAL_ORDERS: OrderRecord[] = [
  {
    id: 'TG-83921',
    date: 'Вчера, 19:42',
    status: 'delivered',
    statusText: 'Доставлен',
    items: [
      { name: 'Трюфельная Римская с прошутто', quantity: 1, price: 890 },
      { name: 'Фисташковый Раф', quantity: 2, price: 360 },
    ],
    total: 1610,
    starsCashback: 160,
    deliveryAddress: 'ул. Тверская, 14, кв. 32',
  },
  {
    id: 'TG-72104',
    date: '12 октября, 14:15',
    status: 'delivered',
    statusText: 'Доставлен',
    items: [
      { name: 'Филадельфия Royal с лососем', quantity: 1, price: 790 },
      { name: 'Боул с тунцом и киноа', quantity: 1, price: 680 },
    ],
    total: 1470,
    starsCashback: 140,
    deliveryAddress: 'ул. Тверская, 14, кв. 32',
  },
];
