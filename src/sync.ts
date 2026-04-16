import { api } from "./api";
import { db } from "./db/client";
import type { DBSchema, SyncableRow } from "./db/schema";

type SyncPayload<T extends SyncableRow> = {
  tableName: keyof DBSchema;
  rowId: string;
  data: T;
};

async function pullChanges() {
  const { last_server_seq } = await db
    .selectFrom("client_state")
    .select("last_server_seq")
    .executeTakeFirstOrThrow();

  const remoteChanges = await api.pullChanges({ since: last_server_seq });

  const payloads = remoteChanges.changes.map(({ cyphertext }) => {
    const payload = JSON.parse(cyphertext) as SyncPayload<SyncableRow>;
    return payload;
  });

  await db.transaction().execute(async (trx) => {
    for (const payload of payloads) {
      const { tableName, rowId, data } = payload;
      const existing = await trx
        .selectFrom(tableName)
        .selectAll()
        .where("id", "=", rowId)
        .executeTakeFirst();

      if (!existing) {
        await trx.insertInto(tableName).values(data).execute();
        continue;
      }

      const existingIsNewer = existing && existing.clock > data.clock;
      const existingIsSameButHigherNodeId =
        existing && existing.clock === data.clock && existing.node_id > data.node_id;

      if (existingIsNewer || existingIsSameButHigherNodeId) {
        continue;
      }

      await trx
        .updateTable(tableName)
        .set({
          ...data,
          id: rowId,
        })
        .where("id", "=", rowId)
        .execute();
    }

    await trx.updateTable("client_state").set({ last_server_seq: remoteChanges.max_seq }).execute();
  });
}

async function pushChanges() {
  const changes = await db.selectFrom("sync_changes").selectAll().execute();
  if (changes.length === 0) {
    return;
  }

  const payloads: string[] = [];

  for (const change of changes) {
    const { table_name, row_id } = change;
    const row = await db
      .selectFrom(table_name)
      .selectAll()
      .where("id", "=", row_id)
      .executeTakeFirst();

    if (!row) {
      continue;
    }

    const payload: SyncPayload<SyncableRow> = {
      tableName: table_name,
      rowId: row_id,
      data: row,
    };

    payloads.push(JSON.stringify(payload));
  }

  await api.pushChanges({
    req_id: crypto.randomUUID(),
    changes: payloads,
  });

  await db
    .deleteFrom("sync_changes")
    .where("sync_changes.table_name", "=", "notes")
    .where((eb) =>
      eb.exists(
        eb
          .selectFrom("notes")
          .select("notes.id")
          .whereRef("notes.id", "=", "sync_changes.row_id")
          .whereRef("notes.clock", "=", "sync_changes.clock"),
      ),
    )
    .execute();
}

export const fullSync = async () => {
  await pullChanges();
  await pushChanges();
};
