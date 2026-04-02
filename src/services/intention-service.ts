import type { Database } from "@/db/schema";
import { toIntention, type Intention } from "@/models";
import { extractPlainText } from "@/utils/extract-plain-text";
import { getTodayISODate } from "@/utils/date-utils";
import { type Kysely, sql } from "kysely";

export function createIntentionService(db: Kysely<Database>) {
  return {
    getByMonth: async (month: string): Promise<Intention | undefined> => {
      const result = await db
        .selectFrom("entries")
        .where(sql`strftime('%Y-%m', date)`, "=", month)
        .where("type", "=", "intention")
        .selectAll()
        .executeTakeFirst();
      return result ? toIntention(result) : undefined;
    },
    upsert: async (month: string, content: string): Promise<void> => {
      await db.transaction().execute(async (tx) => {
        const existing = await tx
          .selectFrom("entries")
          .where(sql`strftime('%Y-%m', date)`, "=", month)
          .where("type", "=", "intention")
          .selectAll()
          .executeTakeFirst();

        const plainText = extractPlainText(content);
        if (existing) {
          await tx
            .updateTable("entries")
            .set({ content, updatedAt: new Date().toISOString() })
            .where("id", "=", existing.id)
            .execute();
          await tx
            .insertInto("entrySearchMeta")
            .values({ entryId: existing.id, plainText })
            .onConflict((oc) => oc.column("entryId").doUpdateSet({ plainText }))
            .execute();
        } else {
          const now = new Date().toISOString();
          const id = crypto.randomUUID();
          await tx
            .insertInto("entries")
            .values({
              id,
              date: getTodayISODate(),
              content,
              type: "intention",
              createdAt: now,
              updatedAt: now,
            })
            .execute();
          await tx
            .insertInto("entrySearchMeta")
            .values({ entryId: id, plainText })
            .execute();
        }
      });
    },
    get: async (id: string): Promise<Intention | undefined> => {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", id)
        .where("type", "=", "intention")
        .executeTakeFirst();

      return result ? toIntention(result) : undefined;
    },
    update: async (id: string, updates: { content: string }): Promise<void> => {
      await db.transaction().execute(async (trx) => {
        await trx
          .updateTable("entries")
          .set({
            ...updates,
            updatedAt: new Date().toISOString(),
          })
          .where("id", "=", id)
          .where("type", "=", "intention")
          .execute();
        const plainText = extractPlainText(updates.content);
        await trx
          .insertInto("entrySearchMeta")
          .values({ entryId: id, plainText })
          .onConflict((oc) => oc.column("entryId").doUpdateSet({ plainText }))
          .execute();
      });
    },
    delete: async (id: string): Promise<void> => {
      await db.deleteFrom("entries").where("id", "=", id).where("type", "=", "intention").execute();
    },
  };
}
