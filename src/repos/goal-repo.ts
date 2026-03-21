import { db } from "@/db/client";
import type { Goal } from "@/db/schema";

export const goalRepo = {
  async findAll(): Promise<Goal[]> {
    return await db.selectFrom("goals").selectAll().orderBy("created_at", "asc").execute();
  },

  async findById(id: string): Promise<Goal | undefined> {
    return await db.selectFrom("goals").selectAll().where("id", "=", id).executeTakeFirst();
  },
};
