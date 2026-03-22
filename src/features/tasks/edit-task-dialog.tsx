import { TextareaDialog } from "@/components";
import type { Task } from "@/models";
import { taskService } from "@/app";
import { useMutation } from "@/utils/use-mutation";

export function EditTaskDialog({
  open,
  onClose,
  task,
}: {
  open: boolean;
  onClose: () => void;
  task: Pick<Task, "id" | "content">;
}) {
  const mutation = useMutation();

  return (
    <TextareaDialog
      open={open}
      onClose={onClose}
      onSave={(content) => mutation(() => taskService.update(task.id, { content }))}
      title="Edit task"
      placeholder="What needs to be done?"
      initialContent={task.content}
    />
  );
}
