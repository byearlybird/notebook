import { Checkbox } from "@base-ui/react/checkbox";
import { Field } from "@base-ui/react/field";
import type { Task } from "@/models";
import { CheckIcon } from "@phosphor-icons/react";
import { cx } from "cva";

export function TaskItem({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: string, status: Task["status"]) => void;
}) {
  const isComplete = task.status === "complete";

  const handleChange = (checked: boolean) => {
    onStatusChange(task.id, checked ? "complete" : "incomplete");
  };

  return (
    <Field.Root>
      <Field.Label
        className={cx(
          "flex items-center gap-3",
          isComplete ? "text-cloud-medium line-through" : "text-ivory-light",
        )}
      >
        <Checkbox.Root
          checked={isComplete}
          onCheckedChange={handleChange}
          className="group flex size-5 shrink-0 items-center justify-center rounded-full border border-cloud-dark transition-all hover:border-cloud-light data-[checked]:border-cloud-light"
        >
          <Checkbox.Indicator>
            <CheckIcon className="size-3" weight="bold" />
          </Checkbox.Indicator>
        </Checkbox.Root>
        {task.content}
      </Field.Label>
    </Field.Root>
  );
}
