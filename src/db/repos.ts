import type z from "zod";
import type { Storage } from "./storage";
import * as crdt from "@byearlybird/crdt";
import type { Clock } from "./clock";

function createKeys(key: string) {
  return {
    all: `${key}`,
    id: (id: string) => `${key}:${id}`,
    repoHash: `__hash:${key}`,
  };
}

export function createRepo<T extends Record<string, unknown>>(
  storage: Storage,
  clock: Clock,
  key: string,
  schema: z.ZodSchema<T>,
  idKey: keyof T,
) {
  const keys = createKeys(key);

  async function mutate<T>(fn: (timestamp: crdt.Stamp) => Promise<T>): Promise<T> {
    const timestamp = await clock.tick();
    const result = await fn(timestamp);

    const allDocs = await storage.values<crdt.Doc>(keys.all);
    const hash = crdt.reduceItemHashes(allDocs);
    await storage.set(keys.repoHash, hash);

    return result;
  }

  return {
    async findAll(): Promise<T[]> {
      const docs = await storage.values<crdt.Doc>(keys.all);

      return docs.map((item) => crdt.makePOJO(item) as T);
    },

    async findById(id: string): Promise<T | undefined> {
      const doc = await storage.get<crdt.Doc>(keys.id(id));
      if (!doc) return undefined;

      return crdt.makePOJO(doc) as T;
    },

    async create(item: z.input<typeof schema>): Promise<T> {
      return mutate(async (timestamp) => {
        const newPOJO = schema.parse(item);
        const id = newPOJO[idKey] as string;
        const data = crdt.makeDataFromPOJO(newPOJO, timestamp);
        const doc = crdt.makeDoc(data);

        await storage.set(keys.id(id), doc);

        return newPOJO;
      });
    },

    async update(id: string, updates: Partial<T>): Promise<T | undefined> {
      return mutate(async (timestamp) => {
        const doc = await storage.get<crdt.Doc>(keys.id(id));

        if (!doc) return undefined;

        const currentItem = crdt.makePOJO(doc);
        const updatedItem = schema.parse({ ...currentItem, ...updates }); // validate updates
        const data = crdt.makeDataFromPOJO(updates, timestamp);

        crdt.patchDoc(doc, data);
        await storage.set(keys.id(id), doc);

        return updatedItem;
      });
    },

    async delete(_id: string): Promise<void> {
      throw new Error("Not implemented");
    },
  };
}
