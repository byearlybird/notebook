import type { Database } from "@/db/schema";
import type { Label } from "@/models";
import type { Kysely } from "kysely";

export function createLabelService(db: Kysely<Database>) {
  return {
    async getAll(): Promise<Label[]> {
      return db.selectFrom("labels").select(["id", "name"]).orderBy("name", "asc").execute();
    },
    async create(name: string): Promise<Label> {
      const label = { id: crypto.randomUUID(), name };
      await db.insertInto("labels").values(label).execute();
      return label;
    },
    async update(id: string, name: string): Promise<void> {
      await db.updateTable("labels").set({ name }).where("id", "=", id).execute();
    },
    async delete(id: string): Promise<void> {
      await db.transaction().execute(async (trx) => {
        await trx.updateTable("entries").set({ labelId: null }).where("labelId", "=", id).execute();
        await trx.deleteFrom("labels").where("id", "=", id).execute();
      });
    },
  };
}
