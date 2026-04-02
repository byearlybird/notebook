import { extractPlainText } from "@/utils/extract-plain-text";
import type { Migration } from "kysely";

export const Migration20260401EntrySearchMeta: Migration = {
  async up(db) {
    await db.schema
      .createTable("entrySearchMeta")
      .addColumn("entryId", "text", (col) => col.primaryKey().notNull())
      .addColumn("plainText", "text", (col) => col.notNull())
      .execute();

    const entries = await db.selectFrom("entries").select(["id", "content"]).execute();
    const rows = entries.flatMap((entry) => {
      if (!entry.content) return [];
      return [{ entryId: entry.id, plainText: extractPlainText(entry.content) }];
    });
    if (rows.length > 0) {
      await db.insertInto("entrySearchMeta").values(rows).execute();
    }
  },
  async down(db) {
    await db.schema.dropTable("entrySearchMeta").execute();
  },
};
