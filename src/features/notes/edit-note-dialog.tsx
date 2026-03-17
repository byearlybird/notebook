import { TextareaDialog } from "@/components";
import type { Note } from "@/db";
import { useUpdateNote } from "./use-notes";

export function EditNoteDialog({
  open,
  onClose,
  note,
}: {
  open: boolean;
  onClose: () => void;
  note: Pick<Note, "id" | "content">;
}) {
  const updateNote = useUpdateNote();

  return (
    <TextareaDialog
      open={open}
      onClose={onClose}
      onSave={(content) => updateNote(note.id, { content })}
      title="Edit note"
      placeholder="What's on your mind?"
      initialContent={note.content}
    />
  );
}
