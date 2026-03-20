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

export const monthlyLogSchema = baseSchema.extend({
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM format
  intention: z.string().nullable().default(null), // Lexical JSON
});

export const monthlyGoalSchema = baseSchema.extend({
  monthly_log_id: z.string(), // FK to monthly_logs
  content: z.string().min(1), // Lexical JSON
  status: z.enum(["incomplete", "complete"]).default("incomplete"),
});

export type Note = z.infer<typeof noteSchema>;
export type Task = z.infer<typeof taskSchema>;
export type MonthlyLog = z.infer<typeof monthlyLogSchema>;
export type MonthlyGoal = z.infer<typeof monthlyGoalSchema>;
export type NewNote = z.input<typeof noteSchema>;
export type NewTask = z.input<typeof taskSchema>;
export type NewMonthlyLog = z.input<typeof monthlyLogSchema>;
export type NewMonthlyGoal = z.input<typeof monthlyGoalSchema>;

export type Database = {
  notes: Note;
  tasks: Task;
  monthly_logs: MonthlyLog;
  monthly_goals: MonthlyGoal;
};
