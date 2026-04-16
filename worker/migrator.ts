import { migrations } from "./migrations/";

export const migrateToLatest = async (db: D1Database) => {
  await db.exec(
    "CREATE TABLE IF NOT EXISTS _migrations (name TEXT NOT NULL PRIMARY KEY, timestamp TEXT NOT NULL DEFAULT (datetime('now')))",
  );

  const applied = await db
    .prepare("SELECT name FROM _migrations ORDER BY name")
    .all<{ name: string }>();
  const appliedSet = new Set(applied.results.map((r) => r.name));
  const pending = Object.entries(migrations)
    .filter(([name]) => !appliedSet.has(name))
    .sort(([a], [b]) => a.localeCompare(b));

  const results: { migrationName: string; status: string }[] = [];

  for (const [name, migration] of pending) {
    try {
      await migration.up(db);
      await db.prepare("INSERT INTO _migrations (name) VALUES (?)").bind(name).run();
      results.push({ migrationName: name, status: "Success" });
    } catch (err) {
      return { results, error: err };
    }
  }

  return { results, error: undefined };
};
