import type { ReactElement } from "react";
import type { DBSchema } from "@/db/schema";
import { usePriorTasks } from "@/hooks/use-prior-tasks";
import { formatDate } from "@/utils/dates";
import { ArrowSquareRightIcon, CheckSquareIcon, XSquareIcon } from "@phosphor-icons/react";
import { taskService } from "@/services/task-service";
import { SidebarPopover } from "@/components/shared/sidebar-popover";

type Task = DBSchema["tasks"];

export function RolloverTasksPreview({ children }: { children: ReactElement }) {
  const tasks = usePriorTasks();

  return (
    <SidebarPopover trigger={children}>
      {tasks && tasks.length > 0 ? (
        tasks.map((task) => <RolloverTaskRow key={task.id} task={task} />)
      ) : (
        <div className="px-2 py-3 text-sm text-foreground-muted">No prior tasks</div>
      )}
    </SidebarPopover>
  );
}

function RolloverTaskRow({ task }: { task: Task }) {
  return (
    <div className="w-full rounded-lg px-2 py-2">
      <div className="text-xs text-foreground-muted mb-0.5">{formatDate(task.date)}</div>
      <div className="flex items-center gap-1">
        <div className="text-sm text-foreground line-clamp-1 flex-1 min-w-0">{task.content}</div>
        <div className="flex items-center gap-0.5 shrink-0">
          <ActionButton onClick={() => taskService.setStatus(task.id, "complete")} label="Complete">
            <CheckSquareIcon />
          </ActionButton>
          <ActionButton onClick={() => taskService.setStatus(task.id, "cancelled")} label="Cancel">
            <XSquareIcon />
          </ActionButton>
          <ActionButton onClick={() => taskService.rolloverTask(task.id)} label="Rollover">
            <ArrowSquareRightIcon />
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  label,
}: {
  children: ReactElement;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-foreground/10 transition-colors [&>svg]:size-4"
    >
      {children}
    </button>
  );
}
