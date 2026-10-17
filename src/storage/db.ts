import { z } from "zod";
import { readStored, writeStored } from "./validatedStorage";
import { isLocalMode } from "../config/storageMode";

export function getApiUrl(collection: string): string | null {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return `${envUrl.trim().replace(/\/$/, "")}/api/db?collection=${collection}`;
  }

  if (typeof window !== "undefined" && window.location) {
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isLocalhost) {
      return `/api/db?collection=${collection}`;
    }
  }
  return null;
}

export class OfflineStore<T extends { id: string }> {
  constructor(
    private collection: string,
    private itemSchema: z.ZodType<T>
  ) {}

  public get storageKey() {
    return `@todo_${this.collection}_v1`;
  }

  public get legacyKey() {
    return `todo-app:${this.collection}`;
  }

  async loadLocal(): Promise<T[]> {
    return readStored(this.storageKey, z.array(this.itemSchema), [], this.legacyKey);
  }

  async saveLocal(items: T[]): Promise<void> {
    await writeStored(this.storageKey, z.array(this.itemSchema), items, this.legacyKey);
  }

  async syncRemote(items: T[]): Promise<void> {
    if (isLocalMode) return;
    try {
      const { syncCollectionToCloud } = await import("../services/syncService");
      await syncCollectionToCloud(this.collection, items);
    } catch {
      // Ignorer si la synchronisation échoue hors-ligne
    }
  }

  async load(): Promise<T[]> {
    return this.loadLocal();
  }

  async saveAll(items: T[]): Promise<void> {
    await this.saveLocal(items);
    await this.syncRemote(items);
  }

  async clearLocal(): Promise<void> {
    await this.saveLocal([]);
  }
}

export async function clearAllLocalStores(): Promise<void> {
  const { clearLocalCache } = await import("../services/syncService");
  await clearLocalCache();
}
