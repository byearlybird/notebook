import z from "zod";

const baseSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  created_at: z.iso.datetime().default(() => new Date().toISOString()),
  updated_at: z.iso.datetime().default(() => new Date().toISOString()),
});

const baseEntrySchema = baseSchema.extend({
  content: z.string().min(1),
  date: z.iso.date().default(() => new Date().toLocaleDateString("en-CA")), // YYYY-MM-DD
});

export const noteSchema = baseEntrySchema;

export const taskSchema = baseEntrySchema.extend({
  status: z.enum(["incomplete", "complete", "canceled", "deferred"]).default("incomplete"),
  original_id: z.uuid().nullable().default(null),
});

export const intentionSchema = baseSchema.extend({
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
  content: z.string().min(1), // Lexical JSON
});

export const goalSchema = baseSchema.extend({
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
  content: z.string().min(1), // Lexical JSON
  status: z.enum(["incomplete", "complete"]).default("incomplete"),
});

export type Note = z.infer<typeof noteSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Intention = z.infer<typeof intentionSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type NewNote = z.input<typeof noteSchema>;
export type NewTask = z.input<typeof taskSchema>;
export type NewIntention = z.input<typeof intentionSchema>;
export type NewGoal = z.input<typeof goalSchema>;

export type Database = {
  notes: Note;
  tasks: Task;
  intentions: Intention;
  goals: Goal;
};
