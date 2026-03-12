import z from "zod";

const baseSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  created_at: z.iso.datetime().default(() => new Date().toISOString()),
  updated_at: z.iso.datetime().default(() => new Date().toISOString()),
  is_deleted: z.number().int().min(0).max(1).default(0),
});

const baseEntrySchema = baseSchema.extend({
  content: z.string().min(1),
  date: z.iso.date().default(() => new Date().toISOString().split("T")[0]),
  scope: z.enum(["daily", "weekly", "monthly"]),
});

export const noteSchema = baseEntrySchema.extend({
  category: z.enum(["log", "intention", "reflection"]),
});

export const taskSchema = baseEntrySchema.extend({
  status: z.enum(["incomplete", "complete", "canceled"]).default("incomplete"),
});

export type Note = z.infer<typeof noteSchema>;
export type Task = z.infer<typeof taskSchema>;
export type NewNote = z.input<typeof noteSchema>;
export type NewTask = z.input<typeof taskSchema>;

