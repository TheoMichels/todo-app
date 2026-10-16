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
    const apiUrl = getApiUrl(this.collection);
    if (!apiUrl) return;

    try {
      await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(items),
      });
    } catch (err) {
      console.warn("Failed to sync remote", err);
    }
  }

  async load(): Promise<T[]> {
    if (isLocalMode) {
      return this.loadLocal();
    }

    const apiUrl = getApiUrl(this.collection);
    if (!apiUrl) return this.loadLocal();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(apiUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const validated = z.array(this.itemSchema).safeParse(data);
          if (validated.success) {
            await this.saveLocal(validated.data);
            return validated.data;
          } else {
            console.warn("API returned invalid data format, keeping local cache");
          }
        }
      }
    } catch {
      console.warn("API fetch failed, falling back to local");
    }
    return this.loadLocal();
  }

  async saveAll(items: T[]): Promise<void> {
    await this.saveLocal(items);
    await this.syncRemote(items);
  }
}
