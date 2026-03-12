import { CapgoCapacitorDataStorageSqlite } from "@capgo/capacitor-data-storage-sqlite";

export function createStorage({ dbName, tableName }: { dbName: string; tableName: string }) {
  async function init() {
    await CapgoCapacitorDataStorageSqlite.openStore({
      database: dbName,
      table: tableName,
    });
  }

  async function get<T>(key: string): Promise<T | undefined> {
    const result = await CapgoCapacitorDataStorageSqlite.get({ key });
    if (!result.value) return undefined;
    const parsedValue = JSON.parse(result.value);
    return parsedValue as T;
  }

  async function set(key: string, value: unknown) {
    const stringValue = JSON.stringify(value);
    await CapgoCapacitorDataStorageSqlite.set({ key, value: stringValue });
  }

  async function values<T>(keys: string[]): Promise<T[]> {
    const results: T[] = [];

    for (const key of keys) {
      const value = await get<T>(key);
      if (!value) continue;
      results.push(value);
    }

    return results;
  }

  async function keys(): Promise<string[]> {
    const result = await CapgoCapacitorDataStorageSqlite.keys();
    return result.keys;
  }

  async function valuesWithKeyPrefix<T>(pfx: string): Promise<T[]> {
    const result = await CapgoCapacitorDataStorageSqlite.filtervalues({
      filter: `${pfx}%`,
    });

    const values: T[] = [];
    for (const value of result.values) {
      const parsedValue = JSON.parse(value);
      values.push(parsedValue as T);
    }

    return values;
  }

  return { init, get, set, values, keys, valuesWithKeyPrefix };
}
