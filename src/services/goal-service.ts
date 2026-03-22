import { type Database } from "@/db/schema";
import { toGoal, type Goal } from "@/models";
import { getTodayISODate } from "@/utils/date-utils";
import { type Kysely, sql } from "kysely";

export function createGoalService(db: Kysely<Database>) {
  return {
    create: async (month: string, content: string) => {
      const now = new Date().toISOString();
      await db
        .insertInto("entries")
        .values({
          id: crypto.randomUUID(),
          date: getTodayISODate(),
          content,
          type: "goal",
          status: "incomplete",
          createdAt: now,
          updatedAt: now,
        })
        .execute();
    },
    update: async (id: string, updates: Partial<Pick<Goal, "content" | "status">>) => {
      await db
        .updateTable("entries")
        .set({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .where("id", "=", id)
        .where("type", "=", "goal")
        .execute();
    },
    delete: async (id: string) => {
      await db.deleteFrom("entries").where("id", "=", id).where("type", "=", "goal").execute();
    },
    setStatus: async (id: string, status: Goal["status"]) => {
      await db
        .updateTable("entries")
        .set({ status, updatedAt: new Date().toISOString() })
        .where("id", "=", id)
        .where("type", "=", "goal")
        .execute();
    },
    getByMonth: async (month: string): Promise<Goal[]> => {
      const result = await db
        .selectFrom("entries")
        .where(sql`strftime('%Y-%m', date)`, "=", month)
        .where("type", "=", "goal")
        .selectAll()
        .execute();

      return result.map(toGoal);
    },
    get: async (id: string): Promise<Goal | undefined> => {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", id)
        .where("type", "=", "goal")
        .executeTakeFirst();

      return result ? toGoal(result) : undefined;
    },
  };
}
