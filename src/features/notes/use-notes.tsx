import { noteService } from "@/app";
import { useRouter } from "@tanstack/react-router";

export function useCreateNote() {
  const router = useRouter();

  return async (note: { content: string }) => {
    await noteService.create(note.content);
    await router.invalidate();
  };
}

export function useUpdateNote() {
  const router = useRouter();

  return async (id: string, { content }: { content: string }) => {
    await noteService.update(id, { content });
    await router.invalidate();
  };
}
