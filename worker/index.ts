import { implement } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { ORPCError } from "@orpc/server";
import { appContract } from "./contract";
import { migrateToLatest } from "./migrator";
import { authenticateRequest } from "./auth";
import type { ChangeLog, UserKey } from "./db";

const os = implement(appContract).$context<{ db: D1Database; userId: string }>();

const pushChanges = os.pushChanges.handler(async ({ input, context: { db, userId } }) => {
  const stmt = db.prepare("INSERT INTO changes (user_id, cyphertext) VALUES (?, ?) RETURNING seq");
  const batch = input.changes.map((cyphertext) => stmt.bind(userId, cyphertext));
  const results = await db.batch<Pick<ChangeLog, "seq">>(batch);

  const seqs = results.flatMap((r) => r.results.map((row) => row.seq));
  const maxSeq = seqs[seqs.length - 1] ?? 0;

  return {
    seqs,
    maxSeq,
  };
});

const pullChanges = os.pullChanges.handler(async ({ input, context: { db, userId } }) => {
  const query = input.limit
    ? "SELECT seq, cyphertext FROM changes WHERE seq > ? AND user_id = ? ORDER BY seq LIMIT ?"
    : "SELECT seq, cyphertext FROM changes WHERE seq > ? AND user_id = ? ORDER BY seq";

  const stmt = input.limit
    ? db.prepare(query).bind(input.since, userId, input.limit + 1)
    : db.prepare(query).bind(input.since, userId);

  const { results: changes } = await stmt.all<Pick<ChangeLog, "seq" | "cyphertext">>();

  const hasMore = input.limit != null && changes.length > input.limit;
  if (hasMore) changes.pop();

  const maxSeq = changes.length > 0 ? changes[changes.length - 1].seq : input.since;

  return {
    changes: changes.map((r) => ({ seq: r.seq, cyphertext: r.cyphertext })),
    maxSeq,
    hasMore,
  };
});

const getWrappedKey = os.getWrappedKey.handler(async ({ context: { db, userId } }) => {
  const row = await db
    .prepare("SELECT wrapped_key AS wrappedKey, salt, iv FROM user_keys WHERE user_id = ?")
    .bind(userId)
    .first<Pick<UserKey, "wrappedKey" | "salt" | "iv">>();

  return row ?? null;
});

const setWrappedKey = os.setWrappedKey.handler(
  async ({ input: { wrappedKey, salt, iv }, context: { db, userId } }) => {
    const result = await db
      .prepare(
        "INSERT INTO user_keys (user_id, wrapped_key, salt, iv) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING",
      )
      .bind(userId, wrappedKey, salt, iv)
      .run();

    if (result.meta.changes === 0) {
      throw new ORPCError("CONFLICT", { message: "Vault key already exists for this user" });
    }

    return { success: true };
  },
);

const changeWrappedKey = os.changeWrappedKey.handler(
  async ({ input: { wrappedKey, salt, iv }, context: { db, userId } }) => {
    const result = await db
      .prepare(
        "UPDATE user_keys SET wrapped_key = ?, salt = ?, iv = ?, updated_at = datetime('now') WHERE user_id = ?",
      )
      .bind(wrappedKey, salt, iv, userId)
      .run();

    if (result.meta.changes === 0) {
      throw new ORPCError("NOT_FOUND", { message: "No vault key found for this user" });
    }

    return { success: true };
  },
);

const router = os.router({
  pushChanges,
  pullChanges,
  getWrappedKey,
  setWrappedKey,
  changeWrappedKey,
});

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export default {
  async fetch(request, env): Promise<Response> {
    const db = env.DB;
    console.log("Running migrations...");
    const { error, results } = await migrateToLatest(db);
    for (const r of results) {
      console.log(`Migration "${r.migrationName}": ${r.status}`);
    }
    if (error) {
      console.error("Migration failed:", error);
      return new Response("Migration failed", { status: 500 });
    }
    console.log("Migrations complete.");

    let userId: string;
    try {
      userId = await authenticateRequest(request, env);
    } catch {
      return new Response("Unauthorized", { status: 401 });
    }

    const { matched, response } = await handler.handle(request, {
      prefix: "/api",
      context: { db, userId },
    });

    if (matched) {
      return response;
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
