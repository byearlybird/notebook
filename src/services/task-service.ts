import { db } from "@/db/client";
import type { TaskTable } from "@/db/schema";
import { toLocalISO } from "@/utils/dates";

export const taskService = {
  async createTask(content: string, label: string | null = null) {
    const now = new Date();
    const localISO = toLocalISO(now);
    await db
      .insertInto("tasks")
      .values({
        id: crypto.randomUUID(),
        content,
        label,
        date: localISO.slice(0, 10),
        status: "incomplete",
        created_at: localISO,
      })
      .execute();
  },
  async cycleStatus(id: string) {
    const task = await db
      .selectFrom("tasks")
      .select("status")
      .where("id", "=", id)
      .executeTakeFirstOrThrow();

    const next: Record<TaskTable["status"], TaskTable["status"]> = {
      incomplete: "complete",
      complete: "cancelled",
      cancelled: "incomplete",
      deferred: "incomplete",
    };

    await db.updateTable("tasks").set({ status: next[task.status] }).where("id", "=", id).execute();
  },
  async setStatus(id: string, status: TaskTable["status"]) {
    await db.updateTable("tasks").set({ status }).where("id", "=", id).execute();
  },
};
