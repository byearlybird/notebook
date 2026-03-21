import { intentionSchema, type Database } from "@/db/schema";
import type { Kysely } from "kysely";

export function createIntentionService(db: Kysely<Database>) {
  return {
    getByMonth: async (month: string) => {
      return db.selectFrom("intentions").where("month", "=", month).selectAll().executeTakeFirst();
    },
    upsert: async (month: string, content: string): Promise<void> => {
      const intention = intentionSchema.parse({ month, content });
      await db
        .insertInto("intentions")
        .values(intention)
        .onConflict((oc) =>
          oc
            .column("month")
            .doUpdateSet({ content, updated_at: new Date().toLocaleString("en-CA") }),
        )
        .execute();
    },
  };
}
