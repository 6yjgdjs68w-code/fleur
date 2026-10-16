export type LoyaltyTierKey = 'guest' | 'connoisseur' | 'curator' | 'patron' | 'founders_circle';

export interface LoyaltyTier {
  key: LoyaltyTierKey;
  name: string;
  badge: string;
  minOrders: number;
  nextThreshold?: number;
  color: string;
  gradient: string;
  description: string;
  perks: string[];
  hasFreeDelivery: boolean;
  hasPriorityAssembly: boolean;
  hasSecretBouquets: boolean;
}

export const LOYALTY_TIERS: Record<LoyaltyTierKey, LoyaltyTier> = {
  guest: {
    key: 'guest',
    name: 'Guest',
    badge: '⚜️',
    minOrders: 0,
    nextThreshold: 1,
    color: '#D1C7BD',
    gradient: 'from-stone-300 via-stone-200 to-stone-400',
    description: 'Начальный статус закрытого клуба Fleur. Доступ к каталогу и приветственные баллы.',
    perks: ['Приветственные 50 баллов', 'Бесплатная открытка Fleur'],
    hasFreeDelivery: false,
    hasPriorityAssembly: false,
    hasSecretBouquets: false,
  },
  connoisseur: {
    key: 'connoisseur',
    name: 'Connoisseur',
    badge: '💎',
    minOrders: 1,
    nextThreshold: 3,
    color: '#B9E5E8',
    gradient: 'from-sky-200 via-teal-100 to-sky-300',
    description: 'Ценитель прекрасного. Постоянный кешбэк 5% бонусами на все последующие букеты.',
    perks: ['Кешбэк 5% на баланс', 'Участие в сезонных закрытых акциях'],
    hasFreeDelivery: false,
    hasPriorityAssembly: false,
    hasSecretBouquets: false,
  },
  curator: {
    key: 'curator',
    name: 'Curator',
    badge: '👑',
    minOrders: 3,
    nextThreshold: 7,
    color: '#F4B6C2',
    gradient: 'from-rose-200 via-pink-100 to-amber-200',
    description: 'Куратор стиля Fleur. Бесплатная курьерская доставка на любые заказы без ограничений суммы.',
    perks: ['Бесплатная доставка 0 ₽ всегда', 'Кешбэк 10% бонусами', 'Кризал и аквабокс бесплатно'],
    hasFreeDelivery: true,
    hasPriorityAssembly: false,
    hasSecretBouquets: false,
  },
  patron: {
    key: 'patron',
    name: 'Patron',
    badge: '🏛️',
    minOrders: 7,
    nextThreshold: 15,
    color: '#FFD700',
    gradient: 'from-amber-300 via-yellow-100 to-amber-500',
    description: 'Патрон Дома Fleur. Приоритетная сборка букета шеф-флористом и каллиграфическая открытка.',
    perks: ['Приоритетная сборка шеф-флористом', 'Бесплатная доставка всегда', 'Каллиграфическая открытка от руки'],
    hasFreeDelivery: true,
    hasPriorityAssembly: true,
    hasSecretBouquets: false,
  },
  founders_circle: {
    key: 'founders_circle',
    name: "Founder's Circle",
    badge: '🌟',
    minOrders: 15,
    color: '#E5E4E2',
    gradient: 'from-slate-200 via-stone-100 to-amber-200',
    description: 'Высшая ложа основателей. Доступ к секретной закрытой коллекции редких селекционных цветов.',
    perks: [
      'Доступ к закрытой коллекции Founder’s Choice',
      'Приоритетная сборка и доставка в пиковые праздники',
      'Персональный шеф-флорист 24/7',
      'Бесплатная доставка любых букетов',
    ],
    hasFreeDelivery: true,
    hasPriorityAssembly: true,
    hasSecretBouquets: true,
  },
};

export function getLoyaltyTier(ordersCount: number): LoyaltyTier {
  if (ordersCount >= 15) return LOYALTY_TIERS.founders_circle;
  if (ordersCount >= 7) return LOYALTY_TIERS.patron;
  if (ordersCount >= 3) return LOYALTY_TIERS.curator;
  if (ordersCount >= 1) return LOYALTY_TIERS.connoisseur;
  return LOYALTY_TIERS.guest;
}
