import { db } from "@/db/client";
import { type Goal, type NewGoal, goalSchema } from "@/db/schema";

export const goalRepo = {
  async findAll(): Promise<Goal[]> {
    return await db.selectFrom("goals").selectAll().orderBy("created_at", "asc").execute();
  },

  async findByMonth(month: string): Promise<Goal[]> {
    return await db
      .selectFrom("goals")
      .selectAll()
      .where("month", "=", month)
      .orderBy("created_at", "asc")
      .execute();
  },

  async findById(id: string): Promise<Goal | undefined> {
    return await db.selectFrom("goals").selectAll().where("id", "=", id).executeTakeFirst();
  },

  async create(goal: NewGoal): Promise<Goal> {
    const insert: Goal = goalSchema.parse(goal);
    await db.insertInto("goals").values(insert).execute();
    return insert;
  },

  async update(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    await db
      .updateTable("goals")
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();

    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await db.deleteFrom("goals").where("id", "=", id).execute();
  },
};
