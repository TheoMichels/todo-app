import { z } from "zod";

// --- Section ---
export const SectionSchema = z.object({
  id: z.string().trim().min(1, "L'identifiant de la section est requis"),
  name: z.string().trim().min(1, "Le nom de la section est requis"),
  createdAt: z
    .number()
    .int("La date de création doit être un entier")
    .nonnegative("La date de création doit être positive"),
});
export type Section = z.infer<typeof SectionSchema>;

export const SectionInputSchema = z.object({
  name: z.string().trim().min(1, "Le nom de la section ne peut pas être vide"),
});
export type SectionInput = z.infer<typeof SectionInputSchema>;

// --- Todo ---
export const PrioritySchema = z.enum(["standard", "urgent"], {
  message: "La priorité doit être 'standard' ou 'urgent'",
});
export type Priority = z.infer<typeof PrioritySchema>;

export const TodoSchema = z.object({
  id: z.string().trim().min(1, "L'identifiant de la tâche est requis"),
  sectionId: z.string().trim().min(1, "L'identifiant de la section est requis"),
  title: z.string().trim().min(1, "Le titre de la tâche est requis"),
  done: z.boolean({ message: "Le statut de complétion doit être un booléen" }),
  priority: PrioritySchema.default("standard"),
  order: z.number().finite("L'ordre doit être un nombre fini"),
  createdAt: z
    .number()
    .int("La date de création doit être un entier")
    .nonnegative("La date de création doit être positive"),
});
export type Todo = z.infer<typeof TodoSchema>;

export const TodoInputSchema = z.object({
  id: z.string().trim().min(1).optional(),
  sectionId: z.string().trim().min(1, "L'identifiant de la section est requis"),
  title: z.string().trim().min(1, "Le titre de la tâche ne peut pas être vide"),
  priority: PrioritySchema.optional().default("standard"),
  order: z.number().finite().optional(),
  createdAt: z.number().int().nonnegative().optional(),
});
export type TodoInput = z.infer<typeof TodoInputSchema>;

export const TodoUpdateSchema = z.object({
  title: z.string().trim().min(1, "Le titre ne peut pas être vide").optional(),
  priority: PrioritySchema.optional(),
  done: z.boolean().optional(),
  order: z.number().finite().optional(),
});
export type TodoUpdate = z.infer<typeof TodoUpdateSchema>;

// --- Note ---
export const NoteSchema = z.object({
  id: z.string().trim().min(1, "L'identifiant de la note est requis"),
  title: z.string().trim().min(1, "Le titre de la note est requis"),
  description: z.string({ message: "La description doit être une chaîne" }).default(""),
  createdAt: z
    .number()
    .int("La date de création doit être un entier")
    .nonnegative("La date de création doit être positive"),
});
export type Note = z.infer<typeof NoteSchema>;

export const NoteInputSchema = z.object({
  title: z.string().trim().min(1, "Le titre de la note ne peut pas être vide"),
  description: z.string().optional().default(""),
});
export type NoteInput = z.infer<typeof NoteInputSchema>;

export const NoteUpdateSchema = z.object({
  title: z.string().trim().min(1, "Le titre ne peut pas être vide").optional(),
  description: z.string().optional(),
});
export type NoteUpdate = z.infer<typeof NoteUpdateSchema>;

// --- TrackingPoint ---
export const DueDateSchema = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Le format de la date d'échéance doit être AAAA-MM-JJ"),
  z.literal("").transform(() => undefined),
  z.null().transform(() => undefined),
]);

export const TrackingPointSchema = z.object({
  id: z.string().trim().min(1, "L'identifiant du point de suivi est requis"),
  sectionId: z.string().trim().min(1, "L'identifiant de la section est requis"),
  title: z.string().trim().min(1, "Le titre du point de suivi est requis"),
  status: z.string({ message: "Le statut doit être une chaîne" }).default(""),
  nextStep: z.string({ message: "La prochaine étape doit être une chaîne" }).default(""),
  dueDate: DueDateSchema.optional(),
  order: z.number().finite("L'ordre doit être un nombre fini"),
  createdAt: z
    .number()
    .int("La date de création doit être un entier")
    .nonnegative("La date de création doit être positive"),
});
export type TrackingPoint = z.infer<typeof TrackingPointSchema>;

export const TrackingPointInputSchema = z.object({
  sectionId: z.string().trim().min(1, "L'identifiant de la section est requis"),
  title: z.string().trim().min(1, "Le titre du point de suivi ne peut pas être vide"),
  status: z.string().optional().default(""),
  nextStep: z.string().optional().default(""),
  dueDate: DueDateSchema.optional(),
});
export type TrackingPointInput = z.infer<typeof TrackingPointInputSchema>;

export const TrackingPointUpdateSchema = z.object({
  title: z.string().trim().min(1, "Le titre ne peut pas être vide").optional(),
  status: z.string().optional(),
  nextStep: z.string().optional(),
  dueDate: DueDateSchema.optional(),
  order: z.number().finite().optional(),
});
export type TrackingPointUpdate = z.infer<typeof TrackingPointUpdateSchema>;

// --- Collections ---
export const SectionsSchema = z.array(SectionSchema);
export const TodosSchema = z.array(TodoSchema);
export const NotesSchema = z.array(NoteSchema);
export const TrackingPointsSchema = z.array(TrackingPointSchema);

// --- Validation helper ---
export class ValidationError extends Error {
  constructor(message: string, public readonly issues?: z.ZodIssue[]) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validate<S extends z.ZodTypeAny>(
  schema: S,
  value: unknown,
  customMessage?: string
): z.output<S> {
  const result = schema.safeParse(value);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
      .join(" ; ");
    throw new ValidationError(customMessage || `Valeurs invalides. ${formatted}`, result.error.issues);
  }
  return result.data;
}
