import { implement } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { onError } from "@orpc/server";
import { appContract } from "./contract";
import { migrateToLatest } from "./migrator";
import type { ChangeLog } from "./db";

const os = implement(appContract).$context<{ db: D1Database }>();

const pushChanges = os.pushChanges.handler(async ({ input, context: { db } }) => {
  const stmt = db.prepare("INSERT INTO changes (user_id, cyphertext) VALUES (?, ?) RETURNING seq");
  const batch = input.changes.map((cyphertext) => stmt.bind("default_user", cyphertext));
  const results = await db.batch<Pick<ChangeLog, "seq">>(batch);

  const seqs = results.flatMap((r) => r.results.map((row) => row.seq));
  const max_seq = seqs[seqs.length - 1] ?? 0;

  return {
    push_id: crypto.randomUUID(),
    seqs,
    max_seq,
  };
});

const pullChanges = os.pullChanges.handler(async ({ input, context: { db } }) => {
  const { results: changes } = await db
    .prepare("SELECT seq, cyphertext FROM changes WHERE seq > ? ORDER BY seq")
    .bind(input.since)
    .all<Pick<ChangeLog, "seq" | "cyphertext">>();

  const max_seq = changes.length > 0 ? changes[changes.length - 1].seq : input.since;

  return {
    changes: changes.map((r) => ({ seq: r.seq, cyphertext: r.cyphertext })),
    max_seq,
    has_more: false,
  };
});

const router = os.router({
  pushChanges,
  pullChanges,
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
    if (results) {
      for (const r of results) {
        console.log(`Migration "${r.migrationName}": ${r.status}`);
      }
    }
    if (error) {
      console.error("Migration failed:", error);
    }
    console.log("Migrations complete.");
    const { matched, response } = await handler.handle(request, {
      prefix: "/api",
      context: { db },
    });

    if (matched) {
      return response;
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
