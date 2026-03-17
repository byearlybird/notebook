import * as notesService from "@/services/notes-service";
import { useRouter } from "@tanstack/react-router";

export function useCreateNote() {
  const router = useRouter();

  return async (note: { content: string }) => {
    await notesService.createNote(note.content);
    await router.invalidate();
  };
}

export function useUpdateNote() {
  const router = useRouter();

  return async (id: string, { content }: { content: string }) => {
    await notesService.updateNote(id, { content });
    await router.invalidate();
  };
}
