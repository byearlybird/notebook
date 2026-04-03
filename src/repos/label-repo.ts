import type { Database, LabelRow } from "@/db";
import type { Kysely, Transaction as KyselyTransaction } from "kysely";

type Transaction = KyselyTransaction<Database>;

export type LabelRepo = ReturnType<typeof createLabelRepo>;
export function createLabelRepo(db: Kysely<Database>) {
  return {
    get(id: string) {
      return db.selectFrom("labels").select(["id", "name"]).where("id", "=", id).executeTakeFirst();
    },
    getAll() {
      return db.selectFrom("labels").select(["id", "name"]).orderBy("name", "asc").execute();
    },
    getByIds(ids: string[]) {
      if (!ids.length) return Promise.resolve([]);
      return db.selectFrom("labels").select(["id", "name"]).where("id", "in", ids).execute();
    },
    create: async (label: Omit<LabelRow, "id">, tx?: Transaction): Promise<string> => {
      const executor = tx ?? db;
      const id = crypto.randomUUID();
      await executor
        .insertInto("labels")
        .values({ ...label, id })
        .execute();
      return id;
    },
    update: async (id: string, label: Partial<Omit<LabelRow, "id">>, tx?: Transaction) => {
      const executor = tx ?? db;
      await executor.updateTable("labels").set(label).where("id", "=", id).execute();
    },
    delete: async (id: string, tx?: Transaction) => {
      const run = async (executor: Kysely<Database> | Transaction) => {
        await executor
          .updateTable("entries")
          .set({ labelId: null })
          .where("labelId", "=", id)
          .execute();
        await executor.deleteFrom("labels").where("id", "=", id).execute();
      };
      if (tx) {
        await run(tx);
      } else {
        await db.transaction().execute(run);
      }
    },
  };
}
