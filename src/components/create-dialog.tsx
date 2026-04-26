import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (open) setLabelId($labelFilter.get()?.id ?? null);
  }, [open]);

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
    if (!isOpen) setContent("");
    onOpenChange(isOpen);
  }

  function handleTypeChange(value: string[]) {
    if (value.length > 0) setEntryType(value[0] as EntryType);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/70 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-200" />
        <Dialog.Viewport className="fixed inset-x-1 top-1 sm:inset-0 sm:flex sm:items-start sm:justify-center sm:pt-[20vh] sm:p-4">
          <Dialog.Popup className="w-full sm:max-w-xl rounded-2xl bg-surface outline outline-border p-6 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 transition-all duration-200 ease-out">
            <div className="-mx-2">
              <EntryTypeToggle value={entryType} onValueChange={handleTypeChange} />
            </div>
            <textarea
              className="w-full mt-4 mb-6 bg-transparent text-foreground placeholder:text-foreground-muted resize-none outline-none text-base leading-relaxed min-h-32 sm:min-h-48 font-serif"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
              }}
              autoFocus
            />
            <div className="flex items-center justify-between gap-2">
              <LabelPicker value={labelId} onValueChange={setLabelId} radius="outermost" />
              <div className="flex gap-2">
                <Dialog.Close render={(props) => <Button variant="secondary" {...props} />}>
                  Cancel
                </Dialog.Close>
                <Button onClick={handleSubmit} disabled={!content.trim()}>
                  Done
                </Button>
              </div>
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
        active ? "bg-background text-foreground" : "text-foreground-muted hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </Toggle>
  );
}
