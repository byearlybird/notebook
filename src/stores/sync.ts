import { db } from "@/db/client";
import { mergeHlc, parseHlc } from "@/db/hlc";
import type { DBSchema, SyncableRow } from "@/db/schema";
import { encrypt, decrypt } from "@/crypto";
import type { Selectable } from "kysely";

export type ChangeTransport = {
  pullChanges(since: number): Promise<{ changes: { cyphertext: string }[]; maxSeq: number }>;
  pushChanges(changes: string[]): Promise<void>;
};

type MutatePayload<T extends Selectable<SyncableRow>> = {
  type: "mutate";
  tableName: keyof DBSchema;
  rowId: string;
  data: T;
};

type TombstonePayload = {
  type: "tombstone";
  tableName: keyof DBSchema;
  rowId: string;
  hlc: string;
};

type SyncPayload<T extends Selectable<SyncableRow>> = MutatePayload<T> | TombstonePayload;

async function pullChanges(dek: CryptoKey, transport: ChangeTransport) {
  const { last_server_seq } = await db
    .selectFrom("client_state")
    .select("last_server_seq")
    .executeTakeFirstOrThrow();

  const remoteChanges = await transport.pullChanges(last_server_seq);

  const payloads = await Promise.all(
    remoteChanges.changes.map(async ({ cyphertext }) => {
      const plaintext = await decrypt(cyphertext, dek);
      return JSON.parse(plaintext) as SyncPayload<Selectable<SyncableRow>>;
    }),
  );

  await db.transaction().execute(async (trx) => {
    // Suppress the BEFORE DELETE tombstone trigger while we apply remote deletes.
    await trx.updateTable("client_state").set({ is_applying_remote: 1 }).execute();

    let maxRemoteHlc = "";

    for (const payload of payloads) {
      const incomingHlc = payload.type === "mutate" ? String(payload.data.hlc) : payload.hlc;
      if (incomingHlc > maxRemoteHlc) maxRemoteHlc = incomingHlc;

      if (payload.type === "tombstone") {
        await trx
          .insertInto("tombstone_table")
          .values({ row_id: payload.rowId, hlc: payload.hlc })
          .onConflict((oc) => oc.column("row_id").doNothing())
          .execute();

        await trx.deleteFrom(payload.tableName).where("id", "=", payload.rowId).execute();
        continue;
      }

      const tombstoned = await trx
        .selectFrom("tombstone_table")
        .select("row_id")
        .where("row_id", "=", payload.rowId)
        .executeTakeFirst();

      if (tombstoned) continue;

      const existing = await trx
        .selectFrom(payload.tableName)
        .selectAll()
        .where("id", "=", payload.rowId)
        .executeTakeFirst();

      if (!existing) {
        await trx.insertInto(payload.tableName).values(payload.data).execute();
        continue;
      }

      if (String(existing.hlc) >= String(payload.data.hlc)) continue;

      await trx
        .updateTable(payload.tableName)
        .set({
          ...payload.data,
          hlc: String(payload.data.hlc),
          id: payload.rowId,
        })
        .where("id", "=", payload.rowId)
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
      .set({
        last_server_seq: remoteChanges.maxSeq,
        hlc_wall: newWall,
        hlc_count: newCount,
        is_applying_remote: 0,
      })
      .execute();
  });
}

async function pushChanges(dek: CryptoKey, transport: ChangeTransport) {
  const changes = await db.selectFrom("sync_changes").selectAll().execute();
  if (changes.length === 0) {
    return;
  }

  const payloads: string[] = [];
  const pushed: { table_name: keyof DBSchema; row_id: string; hlc: string }[] = [];

  for (const change of changes) {
    const { table_name, row_id, hlc, operation } = change;

    let payload: SyncPayload<Selectable<SyncableRow>>;

    if (operation === "tombstone") {
      payload = { type: "tombstone", tableName: table_name, rowId: row_id, hlc };
    } else {
      const row = await db
        .selectFrom(table_name)
        .selectAll()
        .where("id", "=", row_id)
        .executeTakeFirst();

      if (!row) continue;

      payload = { type: "mutate", tableName: table_name, rowId: row_id, data: row };
    }

    pushed.push({ table_name, row_id, hlc });
    payloads.push(await encrypt(JSON.stringify(payload), dek));
  }

  await transport.pushChanges(payloads);

  for (const entry of pushed) {
    await db
      .deleteFrom("sync_changes")
      .where("table_name", "=", entry.table_name)
      .where("row_id", "=", entry.row_id)
      .where("hlc", "=", entry.hlc)
      .execute();
  }
}

export async function fullSync(dek: CryptoKey | null, transport: ChangeTransport): Promise<void> {
  if (!dek) return;
  await pullChanges(dek, transport);
  await pushChanges(dek, transport);
}
