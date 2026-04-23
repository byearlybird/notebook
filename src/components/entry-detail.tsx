import { Drawer } from "@base-ui/react/drawer";
import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  CheckSquareIcon,
  PushPinIcon,
  PushPinSimpleIcon,
  SquareIcon,
  XIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import type { DBSchema, TaskTable } from "@/db/schema";
import { formatDateTime } from "@/utils/dates";
import { notesService } from "@/services/note-service";
import { taskService } from "@/services/task-service";
import { useDBQuery } from "@/hooks/use-db-query";
import { Button } from "./button";

type TimelineView = DBSchema["timeline"];

type EntryDetailProps = {
  id: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EntryDetail({ id, open, onOpenChange }: EntryDetailProps) {
  const results = useDBQuery((db) =>
    db
      .selectFrom("timeline")
      .selectAll()
      .where("id", "=", id ?? ""),
  );
  const entry = results?.[0] ?? null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Backdrop className="fixed inset-0 bg-black/70 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-300" />
        <Drawer.Viewport className="fixed inset-0 flex items-stretch justify-end">
          <Drawer.Popup className="relative w-full sm:max-w-2/3 lg:max-w-1/2 h-full bg-neutral-800 outline outline-neutral-700 transition-transform duration-300 data-starting-style:translate-x-full data-ending-style:translate-x-full">
            <Drawer.Content className="p-6 h-full flex flex-col">
              {entry && (
                <>
                  <Drawer.Title className="mb-2.5 flex gap-3 justify-between">
                    <span className="text-lg font-semibold font-serif my-auto">
                      {formatDateTime(entry.created_at)}
                    </span>
                    <div className="flex gap-2">
                      <EntryActions entry={entry} />
                      <Drawer.Close
                        render={(props) => <Button {...props} variant="outline" radius="inner" />}
                      >
                        <XIcon />
                      </Drawer.Close>
                    </div>
                  </Drawer.Title>

                  {entry.type === "task" && entry.status && (
                    <TaskStatusRow status={entry.status} />
                  )}

                  <p className="text-neutral-200">{entry.content}</p>
                </>
              )}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function TaskStatusRow({ status }: { status: TaskTable["status"] }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <div className="flex gap-2 items-center text-sm text-neutral-400 mb-4">
      {status === "complete" ? (
        <CheckSquareIcon className="size-4.5 text-yellow-200" />
      ) : status === "cancelled" ? (
        <XSquareIcon className="size-4.5 text-neutral-400" />
      ) : (
        <SquareIcon className="size-4.5" />
      )}
      <span>{label}</span>
    </div>
  );
}

function EntryActions({ entry }: { entry: TimelineView }) {
  if (entry.type === "note") {
    const isPinned = entry.pinned === 1;
    return (
      <Button radius="inner" variant="secondary" onClick={() => notesService.togglePin(entry.id)}>
        {isPinned ? <PushPinIcon /> : <PushPinSimpleIcon />}
        {isPinned ? "Pinned" : "Pin"}
      </Button>
    );
  }

  const isOpen = entry.status === "incomplete" || entry.status === "deferred";
  if (isOpen) {
    return (
      <>
        <Button
          radius="inner"
          variant="secondary"
          onClick={() => taskService.setStatus(entry.id, "complete")}
        >
          <CheckIcon />
          Complete
        </Button>
        <Button
          radius="inner"
          variant="secondary"
          onClick={() => taskService.setStatus(entry.id, "cancelled")}
        >
          <XIcon />
          Cancel
        </Button>
      </>
    );
  }

  return (
    <Button
      radius="inner"
      variant="secondary"
      onClick={() => taskService.setStatus(entry.id, "incomplete")}
    >
      <ArrowCounterClockwiseIcon />
      Reopen
    </Button>
  );
}
