import type z from "zod";
import { storage } from ".";
import { noteSchema, taskSchema } from "./schema";
import * as crdt from "@byearlybird/crdt";

export const notesRepo = createRepo("note", noteSchema, "id");
export const tasksRepo = createRepo("task", taskSchema, "id");

function createKeys(key: string) {
  return {
    all: `${key}:`,
    byId: (id: string) => `${key}:${id}`,
    stamp: `__stamp__:${key}`,
    hash: `__hash__:${key}`,
    device: `__device__:${key}`,
  };
}

function createRepo<T extends Record<string, unknown>>(
  key: string,
  schema: z.ZodSchema<T>,
  idKey: keyof T,
) {
  const keys = createKeys(key);
  let clock: crdt.Clock | undefined;
  let deviceId: string | undefined;

  async function getDeviceId() {
    if (!deviceId) {
      deviceId = await storage.get<string>(keys.device);
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        await storage.set(keys.device, deviceId);
      }
    }

    return deviceId;
  }

  async function getLastStamp() {
    const lastStamp = await storage.get<crdt.Stamp>(keys.stamp);

    return lastStamp;
  }

  async function getClock() {
    if (!clock) {
      const [deviceId, lastStamp] = await Promise.all([getDeviceId(), getLastStamp()]);
      clock = crdt.createClock(deviceId, lastStamp);
    }

    return clock;
  }

  async function mutate<T>(fn: (clock: crdt.Clock) => Promise<T>): Promise<T> {
    const clock = await getClock();
    const result = await fn(clock);

    const allDocs = await storage.valuesWithKeyPrefix<crdt.Doc>(keys.all);
    const hash = crdt.reduceItemHashes(allDocs);
    await storage.set(keys.hash, hash);
    await storage.set(keys.stamp, clock.latestStamp);

    return result;
  }

  return {
    async findAll(): Promise<T[]> {
      const docs = await storage.valuesWithKeyPrefix<crdt.Doc>(keys.all);

      return docs.map((item) => crdt.makePOJO(item) as T);
    },

    async findById(id: string): Promise<T | undefined> {
      const doc = await storage.get<crdt.Doc>(keys.byId(id));
      if (!doc) return undefined;

      return crdt.makePOJO(doc) as T;
    },

    async create(item: z.input<typeof schema>): Promise<T> {
      return mutate(async (clock) => {
        const newPOJO = schema.parse(item);
        const data = crdt.makeDataFromPOJO(newPOJO, clock.tick());
        const doc = crdt.makeDoc(data);
        await storage.set(keys.byId(newPOJO[idKey] as string), doc);

        return newPOJO;
      });
    },

    async update(id: string, updates: Partial<T>): Promise<T | undefined> {
      return mutate(async (clock) => {
        const doc = await storage.get<crdt.Doc>(keys.byId(id));
        if (!doc) return undefined;

        const existingPOJO = crdt.makePOJO(doc);
        const updatedPOJO = schema.parse({ ...existingPOJO, ...updates }); // validate updates
        const data = crdt.makeDataFromPOJO(updates, clock.tick());
        crdt.patchDoc(doc, data);
        await storage.set(keys.byId(id), doc);

        return updatedPOJO;
      });
    },

    async delete(_id: string): Promise<void> {
      throw new Error("Not implemented");
    },
  };
}
