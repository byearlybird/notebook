import { TextareaDialog } from "@/components";
import type { Task } from "@/db";
import { useUpdateTask } from "./use-tasks";

export function EditTaskDialog({
  open,
  onClose,
  task,
}: {
  open: boolean;
  onClose: () => void;
  task: Pick<Task, "id" | "content">;
}) {
  const updateTask = useUpdateTask();

  return (
    <TextareaDialog
      open={open}
      onClose={onClose}
      onSave={(content) => updateTask(task.id, { content })}
      title="Edit task"
      placeholder="What needs to be done?"
      initialContent={task.content}
    />
  );
}
