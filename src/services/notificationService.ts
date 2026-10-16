import { PlacedOrder } from '../types/fleur';

/**
 * Official Telegram Bot Token for Fleur Boutique owner
 */
export const DEFAULT_BOT_TOKEN = '8734424737:AAFDLzcFpY_mZgqejyT7j0TFUMiWhBm4mkQ';

export interface TelegramNotificationConfig {
  botToken?: string;
  ownerChatId?: string;
  notifyEnabled?: boolean;
}

export async function fetchOwnerChatIdFromTelegram(
  botToken: string
): Promise<{ success: boolean; chatId?: string; userName?: string; message: string }> {
  const token = botToken.trim() || DEFAULT_BOT_TOKEN;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates?limit=20`);
    const data = await res.json();
    if (!data.ok) {
      return {
        success: false,
        message: `Ошибка Telegram API: ${data.description || 'Не удалось получить обновления'}`,
      };
    }
    const updates = data.result;
    if (!Array.isArray(updates) || updates.length === 0) {
      return {
        success: false,
        message: 'Сообщений в боте пока нет. Откройте вашего бота в Telegram, нажмите «Start» или отправьте любое сообщение, затем нажмите эту кнопку снова!',
      };
    }
    for (let i = updates.length - 1; i >= 0; i--) {
      const update = updates[i];
      const chat = update.message?.chat || update.channel_post?.chat || update.my_chat_member?.chat;
      if (chat && chat.id) {
        const name = chat.first_name || chat.title || chat.username || 'Пользователь';
        return {
          success: true,
          chatId: String(chat.id),
          userName: name,
          message: `Успешно определен Chat ID: ${chat.id} (${name})!`,
        };
      }
    }
    return {
      success: false,
      message: 'Не удалось определить Chat ID. Напишите боту любое сообщение в Telegram и повторите попытку.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Ошибка запроса: ${err?.message || 'Проверьте соединение с интернетом'}`,
    };
  }
}

/**
 * Sends real-time Telegram notification to the boutique owner when a customer completes an order
 */
export async function sendOwnerTelegramOrderNotification(
  order: PlacedOrder,
  config: TelegramNotificationConfig
): Promise<{ success: boolean; message: string }> {
  const botToken = config.botToken?.trim() || DEFAULT_BOT_TOKEN;
  let ownerChatId = config.ownerChatId?.trim();

  // If owner chat ID wasn't manually configured, try to auto-discover it from the bot's latest chat updates
  if (!ownerChatId) {
    const discovered = await fetchOwnerChatIdFromTelegram(botToken);
    if (discovered.success && discovered.chatId) {
      ownerChatId = discovered.chatId;
    }
  }

  if (!ownerChatId) {
    return {
      success: false,
      message: 'Chat ID владельца не настроен. Напишите боту /start в Telegram или укажите ID в админ-панели.',
    };
  }

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. <b>${item.bouquet.name}</b> (${item.stemCount} стеблей, упаковка: ${item.wrapper.name})\n   ` +
        `• Кол-во: ${item.quantity} шт. • Цена: ${item.unitPrice.toLocaleString('ru-RU')} ₽`
    )
    .join('\n');

  const customerTg = order.form.customerTelegram?.replace(/^@/, '') || '';
  const customerTgLink = customerTg
    ? `<a href="https://t.me/${customerTg}">@${customerTg}</a>`
    : '<i>Не указан</i>';

  const surpriseText = order.form.sendAsSurprise
    ? '🎁 <b>ДА (Анонимная доставка / Сюрприз)</b>'
    : 'Обычная доставка';

  const messageText = `
🌸 <b>НОВЫЙ ЗАКАЗ В БУТИКЕ FLEUR!</b> 🌸
━━━━━━━━━━━━━━━━━━━━
<b>Номер заказа:</b> <code>#${order.orderId}</code>
<b>Сумма к оплате:</b> <b>${order.finalTotal.toLocaleString('ru-RU')} ₽</b>
<b>Способ оплаты:</b> ${
    order.paymentMethod === 'stars'
      ? '⭐ Telegram Stars'
      : order.paymentMethod === 'sbp'
      ? '⚡ СБП (Система быстрых платежей)'
      : '💳 Перевод на банковскую карту самозанятой'
  }
<b>Статус оплаты:</b> ${
    order.paymentStatus === 'paid'
      ? '✅ ОПЛАЧЕНО'
      : order.paymentStatus === 'reviewing'
      ? '⏳ <b>ЧЕК ОТПРАВЛЕН НА ПРОВЕРКУ</b> (Сверьте поступление денег на карту/СБП!)'
      : '⏳ Ожидает оплаты'
  }
<b>Чек от клиента:</b> ${order.receiptImage ? '📎 <b>ПРИКРЕПЛЁН</b> (см. фото ниже)' : '⚠️ Чек не прикреплен'}
<b>Время заказа:</b> ${order.createdAt}

🛍 <b>Состав заказа:</b>
${itemsList}

👤 <b>Данные клиента и связь:</b>
• <b>Telegram заказчика:</b> ${customerTgLink}
• <b>Имя заказчика:</b> ${order.form.customerName || 'Клиент'}
• <b>Телефон заказчика:</b> <code>${order.form.customerPhone}</code>
• <b>Телефон получателя:</b> <code>${order.form.recipientPhone}</code>
• <b>Адрес доставки:</b> ${order.form.contactRecipient ? '<i>Уточнить у получателя по звонку</i>' : order.form.deliveryAddress}
• <b>Дата и слот:</b> ${order.form.deliveryDate}, ${order.form.deliveryTimeSlot}
• <b>Тип доставки:</b> ${surpriseText}
${
  order.form.cardMessage
    ? `\n💌 <b>Текст открытки:</b>\n<i>«${order.form.cardMessage}»</i>`
    : ''
}
━━━━━━━━━━━━━━━━━━━━
${customerTg ? `👉 <a href="https://t.me/${customerTg}">Написать клиенту в Telegram</a>` : ''}
`.trim();

  try {
    const cleanToken = botToken.trim();
    const cleanChatId = ownerChatId.trim();

    // 1. Send text details
    const response = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();

    // 2. If client uploaded a receipt photo, send it directly via sendPhoto
    if (order.receiptImage) {
      try {
        if (order.receiptImage.startsWith('data:')) {
          const res = await fetch(order.receiptImage);
          const blob = await res.blob();
          const formData = new FormData();
          formData.append('chat_id', cleanChatId);
          formData.append('photo', blob, `receipt_${order.orderId}.jpg`);
          formData.append(
            'caption',
            `🧾 <b>Чек об оплате к заказу #${order.orderId}</b>\n` +
            `💰 Сумма: <b>${order.finalTotal.toLocaleString('ru-RU')} ₽</b>\n` +
            `👤 Клиент: ${order.form.customerName || 'Клиент'} (${order.form.customerPhone})`
          );
          formData.append('parse_mode', 'HTML');

          await fetch(`https://api.telegram.org/bot${cleanToken}/sendPhoto`, {
            method: 'POST',
            body: formData,
          });
        } else if (order.receiptImage.startsWith('http')) {
          await fetch(`https://api.telegram.org/bot${cleanToken}/sendPhoto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: cleanChatId,
              photo: order.receiptImage,
              caption: `🧾 Чек к заказу #${order.orderId} (${order.finalTotal.toLocaleString('ru-RU')} ₽)`,
            }),
          });
        }
      } catch (receiptErr) {
        console.warn('Could not forward receipt photo via Telegram Bot API:', receiptErr);
      }
    }

    if (data.ok) {
      return { success: true, message: 'Уведомление и чек успешно доставлены в Telegram бот владельца!' };
    } else {
      return {
        success: false,
        message: `Ошибка Telegram API: ${data.description || 'Не удалось отправить сообщение'}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Сетевая ошибка отправки в Telegram: ${err?.message || 'Проверьте соединение'}`,
    };
  }
}

/**
 * Sends a test ping message from the Admin Panel to verify Bot Token and Chat ID
 */
export async function sendTestTelegramNotification(
  botToken: string,
  ownerChatId: string
): Promise<{ success: boolean; message: string }> {
  if (!botToken?.trim() || !ownerChatId?.trim()) {
    return {
      success: false,
      message: 'Пожалуйста, заполните и Bot Token, и Chat ID владельца.',
    };
  }

  const testText = `
🌸 <b>Бутик Fleur: Тестовое уведомление настроено!</b> 🌸
━━━━━━━━━━━━━━━━━━━━
Поздравляем! Ваш Telegram-бот успешно подключен к магазину Fleur.
Теперь при каждом новом заказе от клиентов сюда будут моментально приходить:
• Имя и @username клиента для быстрой связи
• Телефон заказчика и получателя
• Адрес и время доставки
• Состав букетов, стебли и открытка
• Статус оплаты
━━━━━━━━━━━━━━━━━━━━
<i>Система уведомлений активна и готова к работе.</i>
`.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: ownerChatId.trim(),
        text: testText,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, message: 'Тестовое сообщение успешно получено в вашем Telegram!' };
    } else {
      return {
        success: false,
        message: `Ошибка Telegram: ${data.description || 'Неверный токен или chat_id'}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Сетевая ошибка: ${err?.message || 'Не удалось отправить'}`,
    };
  }
}
