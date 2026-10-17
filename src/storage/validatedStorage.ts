import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import { validate } from "../types/schemas";

export function normalizeTimestamp(val: unknown): number {
  if (typeof val === "number" && Number.isFinite(val) && val >= 0) {
    return Math.floor(val);
  }
  if (typeof val === "string" && val.trim().length > 0) {
    const d = new Date(val);
    const time = d.getTime();
    if (!Number.isNaN(time) && time >= 0) {
      return Math.floor(time);
    }
  }
  return Date.now();
}

export function normalizeDueDate(val: unknown): string | undefined {
  if (val === null || val === undefined || val === "") return undefined;
  if (typeof val !== "string") return undefined;
  const trimmed = val.trim();
  if (!trimmed) return undefined;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const matchIso = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/);
  if (matchIso) {
    return matchIso[1];
  }
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return undefined;
}

export function normalizeLegacySection(item: unknown): unknown {
  if (!item || typeof item !== "object") return item;
  const raw = item as Record<string, unknown>;
  const id =
    typeof raw.id === "string" && raw.id.trim().length > 0
      ? raw.id.trim()
      : typeof raw.id === "number"
      ? String(raw.id)
      : undefined;
  const name =
    typeof raw.name === "string" && raw.name.trim().length > 0
      ? raw.name.trim()
      : typeof raw.title === "string" && raw.title.trim().length > 0
      ? raw.title.trim()
      : undefined;
  const createdAt = normalizeTimestamp(raw.createdAt);

  return {
    ...raw,
    ...(id !== undefined ? { id } : {}),
    ...(name !== undefined ? { name } : {}),
    createdAt,
  };
}

export function normalizeLegacyTodo(item: unknown, index: number): unknown {
  if (!item || typeof item !== "object") return item;
  const raw = item as Record<string, unknown>;
  const id =
    typeof raw.id === "string" && raw.id.trim().length > 0
      ? raw.id.trim()
      : typeof raw.id === "number"
      ? String(raw.id)
      : undefined;
  const rawSecId = raw.sectionId ?? raw.section_id;
  const sectionId =
    typeof rawSecId === "string" && rawSecId.trim().length > 0
      ? rawSecId.trim()
      : "default";
  const title = typeof raw.title === "string" ? raw.title : undefined;
  const done =
    typeof raw.done === "boolean"
      ? raw.done
      : raw.done === undefined || raw.done === null
      ? false
      : raw.done;
  const priority =
    raw.priority === "urgent"
      ? "urgent"
      : raw.priority === "standard" || raw.priority === undefined || raw.priority === null
      ? "standard"
      : raw.priority;
  const order =
    typeof raw.order === "number" && Number.isFinite(raw.order)
      ? raw.order
      : index;
  const createdAt = normalizeTimestamp(raw.createdAt);

  return {
    ...raw,
    ...(id !== undefined ? { id } : {}),
    sectionId,
    ...(title !== undefined ? { title } : {}),
    done,
    priority,
    order,
    createdAt,
  };
}

export function normalizeLegacyNote(item: unknown): unknown {
  if (!item || typeof item !== "object") return item;
  const raw = item as Record<string, unknown>;
  const id =
    typeof raw.id === "string" && raw.id.trim().length > 0
      ? raw.id.trim()
      : typeof raw.id === "number"
      ? String(raw.id)
      : undefined;
  const title = typeof raw.title === "string" ? raw.title : undefined;
  const description = typeof raw.description === "string" ? raw.description : "";
  const createdAt = normalizeTimestamp(raw.createdAt);

  return {
    ...raw,
    ...(id !== undefined ? { id } : {}),
    ...(title !== undefined ? { title } : {}),
    description,
    createdAt,
  };
}

export function normalizeLegacyTracking(item: unknown, index: number): unknown {
  if (!item || typeof item !== "object") return item;
  const raw = item as Record<string, unknown>;
  const id =
    typeof raw.id === "string" && raw.id.trim().length > 0
      ? raw.id.trim()
      : typeof raw.id === "number"
      ? String(raw.id)
      : undefined;
  const rawSecId = raw.sectionId ?? raw.section_id;
  const sectionId =
    typeof rawSecId === "string" && rawSecId.trim().length > 0
      ? rawSecId.trim()
      : "default";
  const title = typeof raw.title === "string" ? raw.title : undefined;
  const status = typeof raw.status === "string" ? raw.status : "";
  const nextStep =
    typeof raw.nextStep === "string"
      ? raw.nextStep
      : typeof raw.next_step === "string"
      ? raw.next_step
      : "";
  const dueDateRaw = raw.dueDate ?? raw.due_date ?? raw.nextDueDate ?? raw.next_due_date;
  const dueDate = normalizeDueDate(dueDateRaw);
  const order =
    typeof raw.order === "number" && Number.isFinite(raw.order)
      ? raw.order
      : index;
  const createdAt = normalizeTimestamp(raw.createdAt);

  return {
    ...raw,
    ...(id !== undefined ? { id } : {}),
    sectionId,
    ...(title !== undefined ? { title } : {}),
    status,
    nextStep,
    dueDate,
    order,
    createdAt,
  };
}

export function detectCollection(
  key: string,
  legacyKey?: string
): "sections" | "todos" | "notes" | "trackings" | null {
  const str = `${key} ${legacyKey ?? ""}`.toLowerCase();
  if (str.includes("section")) return "sections";
  if (str.includes("tracking")) return "trackings";
  if (str.includes("note")) return "notes";
  if (str.includes("todo")) return "todos";
  return null;
}

export function normalizeStoredData(
  data: unknown,
  collection: "sections" | "todos" | "notes" | "trackings" | null
): unknown {
  if (!Array.isArray(data) || !collection) return data;
  switch (collection) {
    case "sections":
      return data.map((item) => normalizeLegacySection(item));
    case "todos":
      return data.map((item, idx) => normalizeLegacyTodo(item, idx));
    case "notes":
      return data.map((item) => normalizeLegacyNote(item));
    case "trackings":
      return data.map((item, idx) => normalizeLegacyTracking(item, idx));
    default:
      return data;
  }
}

export async function readStored<S extends z.ZodTypeAny>(
  key: string,
  schema: S,
  fallback: z.output<S>,
  legacyKey?: string
): Promise<z.output<S>> {
  try {
    let raw = await AsyncStorage.getItem(key);
    let isFromLegacy = false;

    if (raw === null && legacyKey) {
      raw = await AsyncStorage.getItem(legacyKey);
      isFromLegacy = raw !== null;
    }

    if (raw === null) return fallback;

    const parsed = JSON.parse(raw);
    const collection = detectCollection(key, legacyKey);
    const normalized = normalizeStoredData(parsed, collection);
    const validated = validate(schema, normalized);

    if (isFromLegacy) {
      // Migration en douceur vers la clé cible préfixée
      await AsyncStorage.setItem(key, JSON.stringify(validated));
      if (legacyKey) {
        await AsyncStorage.removeItem(legacyKey).catch(() => {});
      }
    }

    return validated;
  } catch {
    throw new Error(
      "Données locales illisibles ou invalides. Elles sont conservées ; restaurez une sauvegarde ou réessayez."
    );
  }
}

export interface WriteStoredOptions {
  overwrite?: boolean;
}

export async function writeStored<S extends z.ZodTypeAny>(
  key: string,
  schema: S,
  value: z.input<S>,
  legacyKey?: string,
  options?: WriteStoredOptions
): Promise<void> {
  const parsed = validate(schema, value);
  if (!options?.overwrite) {
    // Une écriture locale normale ne doit jamais masquer un ancien contenu corrompu.
    await readStored(key, schema, parsed, legacyKey);
  }
  try {
    await AsyncStorage.setItem(key, JSON.stringify(parsed));
  } catch {
    throw new Error("Enregistrement local impossible. Vérifiez l’espace disponible puis réessayez.");
  }
}
