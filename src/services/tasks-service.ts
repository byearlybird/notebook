import { taskSchema, type Database, type Task } from "@/db";
import type { Kysely } from "kysely";

export function createTaskService(db: Kysely<Database>) {
  return {
    async create(content: string) {
      const task = taskSchema.parse({ content, status: "incomplete" });
      await db.insertInto("tasks").values(task).execute();
    },
    async get(id: string) {
      return db.selectFrom("tasks").selectAll().where("id", "=", id).executeTakeFirst();
    },
    async update(id: string, updates: Partial<Task>) {
      const finalUpdates: Partial<Task> = {
        ...updates,
        updated_at: new Date().toLocaleString("en-CA"),
      };
      return db.updateTable("tasks").set(finalUpdates).where("id", "=", id).executeTakeFirst();
    },
    async delete(id: string) {
      return db.deleteFrom("tasks").where("id", "=", id).executeTakeFirst();
    },
    async getByStatus(status: Task["status"]) {
      return db.selectFrom("tasks").selectAll().where("status", "=", status).execute();
    },
    async getFirstByOriginalId(originalId: string) {
      return db
        .selectFrom("tasks")
        .selectAll()
        .where("original_id", "=", originalId)
        .executeTakeFirst();
    },
    async rollover(taskId: string, targetDate: string) {
      const update: Partial<Task> = {
        status: "deferred",
        updated_at: new Date().toLocaleString("en-CA"),
        date: targetDate,
      };
      await db.transaction().execute(async (trx) => {
        const existingTask = await trx
          .updateTable("tasks")
          .set(update)
          .where("id", "=", taskId)
          .returningAll()
          .executeTakeFirstOrThrow();
        const newTask = taskSchema.parse({
          content: existingTask?.content,
          original_id: existingTask.id,
        });
        await trx.insertInto("tasks").values(newTask).execute();
      });
    },
  };
}
