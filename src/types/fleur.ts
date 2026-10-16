import { Bouquet, BouquetWrapper, StemCount } from '../data/fleurData';

export interface CartItem {
  id: string; // unique item key e.g. "fl-1_craft_7"
  bouquet: Bouquet;
  wrapper: BouquetWrapper;
  stemCount: StemCount;
  quantity: number;
  unitPrice: number;
  isBouquetOfDay?: boolean;
}

export type FleurTab = 'home' | 'catalog' | 'orders' | 'cart' | 'bonuses' | 'support';

export type UserRole = 'admin' | 'client';

export type OrderStatus = 'accepted' | 'assembling' | 'waiting_delivery' | 'delivered' | 'cancelled';

export interface StoreSettings {
  telegramSupportUrl: string;
  phone: string;
  address: string;
  workingHours: string;
  notifyOnNewOrder?: boolean;
  telegramBotToken?: string;
  telegramOwnerChatId?: string;
  // SBP (Система быстрых платежей) configuration
  sbpEnabled?: boolean;
  sbpPhone?: string;
  sbpBankName?: string;
  sbpRecipientName?: string;
  sbpQrCodeUrl?: string;
  // Bank card direct transfer configuration (перевод на карту самозанятой)
  cardEnabled?: boolean;
  cardNumber?: string;
  cardBankName?: string;
  cardRecipientName?: string;
  // Telegram Stars (XTR) configuration
  starsEnabled?: boolean;
  starsRubRate?: number; // RUB per 1 Star (default: 2.0)
}

export interface CheckoutFormState {
  customerName?: string;
  customerTelegram?: string; // Telegram @username
  telegramUserId?: number;
  customerPhone: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  cardMessage: string;
  contactRecipient: boolean;
  sendAsSurprise: boolean;
  hideSenderUntilDelivery: boolean;
  surpriseCardTemplate?: string;
}

export interface PlacedOrder {
  orderId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  finalTotal: number;
  starsAmount: number;
  paymentMethod: 'stars' | 'sbp' | 'card';
  paymentStatus: 'paid' | 'pending' | 'reviewing' | 'cancelled';
  orderStatus: OrderStatus;
  form: CheckoutFormState;
  createdAt: string;
  updatedAt?: string;
  receiptImage?: string; // Base64 data URL or photo URL of bank transfer receipt
  receiptUploadedAt?: string;
  paymentConfirmedAt?: string;
}
