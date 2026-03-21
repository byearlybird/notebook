import { db } from "@/db/client";
import { type Intention, type NewIntention, intentionSchema } from "@/db/schema";

export const intentionRepo = {
  async findAll(): Promise<Intention[]> {
    return await db.selectFrom("intentions").selectAll().orderBy("month", "desc").execute();
  },

  async findByMonth(month: string): Promise<Intention | undefined> {
    return await db
      .selectFrom("intentions")
      .selectAll()
      .where("month", "=", month)
      .executeTakeFirst();
  },

  async create(intention: NewIntention): Promise<Intention> {
    const insert: Intention = intentionSchema.parse(intention);
    await db.insertInto("intentions").values(insert).execute();
    return insert;
  },

  async update(id: string, updates: Partial<Intention>): Promise<Intention | undefined> {
    await db
      .updateTable("intentions")
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();

    return await db.selectFrom("intentions").selectAll().where("id", "=", id).executeTakeFirst();
  },
};
