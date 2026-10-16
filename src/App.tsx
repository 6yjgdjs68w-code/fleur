/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bouquet, BouquetWrapper, StemCount, WRAPPER_OPTIONS, BOUQUETS, BOUQUET_OF_THE_DAY, BouquetOfDayData } from './data/fleurData';
import { CartItem, FleurTab, PlacedOrder, UserRole } from './types/fleur';
import { LoyaltyTier, getLoyaltyTier } from './types/loyalty';
import { HomeScreen } from './components/fleur/HomeScreen';
import { CatalogScreen } from './components/fleur/CatalogScreen';
import { BouquetDetailsModal } from './components/fleur/BouquetDetailsModal';
import { CartScreen } from './components/fleur/CartScreen';
import { CheckoutModal } from './components/fleur/CheckoutModal';
import { BonusesScreen } from './components/fleur/BonusesScreen';
import { SupportScreen } from './components/fleur/SupportScreen';
import { OrdersScreen } from './components/fleur/OrdersScreen';
import { OrderSuccessModal } from './components/fleur/OrderSuccessModal';
import { WheelOfFortuneModal, FortunePrize } from './components/fleur/WheelOfFortuneModal';
import { ProfileStatusModal } from './components/fleur/ProfileStatusModal';
import { UserAccountModal } from './components/fleur/UserAccountModal';
import { AdminPanelModal, StoreSettings, PromoCodeItem } from './components/fleur/AdminPanelModal';
import { AdminPasscodeModal } from './components/fleur/AdminPasscodeModal';
import { sendOwnerTelegramOrderNotification, DEFAULT_BOT_TOKEN } from './services/notificationService';
import { getTelegramUser, getUserStorageKey } from './services/telegramUser';
import { telegramCloudStorage } from './services/telegramCloudStorage';
import { 
  Sparkles, ShoppingBag, Gift, MessageCircle, Home, 
  Grid, Crown, PackageCheck, ShieldCheck, Shield, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<FleurTab>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedBouquet, setSelectedBouquet] = useState<Bouquet | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<PlacedOrder | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Boutique Customization & Admin State (stored in localStorage)
  const [bouquets, setBouquets] = useState<Bouquet[]>(() => {
    try {
      const saved = localStorage.getItem('fleur_bouquets_v1');
      return saved ? JSON.parse(saved) : BOUQUETS;
    } catch {
      return BOUQUETS;
    }
  });

  const [bouquetOfDay, setBouquetOfDay] = useState<BouquetOfDayData>(() => {
    try {
      const saved = localStorage.getItem('fleur_bouquet_of_day_v1');
      return saved ? JSON.parse(saved) : BOUQUET_OF_THE_DAY;
    } catch {
      return BOUQUET_OF_THE_DAY;
    }
  });

  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>(() => {
    try {
      const saved = localStorage.getItem('fleur_promo_codes_v1');
      return saved ? JSON.parse(saved) : [
        { code: 'FIRST', discountPercent: 10, description: 'Скидка 10% на первый заказ' },
        { code: 'FLEUR15', discountPercent: 15, description: 'Скидка 15% для постоянных гостей' },
      ];
    } catch {
      return [
        { code: 'FIRST', discountPercent: 10, description: 'Скидка 10% на первый заказ' },
        { code: 'FLEUR15', discountPercent: 15, description: 'Скидка 15% для постоянных гостей' },
      ];
    }
  });

  const defaultStoreSettings: StoreSettings = {
    telegramSupportUrl: 'https://t.me/linaloveinal',
    phone: '+7 (495) 890-21-44',
    address: 'г. Москва, ул. Большая Никитская, 22',
    workingHours: '08:00 — 23:00 ежедневно',
    telegramBotToken: DEFAULT_BOT_TOKEN,
    telegramOwnerChatId: '',
    notifyOnNewOrder: true,
    sbpEnabled: true,
    sbpPhone: '+7 (999) 123-45-67',
    sbpBankName: 'Т-Банк (Тинькофф)',
    sbpRecipientName: 'Анна Сергеевна В. (Бутик Fleur)',
    cardEnabled: true,
    cardNumber: '2202 2012 3456 7890',
    cardBankName: 'Т-Банк (Тинькофф)',
    cardRecipientName: 'Анна Сергеевна В. (Самозанятая)',
    starsEnabled: true,
    starsRubRate: 2.0,
  };

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('fleur_store_settings_v1');
      return saved ? { ...defaultStoreSettings, ...JSON.parse(saved) } : defaultStoreSettings;
    } catch {
      return defaultStoreSettings;
    }
  });

  const [ordersHistory, setOrdersHistory] = useState<PlacedOrder[]>(() => {
    try {
      const saved = localStorage.getItem('fleur_orders_history_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User Role ('admin' | 'client'), persisted in Telegram CloudStorage
  const [userRole, setUserRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('fleur_user_role');
      return saved === 'admin' || saved === 'client' ? saved : 'client';
    } catch {
      return 'client';
    }
  });

  // Load & synchronize role from Telegram CloudStorage upon startup
  useEffect(() => {
    let isMounted = true;
    telegramCloudStorage.getUserRole().then((cloudRole) => {
      if (isMounted && (cloudRole === 'admin' || cloudRole === 'client')) {
        setUserRole(cloudRole);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateUserRole = async (newRole: UserRole) => {
    setUserRole(newRole);
    await telegramCloudStorage.setUserRole(newRole);
    if (newRole === 'client') {
      setIsAdminOpen(false);
    }
  };

  // Owner Admin Access & Security
  // Default is CLOSED: ordinary customers see only the client shop
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);
  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('fleur_admin_pin_v1') || '1234';
  });
  const [logoClicks, setLogoClicks] = useState<number>(0);

  // Wheel of Fortune State: strictly 1 spin per day
  const getTodayStr = () => new Date().toISOString().slice(0, 10);
  const [isFortuneOpen, setIsFortuneOpen] = useState(false);
  const [hasSpunFortuneToday, setHasSpunFortuneToday] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fleur_last_fortune_spin_date') === new Date().toISOString().slice(0, 10);
    } catch {
      return false;
    }
  });
  const [fortuneDiscountPercent, setFortuneDiscountPercent] = useState<number>(0);

  // User Telegram Stars Account Balance (starts at 0 ⭐, isolated per Telegram user account)
  const [userStarsBalance, setUserStarsBalance] = useState<number>(() => {
    try {
      const key = getUserStorageKey('fleur_user_stars_v2');
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        return isNaN(parsed) || parsed < 0 ? 0 : parsed;
      }
      return 0; // Real account starts with 0 ⭐ (not 3500!)
    } catch {
      return 0;
    }
  });

  const handleUpdateStarsBalance = (newStars: number) => {
    const valid = Math.max(0, newStars);
    setUserStarsBalance(valid);
    try {
      const key = getUserStorageKey('fleur_user_stars_v2');
      localStorage.setItem(key, String(valid));
    } catch {
      // ignore
    }
  };

  // Loyalty Tier & Orders State
  // Real orders count: starts at 0 for new clients (Guest level)
  const [ordersCount, setOrdersCount] = useState<number>(() => {
    try {
      const savedCount = localStorage.getItem('fleur_client_orders_count_v1');
      if (savedCount !== null) return parseInt(savedCount, 10) || 0;
      const history = localStorage.getItem('fleur_orders_history_v1');
      if (history) {
        const parsed = JSON.parse(history);
        return Array.isArray(parsed) ? parsed.length : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Discounts & points (points persisted in localStorage)
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(0);
  const [appliedPoints, setAppliedPoints] = useState<number>(0);
  const [userBonusPoints, setUserBonusPoints] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('fleur_user_bonus_points_v1');
      return saved !== null ? parseInt(saved, 10) : 100;
    } catch {
      return 100;
    }
  });

  const userTier = getLoyaltyTier(ordersCount);

  // Listen for special owner link (?admin=true, ?admin=1 or #admin)
  useEffect(() => {
    const checkSpecialAdminUrl = () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash;
        if (
          searchParams.get('admin') === 'true' ||
          searchParams.get('admin') === '1' ||
          hash === '#admin'
        ) {
          setIsAdminPinModalOpen(true);
        }
      } catch {
        // ignore
      }
    };

    checkSpecialAdminUrl();
    window.addEventListener('hashchange', checkSpecialAdminUrl);
    return () => window.removeEventListener('hashchange', checkSpecialAdminUrl);
  }, []);

  const handleUpdateBouquets = (newBouquets: Bouquet[]) => {
    setBouquets(newBouquets);
    localStorage.setItem('fleur_bouquets_v1', JSON.stringify(newBouquets));
  };

  const handleUpdateBouquetOfDay = (newDay: BouquetOfDayData) => {
    setBouquetOfDay(newDay);
    localStorage.setItem('fleur_bouquet_of_day_v1', JSON.stringify(newDay));
  };

  const handleUpdatePromoCodes = (newCodes: PromoCodeItem[]) => {
    setPromoCodes(newCodes);
    localStorage.setItem('fleur_promo_codes_v1', JSON.stringify(newCodes));
  };

  const handleUpdateStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    localStorage.setItem('fleur_store_settings_v1', JSON.stringify(newSettings));
  };

  const handleUpdateAdminPin = (newPin: string) => {
    setAdminPin(newPin);
    localStorage.setItem('fleur_admin_pin_v1', newPin);
  };

  // Open Fortune wheel once upon launch after a short pleasant delay
  useEffect(() => {
    const hasSeenFortune = sessionStorage.getItem('fleur_fortune_shown');
    if (!hasSeenFortune) {
      const timer = setTimeout(() => {
        setIsFortuneOpen(true);
        sessionStorage.setItem('fleur_fortune_shown', 'true');
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Cart Totals Calculation
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  const rawSubtotal = cartItems.reduce((acc, item) => {
    return acc + item.unitPrice * item.quantity;
  }, 0);

  // Highest discount between promo code and wheel of fortune prize
  const effectiveDiscountPercent = Math.max(promoDiscountPercent, fortuneDiscountPercent);
  const discountAmount = Math.round(rawSubtotal * (effectiveDiscountPercent / 100));

  // If user is Curator or higher (3+ orders), delivery is free (regular: 450 rub)
  const isFreeDeliveryUnlocked = ordersCount >= 3;
  const deliveryFee = isFreeDeliveryUnlocked ? 0 : 450;

  const finalTotal = Math.max(0, rawSubtotal - discountAmount - appliedPoints + (cartItems.length > 0 ? deliveryFee : 0));

  const handleAddToCart = (
    bouquet: Bouquet,
    wrapper: BouquetWrapper,
    stemCount: StemCount,
    quantity = 1,
    customUnitPrice?: number
  ) => {
    const itemKey = `${bouquet.id}_${wrapper?.id || 'craft'}_${stemCount}`;
    const actualQuantity = quantity > 0 ? quantity : 1;
    const actualUnitPrice =
      customUnitPrice ??
      ((bouquet.stemPrices?.[stemCount] ?? Math.round(bouquet.basePrice * (stemCount === 5 ? 1 : stemCount === 7 ? 1.35 : 1.9))) +
        (wrapper?.priceDelta || 0));

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.id === itemKey ? { ...i, quantity: i.quantity + actualQuantity } : i
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          bouquet,
          wrapper,
          stemCount,
          quantity: actualQuantity,
          unitPrice: actualUnitPrice,
        },
      ];
    });
    setSelectedBouquet(null);
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleOpenCheckout = (promoPercent: number, pointsToUse: number) => {
    setPromoDiscountPercent(promoPercent);
    setAppliedPoints(pointsToUse);
    setIsCheckoutOpen(true);
  };

  const handleOrderCompleted = (order: PlacedOrder) => {
    setCompletedOrder(order);
    setCartItems([]);
    setIsCheckoutOpen(false);

    // If order was paid via Telegram Stars, deduct from user's Stars balance
    if (order.paymentMethod === 'stars') {
      setUserStarsBalance((prev) => {
        const next = Math.max(0, prev - order.starsAmount);
        localStorage.setItem('fleur_user_stars_balance_v1', String(next));
        return next;
      });
    }

    setOrdersCount((prev) => {
      const next = prev + 1;
      localStorage.setItem('fleur_client_orders_count_v1', String(next));
      return next;
    });

    setUserBonusPoints((prev) => {
      const next = Math.max(0, prev - appliedPoints) + Math.round(order.finalTotal * 0.05);
      localStorage.setItem('fleur_user_bonus_points_v1', String(next));
      return next;
    });

    setOrdersHistory((prev) => {
      const updated = [order, ...prev];
      localStorage.setItem('fleur_orders_history_v1', JSON.stringify(updated));
      return updated;
    });

    // Real-time Telegram notification to boutique owner
    sendOwnerTelegramOrderNotification(order, {
      botToken: storeSettings.telegramBotToken || DEFAULT_BOT_TOKEN,
      ownerChatId: storeSettings.telegramOwnerChatId,
      notifyEnabled: storeSettings.notifyOnNewOrder !== false,
    }).catch((err) => {
      console.warn('Telegram notification failed:', err);
    });
  };

  const handleDeductStars = (amount: number) => {
    setUserStarsBalance((prev) => {
      const next = Math.max(0, prev - amount);
      try {
        const key = getUserStorageKey('fleur_user_stars_v2');
        localStorage.setItem(key, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Wheel of Fortune: strictly 1 time per day
  const handleFortunePrizeWon = (prize: FortunePrize) => {
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('fleur_last_fortune_spin_date', today);
    setHasSpunFortuneToday(true);
    if (prize.type === 'discount') {
      setFortuneDiscountPercent(prize.value);
    } else if (prize.type === 'points') {
      setUserBonusPoints((pts) => {
        const next = pts + prize.value;
        localStorage.setItem('fleur_user_bonus_points_v1', String(next));
        return next;
      });
    }
  };

  const handleOrderBouquetOfDay = (bouquet: Bouquet, price: number) => {
    const wrapper = WRAPPER_OPTIONS[0];
    const itemKey = `${bouquet.id}_${wrapper.id}_5`;
    setCartItems([
      {
        id: itemKey,
        bouquet,
        wrapper,
        stemCount: 5,
        quantity: 1,
        unitPrice: price,
        isBouquetOfDay: true,
      },
    ]);
    setIsCheckoutOpen(true);
  };

  // Secret owner tap on "Fleur" logo: if admin, opens directly; otherwise triple-tap prompts for PIN
  const handleLogoTap = () => {
    setActiveTab('home');
    if (userRole === 'admin') {
      setIsAdminOpen(true);
      return;
    }
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setIsAdminPinModalOpen(true);
        return 0;
      }
      return next;
    });
    setTimeout(() => setLogoClicks(0), 1800);
  };

  // Count active non-delivered orders for notification badge
  const activeOrdersCount = ordersHistory.filter(
    (o) => (o.orderStatus || 'waiting_delivery') !== 'delivered' && (o.orderStatus || 'waiting_delivery') !== 'cancelled'
  ).length;

  const navTabs: { id: FleurTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Главная', icon: <Home className="w-4 h-4" /> },
    { id: 'catalog', label: 'Каталог', icon: <Grid className="w-4 h-4" /> },
    { id: 'orders', label: 'Заказы', icon: <PackageCheck className="w-4 h-4" />, badge: activeOrdersCount },
    { id: 'cart', label: 'Корзина', icon: <ShoppingBag className="w-4 h-4" />, badge: totalCartCount },
    { id: 'bonuses', label: 'Бонусы', icon: <Gift className="w-4 h-4" /> },
    { id: 'support', label: 'Поддержка', icon: <MessageCircle className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#3E2C23] text-[#FAF6F0] flex flex-col items-center">
      {/* Container simulating or rendering native mobile viewport */}
      <div className="w-full max-w-md min-h-screen flex flex-col bg-[#3E2C23] shadow-2xl relative pb-24">
        
        {/* Persistent Admin Status Bar (Synced with Telegram CloudStorage) */}
        {userRole === 'admin' && (
          <div className="bg-gradient-to-r from-[#241710] via-[#382318] to-[#241710] border-b border-amber-500/40 px-3 py-1.5 flex items-center justify-between text-xs text-amber-200 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Роль: <strong className="text-amber-300">Администратор</strong></span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-mono hidden xs:inline">
                CloudStorage ☁️
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsAdminOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-2.5 py-0.5 rounded-lg text-[11px] cursor-pointer active:scale-95 transition-all shadow-xs"
              >
                Панель
              </button>
              <button
                onClick={() => handleUpdateUserRole('client')}
                className="text-stone-400 hover:text-stone-200 text-[10px] underline ml-1 cursor-pointer transition-colors"
                title="Переключиться в режим клиента (сохранится в CloudStorage)"
              >
                В режим клиента
              </button>
            </div>
          </div>
        )}

        {/* Top Header "Fleur" - 100% Client Store Mode */}
        <header className="sticky top-0 z-30 bg-[#3E2C23]/95 backdrop-blur-md border-b border-[#523B2F] px-4 py-3 flex items-center justify-between">
          <div 
            onClick={handleLogoTap}
            className="flex items-center gap-2 cursor-pointer select-none active:opacity-80 transition-opacity"
            title="Fleur"
          >
            <div className="w-8 h-8 rounded-full bg-[#F4B6C2] text-[#3E2C23] flex items-center justify-center font-serif-fleur font-bold text-base shadow">
              F
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif-fleur text-2xl font-bold tracking-wider text-[#FAF6F0] leading-none">
                  Fleur
                </h1>
                {/* VIP Status Badge right next to name */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsStatusModalOpen(true);
                  }}
                  className="inline-flex items-center gap-0.5 bg-[#FFD700]/15 hover:bg-[#FFD700]/25 text-[#FFD700] border border-[#FFD700]/30 px-1.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer"
                  title="Клубный статус"
                >
                  <span>{userTier.badge}</span>
                  <span className="hidden sm:inline">{userTier.name}</span>
                </button>
              </div>
              <p className="text-[9px] uppercase tracking-widest text-[#F4B6C2] mt-0.5 font-semibold">
                Boutique de Fleurs
              </p>
            </div>
          </div>

          {/* Header Right Actions: Stars Balance, Fortune Wheel, Bonuses, Cart */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* If Admin Role, prominent Admin Panel button */}
            {userRole === 'admin' && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="flex items-center gap-1 bg-gradient-to-r from-amber-500/25 to-rose-500/25 hover:from-amber-500/35 hover:to-rose-500/35 text-amber-300 border border-amber-500/40 px-2 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer active:scale-95 shadow-xs shrink-0"
                title="Панель администратора"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Админ</span>
              </button>
            )}
            {/* User Account Telegram Stars Balance Badge */}
            <button
              onClick={() => setIsAccountModalOpen(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-[#FFD700] border border-[#FFD700]/40 px-2 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Ваш Telegram-аккаунт и баланс Stars"
            >
              <span>⭐</span>
              <span className="font-mono">{userStarsBalance.toLocaleString('ru-RU')}</span>
            </button>

            {/* Fortune Wheel Button */}
            <button
              onClick={() => setIsFortuneOpen(true)}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FFD700]/30 to-[#F4B6C2]/30 border border-[#FFD700]/50 text-[#FFD700] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow shrink-0"
              title="Колесо Фортуны"
            >
              <span className="text-sm">🎡</span>
            </button>

            {/* Bonus Points Badge */}
            <button
              onClick={() => setActiveTab('bonuses')}
              className="flex items-center gap-1 bg-[#4A352B] hover:bg-[#5A4236] text-[#F4B6C2] px-2 py-1.5 rounded-full text-[11px] font-bold border border-[#5A4236] transition-all cursor-pointer active:scale-95 shrink-0"
            >
              <Sparkles className="w-3 h-3 text-[#FFD700]" />
              <span>{userBonusPoints}б</span>
            </button>

            {/* Cart Icon with badge */}
            <button
              onClick={() => setActiveTab('cart')}
              className="relative w-8 h-8 rounded-full bg-[#F4B6C2] text-[#3E2C23] flex items-center justify-center hover:bg-[#e8a3b0] transition-colors cursor-pointer active:scale-95 shadow shrink-0"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center border-2 border-[#3E2C23]">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Fortune Win Active Banner (if user won discount) */}
        {fortuneDiscountPercent > 0 && (
          <div className="bg-gradient-to-r from-[#FFD700] to-[#F4B6C2] text-[#3E2C23] text-xs font-bold px-4 py-2 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-1.5">
              <span>🎡</span>
              <span>Ваш приз: <strong>скидка {fortuneDiscountPercent}%</strong> на весь заказ!</span>
            </div>
            <button
              onClick={() => setActiveTab('catalog')}
              className="underline text-[11px] font-extrabold cursor-pointer"
            >
              В каталог
            </button>
          </div>
        )}

        {/* Main Body with Tab Screens */}
        <main className="flex-1 p-4">
          {activeTab === 'home' && (
            <HomeScreen
              onSelectBouquet={(b) => setSelectedBouquet(b)}
              onOpenCatalog={() => setActiveTab('catalog')}
              onOpenBonuses={() => setActiveTab('bonuses')}
              onOpenFortune={() => setIsFortuneOpen(true)}
              onOpenStatus={() => setIsStatusModalOpen(true)}
              userTier={userTier}
              onOrderBouquetOfDay={handleOrderBouquetOfDay}
              bouquets={bouquets}
              bouquetOfDayData={bouquetOfDay}
            />
          )}

          {activeTab === 'catalog' && (
            <CatalogScreen
              onSelectBouquet={(b) => setSelectedBouquet(b)}
              userTier={userTier}
              onOpenStatusModal={() => setIsStatusModalOpen(true)}
              bouquets={bouquets}
            />
          )}

          {activeTab === 'cart' && (
            <CartScreen
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onOpenCheckout={handleOpenCheckout}
              onOpenCatalog={() => setActiveTab('catalog')}
              userBonusPoints={userBonusPoints}
              promoCodes={promoCodes}
              ordersCount={ordersCount}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersScreen
              orders={ordersHistory}
              onOpenCatalog={() => setActiveTab('catalog')}
              storeSettings={storeSettings}
            />
          )}

          {activeTab === 'bonuses' && (
            <BonusesScreen
              userBonusPoints={userBonusPoints}
              onAddBonusPoints={(pts) => {
                setUserBonusPoints((b) => {
                  const next = b + pts;
                  localStorage.setItem('fleur_user_bonus_points_v1', String(next));
                  return next;
                });
              }}
              onOpenCatalog={() => setActiveTab('catalog')}
              ordersCount={ordersCount}
            />
          )}

          {activeTab === 'support' && (
            <SupportScreen
              storeSettings={storeSettings}
              userRole={userRole}
              onOpenAdmin={() => {
                if (userRole === 'admin') {
                  setIsAdminOpen(true);
                } else {
                  setIsAdminPinModalOpen(true);
                }
              }}
            />
          )}
        </main>

        {/* Floating Cart Bar (if in catalog/home and cart has items) */}
        <AnimatePresence>
          {totalCartCount > 0 && activeTab !== 'cart' && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-18 left-0 right-0 z-30 px-4 max-w-md mx-auto pointer-events-none"
            >
              <button
                onClick={() => setActiveTab('cart')}
                className="pointer-events-auto w-full bg-[#F4B6C2] hover:bg-[#e8a3b0] text-[#3E2C23] font-bold py-3.5 px-5 rounded-2xl text-xs sm:text-sm shadow-2xl shadow-black/40 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#3E2C23] text-white flex items-center justify-center text-[10px] font-bold">
                    {totalCartCount}
                  </div>
                  <span>Оформить букет</span>
                </div>
                <span className="font-serif-fleur font-extrabold text-sm sm:text-base whitespace-nowrap shrink-0">
                  {rawSubtotal.toLocaleString('ru-RU')}&nbsp;₽
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-[#36251E]/95 backdrop-blur-md border-t border-[#523B2F] px-1 py-2 max-w-md mx-auto">
          <div className="flex items-center justify-around">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'text-[#F4B6C2] font-bold scale-105'
                      : 'text-stone-400 hover:text-stone-200 opacity-70'
                  }`}
                >
                  <div className="relative mb-0.5">
                    {tab.icon}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-rose-600 text-white text-[8px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Screen: Bouquet Details Modal */}
        {selectedBouquet && (
          <BouquetDetailsModal
            bouquet={selectedBouquet}
            onClose={() => setSelectedBouquet(null)}
            onAddToCart={handleAddToCart}
          />
        )}

        {/* Screen: Checkout Modal */}
        {isCheckoutOpen && (
          <CheckoutModal
            items={cartItems}
            rawSubtotal={rawSubtotal}
            discountAmount={discountAmount + appliedPoints}
            finalTotal={finalTotal}
            onClose={() => setIsCheckoutOpen(false)}
            onOrderCompleted={handleOrderCompleted}
            storeSettings={storeSettings}
            userStarsBalance={userStarsBalance}
            onDeductStars={handleDeductStars}
          />
        )}

        {/* Screen: Order Confirmation Celebratory Modal */}
        {completedOrder && (
          <OrderSuccessModal
            order={completedOrder}
            onClose={() => {
              setCompletedOrder(null);
              setActiveTab('orders'); // Jump directly to Active Orders tab!
            }}
          />
        )}

        {/* Screen: Wheel of Fortune Modal */}
        {isFortuneOpen && (
          <WheelOfFortuneModal
            onClose={() => setIsFortuneOpen(false)}
            onPrizeWon={handleFortunePrizeWon}
            hasSpunToday={hasSpunFortuneToday}
          />
        )}

        {/* Screen: Profile VIP Club & Statuses Modal */}
        {isStatusModalOpen && (
          <ProfileStatusModal
            ordersCount={ordersCount}
            onClose={() => setIsStatusModalOpen(false)}
          />
        )}

        {/* Screen: Secret Admin PIN Passcode Modal */}
        {isAdminPinModalOpen && (
          <AdminPasscodeModal
            correctPin={adminPin}
            onSuccess={() => {
              setIsAdminPinModalOpen(false);
              handleUpdateUserRole('admin');
              setIsAdminOpen(true);
            }}
            onClose={() => setIsAdminPinModalOpen(false)}
          />
        )}

        {/* Screen: Boutique Admin Panel Modal (Owner Only) */}
        {isAdminOpen && (
          <AdminPanelModal
            bouquets={bouquets}
            onUpdateBouquets={handleUpdateBouquets}
            bouquetOfDay={bouquetOfDay}
            onUpdateBouquetOfDay={handleUpdateBouquetOfDay}
            promoCodes={promoCodes}
            onUpdatePromoCodes={handleUpdatePromoCodes}
            storeSettings={storeSettings}
            onUpdateStoreSettings={handleUpdateStoreSettings}
            orders={ordersHistory}
            onUpdateOrders={(updated) => {
              setOrdersHistory(updated);
              localStorage.setItem('fleur_orders_history_v1', JSON.stringify(updated));
            }}
            onClose={() => setIsAdminOpen(false)}
            adminPin={adminPin}
            onUpdateAdminPin={handleUpdateAdminPin}
            onSwitchToClientRole={() => handleUpdateUserRole('client')}
          />
        )}

        {/* Screen: User Account & Telegram Stars Balance Modal (with CloudStorage Role Switcher) */}
        {isAccountModalOpen && (
          <UserAccountModal
            userStarsBalance={userStarsBalance}
            userBonusPoints={userBonusPoints}
            ordersCount={ordersCount}
            userTier={userTier}
            onUpdateStarsBalance={handleUpdateStarsBalance}
            onClose={() => setIsAccountModalOpen(false)}
            onOpenOrders={() => {
              setIsAccountModalOpen(false);
              setActiveTab('orders');
            }}
            onOpenBonuses={() => {
              setIsAccountModalOpen(false);
              setActiveTab('bonuses');
            }}
            userRole={userRole}
            onSwitchRole={handleUpdateUserRole}
            onRequestAdminLogin={() => setIsAdminPinModalOpen(true)}
            onOpenAdminPanel={() => setIsAdminOpen(true)}
          />
        )}
      </div>
    </div>
  );
}
