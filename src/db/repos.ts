import type z from "zod";
import { storage } from ".";
import { noteSchema, taskSchema } from "./schema";

export const notesRepo = createRepo("note", noteSchema, "id");
export const tasksRepo = createRepo("task", taskSchema, "id");

function createRepo<T>(key: string, schema: z.ZodSchema<T>, idKey: keyof T) {
  const prefix = `${key}:`;
  return {
    async findAll(): Promise<T[]> {
      return storage.valuesWithKeyPrefix<T>(prefix);
    },

    async findById(id: string): Promise<T | undefined> {
      return storage.get<T>(`${prefix}${id}`);
    },
    async create(item: z.input<typeof schema>): Promise<T> {
      const newItem = schema.parse(item);
      await storage.set(`${prefix}${newItem[idKey]}`, newItem);
      return newItem;
    },

    async update(id: string, updates: Partial<T>): Promise<T | undefined> {
      const item = await storage.get<T>(`${prefix}${id}`);
      if (!item) return undefined;
      const updatedItem = schema.parse({ ...item, ...updates });
      await storage.set(`${prefix}${id}`, updatedItem);
      return updatedItem;
    },

    async delete(_id: string): Promise<void> {
      throw new Error("Not implemented");
    },
  };
}
