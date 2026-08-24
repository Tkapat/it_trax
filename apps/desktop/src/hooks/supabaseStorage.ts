import { load, Store } from '@tauri-apps/plugin-store';

const STORE_NAME = 'supabase-auth';

let storePromise: Promise<Store | null> | null = null;

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

function getStoreInstance(): Promise<Store | null> {
  if (!isTauri()) {
    return Promise.resolve(null);
  }
  if (!storePromise) {
    storePromise = load(STORE_NAME, { autoSave: true }).catch((err) => {
      console.error('Failed to initialize Tauri store, falling back', err);
      return null;
    });
  }
  return storePromise;
}

/** localStorage-backed fallback for non-Tauri environments (plain web dev). */
const localFallback = {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    localStorage.removeItem(key);
  },
};

export const tauriAuthStorage = {
  async getItem(key: string): Promise<string | null> {
    const store = await getStoreInstance();
    if (!store) return localFallback.getItem(key);
    return (await store.get(key)) ?? null;
  },

  async setItem(key: string, value: string): Promise<void> {
    const store = await getStoreInstance();
    if (!store) return localFallback.setItem(key, value);
    await store.set(key, value);
  },

  async removeItem(key: string): Promise<void> {
    const store = await getStoreInstance();
    if (!store) return localFallback.removeItem(key);
    await store.delete(key);
  },
};
