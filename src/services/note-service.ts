import { toNote, toNotes, type Note } from "@/models";
import type { EntryRepo } from "@/repos/entry-repo";
import type { LabelRepo } from "@/repos/label-repo";

export function createNoteService(entryRepo: EntryRepo, labelRepo: LabelRepo) {
  return {
    create: async (content: string, labelId?: string | null) => {
      await entryRepo.create({
        date: new Date().toLocaleDateString("en-CA"),
        content,
        type: "note",
        status: null,
        labelId: labelId ?? null,
        originId: null,
      });
    },
    get: async (id: string): Promise<Note | undefined> => {
      const result = await entryRepo.get(id);
      if (!result) return undefined;
      const label = result.labelId ? ((await labelRepo.get(result.labelId)) ?? null) : null;
      return toNote(result, label);
    },
    update: async (id: string, { content }: { content: string }) => {
      await entryRepo.update(id, { content });
    },
    delete: async (id: string) => {
      await entryRepo.delete(id);
    },
    togglePin: async (id: string, pinned: boolean) => {
      await entryRepo.update(id, { status: pinned ? "pinned" : null });
    },
    getPinned: async (): Promise<Note[]> => {
      const results = await entryRepo.getByStatus("note", "pinned");
      const ids = results.map((r) => r.labelId).filter((id): id is string => id != null);
      return toNotes(results, await labelRepo.getByIds(ids));
    },
    setLabel: async (noteId: string, labelId: string | null) => {
      await entryRepo.update(noteId, { labelId });
    },
  };
}
