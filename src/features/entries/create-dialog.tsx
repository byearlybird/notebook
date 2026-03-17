import { cx } from "cva";
import { Button as BaseButton } from "@base-ui/react";
import { Button } from "@/components/button";
import {
  DialogBackdrop,
  DialogRoot,
  DialogPortal,
  DialogPopup,
  DialogTitle,
} from "@/components/dialog";
import { CircleIcon, SquareIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useCreateNote } from "@/features/notes";
import { useCreateTask } from "@/features/tasks";
import { AnimatePresence, motion } from "motion/react";

export function CreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createNote = useCreateNote();
  const createTask = useCreateTask();
  const [content, setContent] = useState<string>("");
  const [entryType, setEntryType] = useState<"note" | "task">("note");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleClose = () => {
    setContent("");
    setEntryType("note");
    onClose();
  };

  const handleSave = () => {
    if (content.trim() === "") return;

    if (entryType === "note") {
      void createNote({ content: content.trim() });
    } else if (entryType === "task") {
      void createTask({ content: content.trim() });
    }

    setContent("");
    handleClose();
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={handleClose}
      onOpenChangeComplete={(open) => {
        if (open) {
          textareaRef.current?.focus();
        }
      }}
    >
      <AnimatePresence>
        {open && (
          <DialogPortal keepMounted>
            <DialogBackdrop
              render={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              }
            />
            <div className="fixed inset-x-0 -top-10 flex h-1/2 w-full max-w-2xl mx-auto">
              <DialogPopup
                className="flex h-full w-full flex-col overflow-y-auto p-2 pt-[calc(var(--safe-top)+var(--spacing)*10)]"
                render={
                  <motion.div
                    initial={{ y: "-100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                }
              >
                <DialogTitle>Create a new entry</DialogTitle>
                <Toolbar entryType={entryType} onEntryTypeChange={setEntryType} />
                <textarea
                  ref={textareaRef}
                  placeholder="What's on your mind?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="scrollbar-hide text-base h-full border-t border-dotted w-full resize-none p-2 placeholder:text-cloud-medium focus:outline-none focus-visible:outline-none focus-visible:shadow-none"
                />
                <div className="flex justify-between gap-4 p-2">
                  <Button onClick={handleClose} variant="slate">
                    Cancel
                  </Button>
                  <Button disabled={content.trim() === ""} onClick={handleSave} variant="gold">
                    Save
                  </Button>
                </div>
              </DialogPopup>
            </div>
          </DialogPortal>
        )}
      </AnimatePresence>
    </DialogRoot>
  );
}

function Toolbar({
  entryType,
  onEntryTypeChange,
}: {
  entryType: "note" | "task";
  onEntryTypeChange: (type: "note" | "task") => void;
}) {
  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex w-fit rounded-full shrink-0 gap-2">
        <ToolbarButton selected={entryType === "note"} onClick={() => onEntryTypeChange("note")}>
          <CircleIcon className="size-4" />
          Note
        </ToolbarButton>
        <ToolbarButton selected={entryType === "task"} onClick={() => onEntryTypeChange("task")}>
          <SquareIcon className="size-4" />
          Task
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <BaseButton
      type="button"
      onClick={onClick}
      className={cx(
        "flex px-2.5 py-1.5 gap-2 items-center justify-center rounded-lg text-cloud-medium data-active:scale-105 transition-all",
        selected && "bg-slate-dark text-ivory-light",
      )}
    >
      {children}
    </BaseButton>
  );
}
