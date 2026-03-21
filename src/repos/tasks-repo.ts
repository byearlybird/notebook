import { db } from "@/db/client";
import { type Task } from "@/db/schema";

export const tasksRepo = {
  async findAll(): Promise<Task[]> {
    return await db.selectFrom("tasks").selectAll().orderBy("created_at", "desc").execute();
  },

  async findByDate(date: string): Promise<Task[]> {
    return await db
      .selectFrom("tasks")
      .selectAll()
      .where("date", "=", date)
      .orderBy("created_at", "desc")
      .execute();
  },
};
