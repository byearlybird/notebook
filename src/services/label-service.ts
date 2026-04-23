import { db } from "@/db/client";

export const labelsService = {
  async createLabel(name: string) {
    await db
      .insertInto("labels")
      .values({
        id: crypto.randomUUID(),
        name,
      })
      .execute();
  },
  async setEntryLabel(type: "note" | "task", id: string, label: string | null) {
    const table = type === "note" ? "notes" : "tasks";
    await db.updateTable(table).set({ label }).where("id", "=", id).execute();
  },
  async renameLabel(id: string, name: string) {
    await db.updateTable("labels").set({ name }).where("id", "=", id).execute();
  },
  async deleteLabel(id: string) {
    await db.transaction().execute(async (trx) => {
      await trx.updateTable("notes").set({ label: null }).where("label", "=", id).execute();
      await trx.updateTable("tasks").set({ label: null }).where("label", "=", id).execute();
      await trx.updateTable("labels").set({ is_deleted: 1 }).where("id", "=", id).execute();
    });
  },
};
