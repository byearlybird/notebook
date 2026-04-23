import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { CircleIcon, SquareIcon } from "@phosphor-icons/react";
import { clsx } from "clsx";
import { Button } from "./button";
import { LabelPicker } from "./label-picker";
import { notesService } from "@/services/note-service";
import { taskService } from "@/services/task-service";
import { $labelFilter } from "@/stores/entry-search";

type EntryType = "note" | "task";

type CreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateDialog({ open, onOpenChange }: CreateDialogProps) {
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("note");
  const [labelId, setLabelId] = useState<string | null>(() => $labelFilter.get()?.id ?? null);

  async function handleSubmit() {
    if (!content.trim()) return;
    if (entryType === "note") {
      await notesService.createNote(content.trim(), labelId);
    } else {
      await taskService.createTask(content.trim(), labelId);
    }
    setContent("");
    setLabelId($labelFilter.get()?.id ?? null);
    onOpenChange(false);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setContent("");
      setLabelId($labelFilter.get()?.id ?? null);
    }
    onOpenChange(isOpen);
  }

  function handleTypeChange(value: string[]) {
    if (value.length > 0) setEntryType(value[0] as EntryType);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/70 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-200" />
        <Dialog.Viewport className="fixed inset-0 flex items-start justify-center pt-[8vh] sm:pt-[20vh] p-4">
          <Dialog.Popup className="w-full max-w-md sm:max-w-xl rounded-2xl bg-neutral-800 outline outline-neutral-700 p-6 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 transition-all duration-200 ease-out">
            <div className="-mx-2 flex items-center justify-between gap-2">
              <EntryTypeToggle value={entryType} onValueChange={handleTypeChange} />
              <LabelPicker value={labelId} onValueChange={setLabelId} radius="outermost" />
            </div>
            <textarea
              className="w-full mt-4 mb-6 bg-transparent text-neutral-100 placeholder:text-neutral-500 resize-none outline-none text-sm leading-relaxed min-h-32 sm:min-h-48"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Dialog.Close render={(props) => <Button variant="secondary" {...props} />}>
                Cancel
              </Dialog.Close>
              <Button onClick={handleSubmit} disabled={!content.trim()}>
                Done
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

type EntryTypeToggleProps = {
  value: EntryType;
  onValueChange: (value: string[]) => void;
};

function EntryTypeToggle({ value, onValueChange }: EntryTypeToggleProps) {
  return (
    <ToggleGroup value={[value]} onValueChange={onValueChange} className="flex gap-1">
      <TypeToggle
        value="note"
        label="Note"
        icon={<CircleIcon className="size-4" />}
        active={value === "note"}
      />
      <TypeToggle
        value="task"
        label="Task"
        icon={<SquareIcon className="size-4" />}
        active={value === "task"}
      />
    </ToggleGroup>
  );
}

function TypeToggle({
  value,
  label,
  icon,
  active,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
}) {
  return (
    <Toggle
      value={value}
      className={clsx(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-all cursor-pointer outline-none",
        active ? "bg-neutral-900 text-neutral-200" : "text-neutral-500 hover:text-neutral-300",
      )}
    >
      {icon}
      {label}
    </Toggle>
  );
}
