import type { Note } from "@/db";
import { notesRepo } from "@/repos/notes-repo";

export async function createNote(content: string): Promise<Note> {
  return notesRepo.create({
    content,
    scope: "daily",
    category: "log",
  });
}

export async function updateNote(
  id: string,
  { content }: { content: string },
): Promise<Note | undefined> {
  return notesRepo.update(id, { content });
}

export async function deleteNote(id: string): Promise<void> {
  return notesRepo.delete(id);
}

export async function getNoteById(id: string): Promise<Note | undefined> {
  return notesRepo.findById(id);
}
