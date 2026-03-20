import { db } from "@/db/client";
import { type MonthlyGoal, type NewMonthlyGoal, monthlyGoalSchema } from "@/db/schema";

export const monthlyGoalRepo = {
  async findAll(): Promise<MonthlyGoal[]> {
    return await db
      .selectFrom("monthly_goals")
      .selectAll()
      .orderBy("created_at", "asc")
      .execute();
  },

  async findByLogId(logId: string): Promise<MonthlyGoal[]> {
    return await db
      .selectFrom("monthly_goals")
      .selectAll()
      .where("monthly_log_id", "=", logId)
      .orderBy("created_at", "asc")
      .execute();
  },

  async findById(id: string): Promise<MonthlyGoal | undefined> {
    return await db.selectFrom("monthly_goals").selectAll().where("id", "=", id).executeTakeFirst();
  },

  async create(goal: NewMonthlyGoal): Promise<MonthlyGoal> {
    const insert: MonthlyGoal = monthlyGoalSchema.parse(goal);
    await db.insertInto("monthly_goals").values(insert).execute();
    return insert;
  },

  async update(id: string, updates: Partial<MonthlyGoal>): Promise<MonthlyGoal | undefined> {
    await db
      .updateTable("monthly_goals")
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();

    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    const goal = await this.findById(id);
    if (!goal) return;

    await db.deleteFrom("monthly_goals").where("id", "=", id).execute();
  },
};
