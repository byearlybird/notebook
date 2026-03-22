import type { Database } from "@/db/schema";
import { toTask, type Task } from "@/models";
import type { Kysely } from "kysely";

export function createTaskService(db: Kysely<Database>) {
  return {
    async create(content: string) {
      const now = new Date().toISOString();
      await db
        .insertInto("entries")
        .values({
          id: crypto.randomUUID(),
          date: new Date().toLocaleDateString("en-CA"),
          content,
          type: "task",
          status: "incomplete",
          originId: null,
          createdAt: now,
          updatedAt: now,
        })
        .execute();
    },
    async get(id: string): Promise<Task | undefined> {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", id)
        .where("type", "=", "task")
        .executeTakeFirst();
      return result ? toTask(result) : undefined;
    },
    async update(id: string, updates: Partial<Pick<Task, "content" | "status">>) {
      await db
        .updateTable("entries")
        .set({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .where("id", "=", id)
        .where("type", "=", "task")
        .execute();
    },
    async delete(id: string) {
      await db.deleteFrom("entries").where("id", "=", id).where("type", "=", "task").execute();
    },
    async getByStatus(status: Task["status"]): Promise<Task[]> {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("type", "=", "task")
        .where("status", "=", status)
        .execute();
      return result.map(toTask);
    },
    async getFirstByOriginalId(originId: string): Promise<Task | undefined> {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("originId", "=", originId)
        .executeTakeFirst();
      return result ? toTask(result) : undefined;
    },
    async rollover(taskId: string, targetDate: string) {
      await db.transaction().execute(async (trx) => {
        const existingTask = await trx
          .updateTable("entries")
          .set({
            status: "deferred",
            updatedAt: new Date().toISOString(),
          })
          .where("id", "=", taskId)
          .where("type", "=", "task")
          .returningAll()
          .executeTakeFirstOrThrow();
        const now = new Date().toISOString();
        await trx
          .insertInto("entries")
          .values({
            id: crypto.randomUUID(),
            date: targetDate,
            content: existingTask.content,
            type: "task",
            status: "incomplete",
            originId: existingTask.id,
            createdAt: now,
            updatedAt: now,
          })
          .execute();
      });
    },
  };
}
