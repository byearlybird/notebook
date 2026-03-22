import { TextareaDialog } from "@/components";
import type { Note } from "@/models";
import { noteService } from "@/app";
import { useMutation } from "@/utils/use-mutation";

export function EditNoteDialog({
  open,
  onClose,
  note,
}: {
  open: boolean;
  onClose: () => void;
  note: Pick<Note, "id" | "content">;
}) {
  const mutation = useMutation();

  return (
    <TextareaDialog
      open={open}
      onClose={onClose}
      onSave={(content) => mutation(() => noteService.update(note.id, { content }))}
      title="Edit note"
      placeholder="What's on your mind?"
      initialContent={note.content}
    />
  );
}
