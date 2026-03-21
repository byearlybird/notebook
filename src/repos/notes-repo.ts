import { db } from "@/db/client";
import { type Note } from "@/db/schema";

export const notesRepo = {
  async findAll(): Promise<Note[]> {
    return await db.selectFrom("notes").selectAll().orderBy("created_at", "desc").execute();
  },

  async findByDate(date: string): Promise<Note[]> {
    return await db
      .selectFrom("notes")
      .selectAll()
      .where("date", "=", date)
      .orderBy("created_at", "desc")
      .execute();
  },
};
