import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import { validate } from "../types/schemas";

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
    const validated = validate(schema, parsed);

    if (isFromLegacy) {
      // Migration en douceur vers la clé cible préfixée
      await AsyncStorage.setItem(key, JSON.stringify(validated));
    }

    return validated;
  } catch {
    throw new Error(
      "Données locales illisibles ou invalides. Elles sont conservées ; restaurez une sauvegarde ou réessayez."
    );
  }
}

export async function writeStored<S extends z.ZodTypeAny>(
  key: string,
  schema: S,
  value: z.input<S>,
  legacyKey?: string
): Promise<void> {
  const parsed = validate(schema, value);
  // Une écriture ne doit jamais masquer un ancien contenu corrompu.
  await readStored(key, schema, parsed, legacyKey);
  try {
    await AsyncStorage.setItem(key, JSON.stringify(parsed));
  } catch {
    throw new Error("Enregistrement local impossible. Vérifiez l’espace disponible puis réessayez.");
  }
}
