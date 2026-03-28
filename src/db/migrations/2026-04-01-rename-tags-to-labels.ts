import type { Migration } from "kysely";

export const Migration20260401RenameTagsToLabels: Migration = {
  async up(db) {
    await db.schema.alterTable("tags").renameTo("labels").execute();
    await db.schema.alterTable("entries").renameColumn("tagId", "labelId").execute();
  },
  async down(db) {
    await db.schema.alterTable("labels").renameTo("tags").execute();
    await db.schema.alterTable("entries").renameColumn("labelId", "tagId").execute();
  },
};
