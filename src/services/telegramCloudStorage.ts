/**
 * Telegram WebApp CloudStorage Service
 * 
 * Provides unified persistent storage using Telegram.WebApp.CloudStorage
 * with transparent localStorage caching & fallback for browser/development environments.
 */

import { UserRole } from '../types/fleur';

const CLOUD_STORAGE_TIMEOUT_MS = 1200;
export const STORAGE_KEY_USER_ROLE = 'fleur_user_role';

export const telegramCloudStorage = {
  /**
   * Check if Telegram WebApp CloudStorage is natively supported
   */
  isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      Boolean(window.Telegram?.WebApp?.CloudStorage && typeof window.Telegram.WebApp.CloudStorage.getItem === 'function')
    );
  },

  /**
   * Get item from Telegram CloudStorage with fallback to localStorage
   */
  async getItem(key: string): Promise<string | null> {
    if (this.isAvailable()) {
      try {
        const cloudValue = await Promise.race<string | null>([
          new Promise<string | null>((resolve) => {
            try {
              window.Telegram!.WebApp.CloudStorage!.getItem(key, (error, value) => {
                if (error) {
                  console.warn(`[CloudStorage] Error getting "${key}":`, error);
                  resolve(null);
                } else if (typeof value === 'string' && value.trim().length > 0) {
                  resolve(value);
                } else {
                  // Telegram returns empty string if key is unset
                  resolve(null);
                }
              });
            } catch (err) {
              console.warn(`[CloudStorage] Call failed for "${key}":`, err);
              resolve(null);
            }
          }),
          new Promise<string | null>((resolve) =>
            setTimeout(() => resolve(null), CLOUD_STORAGE_TIMEOUT_MS)
          ),
        ]);

        if (cloudValue !== null) {
          try {
            localStorage.setItem(key, cloudValue);
          } catch {
            // ignore quota errors
          }
          return cloudValue;
        }
      } catch (e) {
        console.warn(`[CloudStorage] Failed to read "${key}" from CloudStorage:`, e);
      }
    }

    // Fallback to localStorage
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  /**
   * Set item in Telegram CloudStorage and sync to localStorage
   */
  async setItem(key: string, value: string): Promise<boolean> {
    // 1. Immediately cache in localStorage for instant synchronous reads
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }

    // 2. Persist to Telegram CloudStorage
    if (this.isAvailable()) {
      try {
        const success = await Promise.race<boolean>([
          new Promise<boolean>((resolve) => {
            try {
              window.Telegram!.WebApp.CloudStorage!.setItem(key, value, (error, stored) => {
                if (error) {
                  console.warn(`[CloudStorage] Error setting "${key}":`, error);
                  resolve(false);
                } else {
                  resolve(stored !== false);
                }
              });
            } catch (err) {
              console.warn(`[CloudStorage] Call failed for "${key}":`, err);
              resolve(false);
            }
          }),
          new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(false), CLOUD_STORAGE_TIMEOUT_MS)
          ),
        ]);
        return success;
      } catch (e) {
        console.warn(`[CloudStorage] Failed to set "${key}":`, e);
        return false;
      }
    }

    return true;
  },

  /**
   * Remove item from Telegram CloudStorage and localStorage
   */
  async removeItem(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }

    if (this.isAvailable()) {
      try {
        return await Promise.race<boolean>([
          new Promise<boolean>((resolve) => {
            try {
              window.Telegram!.WebApp.CloudStorage!.removeItem(key, (error, removed) => {
                if (error) {
                  console.warn(`[CloudStorage] Error removing "${key}":`, error);
                  resolve(false);
                } else {
                  resolve(removed !== false);
                }
              });
            } catch (err) {
              resolve(false);
            }
          }),
          new Promise<boolean>((resolve) =>
            setTimeout(() => resolve(false), CLOUD_STORAGE_TIMEOUT_MS)
          ),
        ]);
      } catch {
        return false;
      }
    }

    return true;
  },

  /**
   * Dedicated helper for user role ('admin' | 'client')
   */
  async getUserRole(): Promise<UserRole> {
    try {
      const stored = await this.getItem(STORAGE_KEY_USER_ROLE);
      if (stored === 'admin' || stored === 'client') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'client';
  },

  /**
   * Save user role to Telegram CloudStorage and localStorage
   */
  async setUserRole(role: UserRole): Promise<boolean> {
    return this.setItem(STORAGE_KEY_USER_ROLE, role);
  },
};
