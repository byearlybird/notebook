import { noteService } from "@/app";
import { notFound } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import type { Note } from "@/models";

export const noteQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["entries", "notes", id],
    queryFn: async (): Promise<Note> => {
      const note = await noteService.get(id);
      if (!note) throw notFound();
      return note;
    },
  });

export const pinnedNotesQueryOptions = () =>
  queryOptions({
    queryKey: ["entries", "notes", "pinned"],
    queryFn: () => noteService.getPinned(),
  });
