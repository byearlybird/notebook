import { CapgoCapacitorDataStorageSqlite } from "@capgo/capacitor-data-storage-sqlite";

const DEVICE_ID_KEY = "__deviceId";

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

  async function values<T>(prefix: string): Promise<T[]> {
    const result = await CapgoCapacitorDataStorageSqlite.filtervalues({
      filter: `${prefix}%`,
    });

    const values: T[] = [];
    for (const value of result.values) {
      const parsedValue = JSON.parse(value);
      values.push(parsedValue as T);
    }

    return values;
  }

  async function getDeviceId(): Promise<string> {
    const storedDID = await get<string>(DEVICE_ID_KEY);
    if (!storedDID) {
      const deviceId = crypto.randomUUID();
      await set(DEVICE_ID_KEY, deviceId);
      return deviceId;
    } else {
      return storedDID;
    }
  }

  return {
    init,
    get,
    set,
    values,
    getDeviceId,
  };
}

export type Storage = ReturnType<typeof createStorage>;
