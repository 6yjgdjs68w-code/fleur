/**
 * Telegram Stars Payment Integration (Currency: XTR)
 * 
 * In production with a bot backend:
 * Call Telegram Bot API method `createInvoiceLink`:
 * POST https://api.telegram.org/bot<BOT_TOKEN>/createInvoiceLink
 * Body: {
 *   title: "Букет Fleur: Розовая Нежность",
 *   description: "Доставка цветов курьером Fleur",
 *   payload: "order_12345",
 *   currency: "XTR",
 *   prices: [{ label: "Букет Fleur", amount: starsAmount }]
 * }
 * Returns: { ok: true, result: "https://t.me/$invoice_slug" }
 * 
 * Then in frontend:
 * window.Telegram.WebApp.openInvoice(result, (status) => {
 *   if (status === 'paid') { ... }
 * });
 */

export interface InvoiceDetails {
  orderId: string;
  title: string;
  description: string;
  currency: 'XTR';
  starsAmount: number;
  payload: string;
  recipientPhone: string;
  deliveryAddress: string;
}

export function generateTelegramStarsInvoiceLink(details: InvoiceDetails): string {
  // Pre-formatted placeholder link matching Telegram Bot API createInvoiceLink format ($slug)
  const slug = `fleur_xtr_${details.orderId}_${details.starsAmount}`;
  return `https://t.me/$${slug}`;
}

export function openTelegramStarsInvoice(
  invoiceLink: string,
  details: InvoiceDetails,
  onResult: (status: 'paid' | 'cancelled' | 'failed') => void
) {
  // 1. If running inside real Telegram client with WebApp.openInvoice
  if (typeof window !== 'undefined' && window.Telegram?.WebApp?.openInvoice) {
    try {
      window.Telegram.WebApp.openInvoice(invoiceLink, (status: string) => {
        if (status === 'paid') {
          onResult('paid');
        } else if (status === 'cancelled') {
          onResult('cancelled');
        } else {
          onResult('failed');
        }
      });
      return;
    } catch (err) {
      console.warn('Native openInvoice error, falling back to simulator:', err);
    }
  }

  // 2. In browser testing environment: dispatch a custom event for the in-app modal invoice
  const event = new CustomEvent('fleur:open-stars-invoice', {
    detail: { invoiceLink, details, onResult },
  });
  window.dispatchEvent(event);
}
