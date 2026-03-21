import { goalSchema, type Database, type Goal } from "@/db/schema";
import type { Kysely } from "kysely";

export function createGoalService(db: Kysely<Database>) {
  return {
    create: async (month: string, content: string) => {
      const goal = goalSchema.parse({ month, content });
      await db.insertInto("goals").values(goal).execute();
    },
    update: async (id: string, updates: Partial<Pick<Goal, "content" | "status">>) => {
      const finalUpdates = { ...updates, updated_at: new Date().toLocaleString("en-CA") };
      await db.updateTable("goals").set(finalUpdates).where("id", "=", id).execute();
    },
    delete: async (id: string) => {
      await db.deleteFrom("goals").where("id", "=", id).execute();
    },
    setStatus: async (id: string, status: Goal["status"]) => {
      await db.updateTable("goals").set({ status }).where("id", "=", id).execute();
    },
    getByMonth: async (month: string) => {
      return db.selectFrom("goals").where("month", "=", month).selectAll().execute();
    },
    get: async (id: string) => {
      return db.selectFrom("goals").selectAll().where("id", "=", id).executeTakeFirst();
    },
  };
}
