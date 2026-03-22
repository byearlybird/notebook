import type { Database } from "@/db/schema";
import { toIntention, type Intention } from "@/models";
import type { Kysely } from "kysely";

export function createIntentionService(db: Kysely<Database>) {
  return {
    getByMonth: async (month: string): Promise<Intention | undefined> => {
      const result = await db
        .selectFrom("entries")
        .where("date", "=", month)
        .where("type", "=", "intention")
        .selectAll()
        .executeTakeFirst();
      return result ? toIntention(result) : undefined;
    },
    upsert: async (month: string, content: string): Promise<void> => {
      await db.transaction().execute(async (tx) => {
        const existing = await tx
          .selectFrom("entries")
          .where("date", "=", month)
          .where("type", "=", "intention")
          .selectAll()
          .executeTakeFirst();

        if (existing) {
          await tx
            .updateTable("entries")
            .set({ content, updatedAt: new Date().toISOString() })
            .where("id", "=", existing.id)
            .execute();
        } else {
          const now = new Date().toISOString();
          await tx
            .insertInto("entries")
            .values({
              id: crypto.randomUUID(),
              date: month,
              content,
              type: "intention",
              createdAt: now,
              updatedAt: now,
            })
            .execute();
        }
      });
    },
  };
}
