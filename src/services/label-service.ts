import { db } from "@/db/client";

export const labelsService = {
  async createLabel(name: string) {
    await db
      .insertInto("labels")
      .values({
        id: crypto.randomUUID(),
        name,
      })
      .execute();
  },
};
