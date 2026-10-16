/**
 * Telegram WebApp User Context & Per-User Isolation
 */

export interface TelegramUserProfile {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  is_premium?: boolean;
}

/**
 * Returns current Telegram user if running inside Telegram WebApp
 */
export function getTelegramUser(): TelegramUserProfile | null {
  try {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user?.id) {
      return tg.initDataUnsafe.user as TelegramUserProfile;
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Creates user-isolated localStorage key
 */
export function getUserStorageKey(baseKey: string, specificUserId?: string | number): string {
  const tgUser = getTelegramUser();
  const uid = specificUserId !== undefined ? String(specificUserId) : tgUser?.id ? String(tgUser.id) : 'guest';
  return `${baseKey}_${uid}`;
}
