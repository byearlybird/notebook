import { useState } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { MenuRoot, Menu, MenuTrigger, MenuItem } from "@/components/shared/menu";
import { TextareaDialog } from "@/components/shared/textarea-dialog";
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareRightIcon,
  CheckIcon,
  CheckSquareIcon,
  DotsThreeVerticalIcon,
  PushPinSimpleIcon,
  SquareIcon,
  XIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import { useStore } from "@nanostores/react";
import type { DBSchema, TaskTable } from "@/db/schema";
import { formatDateTime } from "@/utils/dates";
import { notesService } from "@/services/note-service";
import { taskService } from "@/services/task-service";
import { useDBQuery } from "@/hooks/use-db-query";
import { useEntry } from "@/hooks/use-entry";
import { labelsService } from "@/services/label-service";
import { $selectedEntryId, closeEntryDetail } from "@/stores/entry-detail";
import { Button } from "./button";
import { LabelPicker } from "./label-picker";

type TimelineView = DBSchema["timeline"];

export function EntryDetail() {
  const id = useStore($selectedEntryId);
  const [editEntry, setEditEntry] = useState<TimelineView | null>(null);

  return (
    <>
      <Drawer.Root
        open={id !== null}
        onOpenChange={(open) => {
          if (!open) closeEntryDetail();
        }}
      >
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 bg-black/70 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-300" />
          <Drawer.Viewport className="fixed inset-0 flex items-stretch justify-end p-2">
            <Drawer.Popup className="relative w-full rounded-2xl sm:max-w-2/3 lg:max-w-1/2 h-full bg-neutral-800 outline outline-neutral-700 transition-transform duration-300 data-starting-style:translate-x-full data-ending-style:translate-x-full">
              <Drawer.Content className="h-full flex flex-col">
                {id && <EntryDetailContent id={id} onEditClick={setEditEntry} />}
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
      <TextareaDialog
        open={editEntry !== null}
        onOpenChange={(open) => {
          if (!open) setEditEntry(null);
        }}
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
      <div className="px-4 py-3 flex items-center justify-between border-b border-dashed border-neutral-700">
        <Drawer.Title className="text-lg font-semibold font-serif">
          {formatDateTime(entry.created_at)}
        </Drawer.Title>
        <div className="flex gap-2">
          <MenuRoot>
            <MenuTrigger variant="outline">
              <DotsThreeVerticalIcon />
            </MenuTrigger>
            <Menu>
              <MenuItem onClick={() => onEditClick(entry)}>Edit</MenuItem>
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

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
        {entry.type === "task" && entry.status && <TaskStatusRow status={entry.status} />}
        <p className="text-neutral-200">{entry.content}</p>
      </div>

      <div className="border-t border-dashed border-neutral-700 p-4 flex items-center justify-between">
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
    <div className="flex gap-2 items-center text-sm text-neutral-400 mb-4">
      {status === "complete" ? (
        <CheckSquareIcon className="size-4.5 text-yellow-200" />
      ) : status === "cancelled" ? (
        <XSquareIcon className="size-4.5 text-neutral-400" />
      ) : status === "deferred" ? (
        <ArrowSquareRightIcon className="size-4.5 text-neutral-400" />
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

  if (entry.status === "incomplete") {
    return (
      <>
        <Button
          radius="inner"
          variant="outline"
          onClick={() => taskService.setStatus(entry.id, "complete")}
        >
          <CheckIcon />
          Complete
        </Button>
        <Button
          radius="inner"
          variant="outline"
          onClick={() => taskService.setStatus(entry.id, "cancelled")}
        >
          <XIcon />
          Cancel
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
