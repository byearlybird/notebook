import { db } from "@/db/client";
import { type MonthlyLog, type NewMonthlyLog, monthlyLogSchema } from "@/db/schema";

export const monthlyLogRepo = {
  async findAll(): Promise<MonthlyLog[]> {
    return await db.selectFrom("monthly_logs").selectAll().orderBy("month", "desc").execute();
  },

  async findById(id: string): Promise<MonthlyLog | undefined> {
    return await db.selectFrom("monthly_logs").selectAll().where("id", "=", id).executeTakeFirst();
  },

  async findByMonth(month: string): Promise<MonthlyLog | undefined> {
    return await db
      .selectFrom("monthly_logs")
      .selectAll()
      .where("month", "=", month)
      .executeTakeFirst();
  },

  async create(log: NewMonthlyLog): Promise<MonthlyLog> {
    const insert: MonthlyLog = monthlyLogSchema.parse(log);
    await db.insertInto("monthly_logs").values(insert).execute();
    return insert;
  },

  async update(id: string, updates: Partial<MonthlyLog>): Promise<MonthlyLog | undefined> {
    await db
      .updateTable("monthly_logs")
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();

    return this.findById(id);
  },
};
