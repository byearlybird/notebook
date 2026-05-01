import { useState } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { MenuRoot, Menu, MenuTrigger, MenuItem } from "@/components/shared/menu";
import { PromptDialog } from "@/components/shared/prompt-dialog";
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareRightIcon,
  CheckIcon,
  CheckSquareIcon,
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  PushPinSimpleIcon,
  SquareIcon,
  XIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import { useStore } from "@nanostores/react";
import type { DBSchema, TaskTable } from "@/db/schema";
import { formatLongDate, formatTime } from "@/utils/dates";
import { notesService } from "@/services/note-service";
import { taskService } from "@/services/task-service";
import { useDBQuery } from "@/hooks/use-db-query";
import { useEntry } from "@/hooks/use-entry";
import { useTodayDate } from "@/hooks/use-today-date";
import { labelsService } from "@/services/label-service";
import { $selectedEntryId, closeEntryDetail } from "@/stores/entry-detail";
import { Button } from "./shared/button";
import { LabelPicker } from "./label-picker";

type TimelineView = DBSchema["timeline"];

export function EntryDetail() {
  const id = useStore($selectedEntryId);
  const [editEntry, setEditEntry] = useState<TimelineView | null>(null);

  return (
    <>
      <Drawer.Root
        open={id !== null}
        swipeDirection="right"
        onOpenChange={(open) => {
          if (!open) closeEntryDetail();
        }}
      >
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 bg-backdrop data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-300" />
          <Drawer.Viewport className="fixed top-safe-top bottom-safe-bottom left-safe-left right-safe-right flex items-stretch justify-end p-2">
            <Drawer.Popup className="relative w-full rounded-2xl md:max-w-2/3 lg:max-w-1/2 h-full bg-surface outline outline-border transition-transform duration-300 data-starting-style:translate-x-full data-ending-style:translate-x-full">
              <Drawer.Content className="h-full flex flex-col">
                {id && <EntryDetailContent id={id} onEditClick={setEditEntry} />}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
      <PromptDialog
        open={editEntry !== null}
        onOpenChange={(open) => {
          if (!open) setEditEntry(null);
        }}
        multiline
        initialValue={editEntry?.content ?? ""}
        onSave={(v) => {
          if (!editEntry) return;
          if (editEntry.type === "note") notesService.updateContent(editEntry.id, v);
          else taskService.updateContent(editEntry.id, v);
        }}
      />
    </>
  );
}

function EntryDetailContent({
  id,
  onEditClick,
}: {
  id: string;
  onEditClick: (entry: TimelineView) => void;
}) {
  const results = useDBQuery((db) => db.selectFrom("timeline").selectAll().where("id", "=", id));
  const entry = results?.[0] ?? null;

  if (!entry) return null;

  return (
    <>
      <div className="px-4 py-3 flex items-center justify-between border-b border-dashed border-border">
        <Drawer.Title className="text-lg font-bold">
          {formatLongDate(entry.created_at)}
          <span className="ms-2 text-sm font-normal text-foreground-muted">
            {formatTime(entry.created_at)}
          </span>
        </Drawer.Title>
        <div className="flex gap-2">
          <MenuRoot>
            <MenuTrigger variant="outline">
              <DotsThreeVerticalIcon />
            </MenuTrigger>
            <Menu>
              <MenuItem
                variant="destructive"
                onClick={() => {
                  if (entry.type === "note") notesService.delete(entry.id);
                  else taskService.delete(entry.id);
                  closeEntryDetail();
                }}
              >
                Delete
              </MenuItem>
            </Menu>
          </MenuRoot>
          <Drawer.Close render={(props) => <Button {...props} variant="outline" radius="inner" />}>
            <XIcon />
          </Drawer.Close>
        </div>
      </div>

      <div className="relative flex-1 min-h-0 flex flex-col group/content">
        <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
          {entry.type === "task" && entry.status && <TaskStatusRow status={entry.status} />}
          <button
            type="button"
            onClick={() => onEditClick(entry)}
            className="text-left text-foreground font-serif whitespace-pre-wrap rounded-lg -mx-2 px-2 py-1 hover:bg-surface-tint transition-colors"
          >
            {entry.content}
          </button>
        </div>
        <button
          type="button"
          onClick={() => onEditClick(entry)}
          className="absolute top-2 right-3 rounded-md bg-surface outline outline-border p-1 opacity-0 group-hover/content:opacity-100 hover:bg-surface-tint transition-opacity"
        >
          <PencilSimpleIcon className="size-4 text-foreground-muted" />
        </button>
      </div>

      <div className="border-t border-dashed border-border p-4 flex items-center justify-between">
        <EntryLabelPicker entry={entry} />
        <div className="flex gap-2">
          <EntryActions entry={entry} />
        </div>
      </div>
    </>
  );
}

function EntryLabelPicker({ entry }: { entry: TimelineView }) {
  const row = useEntry(entry.type, entry.id);

  return (
    <LabelPicker
      value={row?.label ?? null}
      onValueChange={(id) => labelsService.setEntryLabel(entry.type, entry.id, id)}
    />
  );
}

function TaskStatusRow({ status }: { status: TaskTable["status"] }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <div className="flex gap-2 items-center text-sm text-foreground-muted mb-4">
      {status === "complete" ? (
        <CheckSquareIcon className="size-4.5 text-accent" />
      ) : status === "cancelled" ? (
        <XSquareIcon className="size-4.5 text-foreground-muted" />
      ) : status === "deferred" ? (
        <ArrowSquareRightIcon className="size-4.5 text-foreground-muted" />
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
      <Button radius="inner" variant="outline" onClick={() => notesService.togglePin(entry.id)}>
        <PushPinSimpleIcon weight={isPinned ? "fill" : "regular"} />
        {isPinned ? "Pinned" : "Pin"}
      </Button>
    );
  }

  return <TaskActions entry={entry} />;
}

function TaskActions({ entry }: { entry: TimelineView }) {
  const task = useEntry("task", entry.id);
  const today = useTodayDate();
  const isPriorTask = task ? task.date < today : false;

  if (entry.status === "incomplete") {
    return (
      <>
        <Button
          radius="inner"
          variant="outline"
          onClick={() => taskService.setStatus(entry.id, "cancelled")}
        >
          <XIcon />
          Cancel
        </Button>
        {isPriorTask && (
          <Button
            radius="inner"
            variant="outline"
            onClick={() => taskService.rolloverTask(entry.id)}
          >
            <ArrowSquareRightIcon />
            Defer
          </Button>
        )}
        <Button
          radius="inner"
          variant="outline"
          onClick={() => taskService.setStatus(entry.id, "complete")}
        >
          <CheckIcon />
          Complete
        </Button>
      </>
    );
  }

  if (entry.status === "complete" || entry.status === "cancelled") {
    return (
      <Button
        radius="inner"
        variant="outline"
        onClick={() => taskService.setStatus(entry.id, "incomplete")}
      >
        <ArrowCounterClockwiseIcon />
        Reopen
      </Button>
    );
  }

  return null;
}
