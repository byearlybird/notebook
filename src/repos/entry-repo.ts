import type { Database, EntryRow } from "@/db";
import { extractPlainText } from "@/utils/extract-plain-text";
import type { Kysely, Transaction as KyselyTransaction } from "kysely";

type Transaction = KyselyTransaction<Database>;

export type EntryRepo = ReturnType<typeof createEntryRepo>;
export function createEntryRepo(db: Kysely<Database>) {
  return {
    get: (id: string, tx?: Transaction) => {
      const executor = tx ?? db;
      return executor.selectFrom("entries").selectAll().where("id", "=", id).executeTakeFirst();
    },
    transaction: <T>(run: (trx: Transaction) => Promise<T>) => {
      return db.transaction().execute(run);
    },
    getAll: () => {
      return db.selectFrom("entries").selectAll().orderBy("createdAt", "desc").execute();
    },
    getByDate: (date: string) => {
      return db
        .selectFrom("entries")
        .selectAll()
        .where("date", "=", date)
        .orderBy("createdAt", "desc")
        .execute();
    },
    getByMonth: (month: string, tx?: Transaction) => {
      const executor = tx ?? db;
      return executor
        .selectFrom("entries")
        .selectAll()
        .where("date", "like", `${month}%`)
        .orderBy("createdAt", "desc")
        .executeTakeFirst();
    },
    getByStatus: (type: EntryRow["type"], status: string) => {
      return db
        .selectFrom("entries")
        .selectAll()
        .where("type", "=", type)
        .where("status", "=", status)
        .orderBy("updatedAt", "desc")
        .execute();
    },
    getByOriginId: (originId: string, tx?: Transaction) => {
      const executor = tx ?? db;
      return executor
        .selectFrom("entries")
        .selectAll()
        .where("originId", "=", originId)
        .executeTakeFirst();
    },
    searchByContent: (query: string, limit = 10) => {
      return db
        .selectFrom("entries")
        .innerJoin("entrySearchMeta", "entrySearchMeta.entryId", "entries.id")
        .selectAll("entries")
        .where("entrySearchMeta.plainText", "like", `%${query}%`)
        .orderBy("entries.createdAt", "desc")
        .limit(limit)
        .execute();
    },
    create: async (
      entry: Omit<EntryRow, "id" | "createdAt" | "updatedAt">,
      tx?: Transaction,
    ): Promise<string> => {
      const executor = tx ?? db;
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await executor
        .insertInto("entries")
        .values({ ...entry, id, createdAt: now, updatedAt: now })
        .execute();
      await executor
        .insertInto("entrySearchMeta")
        .values({ entryId: id, plainText: extractPlainText(entry.content) })
        .execute();
      return id;
    },
    update: async (
      id: string,
      entry: Partial<Omit<EntryRow, "id" | "updatedAt">>,
      tx?: Transaction,
    ) => {
      const executor = tx ?? db;
      await executor
        .updateTable("entries")
        .set({ ...entry, updatedAt: new Date().toISOString() })
        .where("id", "=", id)
        .execute();
      if (entry.content !== undefined) {
        const plainText = extractPlainText(entry.content);
        await executor
          .insertInto("entrySearchMeta")
          .values({ entryId: id, plainText })
          .onConflict((oc) => oc.column("entryId").doUpdateSet({ plainText }))
          .execute();
      }
    },
    delete: async (id: string, tx?: Transaction) => {
      const executor = tx ?? db;
      await executor.deleteFrom("entrySearchMeta").where("entryId", "=", id).execute();
      await executor.deleteFrom("entries").where("id", "=", id).execute();
    },
  };
}
