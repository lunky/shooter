export interface Store {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
}

class LocalStorageStore implements Store {
  async get<T>(key: string): Promise<T | null> {
    try {
      return JSON.parse(localStorage.getItem(key) ?? "null") as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const store: Store = new LocalStorageStore();
