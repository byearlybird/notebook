import { api } from "./api";
import { db } from "./db/client";
import { mergeHlc, parseHlc } from "./db/hlc";
import type { DBSchema, SyncableRow } from "./db/schema";
import { encrypt, decrypt } from "./crypto";
import { getDEK, isVaultUnlocked } from "./vault";

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

  const dek = getDEK();
  const payloads = await Promise.all(
    remoteChanges.changes.map(async ({ cyphertext }) => {
      const plaintext = await decrypt(cyphertext, dek);
      return JSON.parse(plaintext) as SyncPayload<SyncableRow>;
    }),
  );

  await db.transaction().execute(async (trx) => {
    let maxRemoteHlc = "";

    for (const payload of payloads) {
      const { tableName, rowId, data } = payload;

      if (data.hlc > maxRemoteHlc) {
        maxRemoteHlc = data.hlc;
      }

      const existing = await trx
        .selectFrom(tableName)
        .selectAll()
        .where("id", "=", rowId)
        .executeTakeFirst();

      if (!existing) {
        await trx.insertInto(tableName).values(data).execute();
        continue;
      }

      // Higher HLC string wins; equal HLC means identical event (idempotent)
      if (existing.hlc >= data.hlc) {
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

    const { hlc_wall: localWall, hlc_count: localCount } = await trx
      .selectFrom("client_state")
      .select(["hlc_wall", "hlc_count"])
      .executeTakeFirstOrThrow();

    let newWall = localWall;
    let newCount = localCount;

    if (maxRemoteHlc !== "") {
      const { wall: remoteWall, count: remoteCount } = parseHlc(maxRemoteHlc);
      ({ wall: newWall, count: newCount } = mergeHlc(
        localWall,
        localCount,
        remoteWall,
        remoteCount,
        Date.now(),
      ));
    }

    await trx
      .updateTable("client_state")
      .set({ last_server_seq: remoteChanges.max_seq, hlc_wall: newWall, hlc_count: newCount })
      .execute();
  });
}

async function pushChanges() {
  const changes = await db.selectFrom("sync_changes").selectAll().execute();
  if (changes.length === 0) {
    return;
  }

  const payloads: string[] = [];
  const pushed: { table_name: keyof DBSchema; row_id: string; hlc: string }[] = [];

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

    pushed.push({ table_name, row_id, hlc: row.hlc });

    const payload: SyncPayload<SyncableRow> = {
      tableName: table_name,
      rowId: row_id,
      data: row,
    };

    const dek = getDEK();
    payloads.push(await encrypt(JSON.stringify(payload), dek));
  }

  await api.pushChanges({
    changes: payloads,
  });

  for (const entry of pushed) {
    await db
      .deleteFrom("sync_changes")
      .where("table_name", "=", entry.table_name)
      .where("row_id", "=", entry.row_id)
      .where("hlc", "=", entry.hlc)
      .execute();
  }
}

export const fullSync = async () => {
  if (!isVaultUnlocked()) return;
  await pullChanges();
  await pushChanges();
};
