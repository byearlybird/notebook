import { db } from "@/db/client";
import { type Task, type NewTask, taskSchema } from "@/db/schema";

export const tasksRepo = {
  async findAll(): Promise<Task[]> {
    return await db
      .selectFrom("tasks")
      .selectAll()
      .where("is_deleted", "=", 0)
      .orderBy("created_at", "desc")
      .execute();
  },

  async findByDate(date: string): Promise<Task[]> {
    return await db
      .selectFrom("tasks")
      .selectAll()
      .where("is_deleted", "=", 0)
      .where("date", "=", date)
      .orderBy("created_at", "desc")
      .execute();
  },

  async findIncomplete(): Promise<Task[]> {
    return await db
      .selectFrom("tasks")
      .selectAll()
      .where("is_deleted", "=", 0)
      .where("status", "=", "incomplete")
      .orderBy("created_at", "desc")
      .execute();
  },

  async findById(id: string): Promise<Task | undefined> {
    return await db
      .selectFrom("tasks")
      .selectAll()
      .where("id", "=", id)
      .where("is_deleted", "=", 0)
      .executeTakeFirst();
  },

  async findByOriginalId(originalId: string): Promise<Task | undefined> {
    return await db
      .selectFrom("tasks")
      .selectAll()
      .where("is_deleted", "=", 0)
      .where("original_id", "=", originalId)
      .orderBy("created_at", "desc")
      .executeTakeFirst();
  },

  async create(task: NewTask): Promise<Task> {
    const insert: Task = taskSchema.parse(task);
    await db.insertInto("tasks").values(insert).execute();
    return insert;
  },

  async update(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    await db
      .updateTable("tasks")
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();

    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await db
      .updateTable("tasks")
      .set({ is_deleted: 1, updated_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();
  },
};
