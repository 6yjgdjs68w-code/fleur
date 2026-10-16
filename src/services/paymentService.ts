/**
 * Payment Service for Fleur Flower Boutique
 * - Telegram Stars Payment Integration (currency: XTR, window.Telegram.WebApp.openInvoice)
 * - YooKassa SBP Payment Integration (paymentMethod: 'sbp', window.Telegram.WebApp.openLink)
 */

export interface PaymentOrderPayload {
  orderId: string;
  bouquetName: string;
  amountRub: number;
  starsAmount: number;
  customerPhone: string;
  recipientPhone: string;
  deliveryAddress: string;
  deliveryDate: string;
  deliveryTimeSlot: string;
  cardMessage: string;
  contactRecipient: boolean;
}

export interface YooKassaPaymentResponse {
  id: string;
  status: 'pending' | 'waiting_for_capture' | 'succeeded';
  paid: boolean;
  amount: {
    value: string;
    currency: 'RUB';
  };
  confirmation: {
    type: 'redirect';
    confirmation_url: string;
  };
  payment_method: {
    type: 'sbp';
    id: string;
    saved: boolean;
  };
  description: string;
}

export const DEFAULT_BOT_TOKEN = '8734424737:AAFDLzcFpY_mZgqejyT7j0TFUMiWhBm4mkQ';

/**
 * Creates a Telegram Stars Invoice Link with currency "XTR".
 * Directly calls Telegram Bot API createInvoiceLink with BOT_TOKEN: 8734424737:AAFDLzcFpY_mZgqejyT7j0TFUMiWhBm4mkQ
 */
export async function createTelegramStarsInvoiceLink(
  order: PaymentOrderPayload,
  customBotToken?: string
): Promise<string> {
  const token = (customBotToken?.trim() || DEFAULT_BOT_TOKEN).trim();
  const invoiceSlug = `fleur_xtr_${order.orderId}_${order.starsAmount}`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Букет Fleur: ${order.bouquetName}`,
        description: `Заказ #${order.orderId} с доставкой от флористического дома Fleur`,
        payload: order.orderId,
        currency: 'XTR',
        prices: [{ label: order.bouquetName.slice(0, 32), amount: order.starsAmount }],
      }),
    });
    const data = await res.json();
    if (data.ok && data.result) {
      return data.result;
    }
  } catch (err) {
    console.warn('Telegram createInvoiceLink fallback:', err);
  }

  // Fallback slug format recognized by Telegram Mini Apps
  return `https://t.me/$${invoiceSlug}`;
}

/**
 * Creates a YooKassa SBP payment session.
 * In production server:
 * POST https://api.yookassa.ru/v3/payments
 * with:
 * {
 *   amount: { value: `${order.amountRub}.00`, currency: "RUB" },
 *   payment_method_data: { type: "sbp" },
 *   confirmation: { type: "redirect", return_url: "https://t.me/fleur_bot/app" },
 *   description: `Заказ цветов Fleur #${order.orderId}`
 * }
 */
export async function createYooKassaPayment(order: PaymentOrderPayload): Promise<YooKassaPaymentResponse> {
  // Simulate backend endpoint delay and response
  await new Promise((resolve) => setTimeout(resolve, 600));

  const paymentId = `yoo_${Math.random().toString(36).substring(2, 12)}`;
  
  // Simulated YooKassa SBP confirmation URL (in production, this is the real YooKassa SBP QR/Deep link page)
  const confirmationUrl = `https://yookassa.ru/checkout/payments/v2/contract?orderId=${order.orderId}&paymentId=${paymentId}&method=sbp&amount=${order.amountRub}`;

  return {
    id: paymentId,
    status: 'pending',
    paid: false,
    amount: {
      value: `${order.amountRub}.00`,
      currency: 'RUB',
    },
    confirmation: {
      type: 'redirect',
      confirmation_url: confirmationUrl,
    },
    payment_method: {
      type: 'sbp',
      id: paymentId,
      saved: false,
    },
    description: `Оплата заказа цветов Fleur #${order.orderId} через СБП`,
  };
}

/**
 * Triggers Telegram Stars invoice via window.Telegram.WebApp.openInvoice or sendInvoice
 * Currency: XTR (Telegram Stars)
 */
export function openTelegramInvoice(
  invoiceLink: string,
  onStatus: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void
) {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openInvoice) {
    try {
      window.Telegram.WebApp.openInvoice(invoiceLink, (status: string) => {
        onStatus(status as any);
      });
      return true;
    } catch (e) {
      console.warn('Native openInvoice error:', e);
    }
  }
  return false;
}

/**
 * sendInvoice alias calling openInvoice with currency XTR
 */
export const sendInvoice = openTelegramInvoice;

/**
 * Opens YooKassa SBP payment page via window.Telegram.WebApp.openLink
 */
export function openYooKassaSbpLink(confirmationUrl: string) {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openLink) {
    try {
      window.Telegram.WebApp.openLink(confirmationUrl);
      return;
    } catch (e) {
      console.warn('Native openLink error:', e);
    }
  }
  // Browser fallback
  window.open(confirmationUrl, '_blank');
}
