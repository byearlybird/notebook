import { db } from "@/db/client";
import { type Note, type NewNote, noteSchema } from "@/db/schema";

export const notesRepo = {
  async findAll(): Promise<Note[]> {
    return await db
      .selectFrom("notes")
      .selectAll()
      .where("is_deleted", "=", 0)
      .orderBy("created_at", "desc")
      .execute();
  },

  async findByDate(date: string): Promise<Note[]> {
    return await db
      .selectFrom("notes")
      .selectAll()
      .where("is_deleted", "=", 0)
      .where("date", "=", date)
      .orderBy("created_at", "desc")
      .execute();
  },

  async findById(id: string): Promise<Note | undefined> {
    return await db
      .selectFrom("notes")
      .selectAll()
      .where("id", "=", id)
      .where("is_deleted", "=", 0)
      .executeTakeFirst();
  },

  async create(note: NewNote): Promise<Note> {
    const insert: Note = noteSchema.parse(note);
    await db.insertInto("notes").values(insert).execute();
    return insert;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note | undefined> {
    await db
      .updateTable("notes")
      .set({ ...updates, updated_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();

    return this.findById(id);
  },

  async delete(id: string): Promise<void> {
    await db
      .updateTable("notes")
      .set({ is_deleted: 1, updated_at: new Date().toISOString() })
      .where("id", "=", id)
      .execute();
  },
};
