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
import { useState } from "react";
import { createPortal } from "react-dom";
import { noteService, taskService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import { AnimatePresence, motion } from "motion/react";
import { Editor, useEditor, readEditorContent } from "@/components/lexical";
import { $getRoot, $createParagraphNode } from "lexical";

export function CreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mutation = useMutation();
  const editor = useEditor();
  const [isEmpty, setIsEmpty] = useState(true);
  const [entryType, setEntryType] = useState<"note" | "task">("note");

  const handleClose = () => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
    setIsEmpty(true);
    setEntryType("note");
    onClose();
  };

  const handleSave = () => {
    const content = readEditorContent(editor);
    if (!content) return;

    if (entryType === "note") {
      void mutation(() => noteService.create(content));
    } else if (entryType === "task") {
      void mutation(() => taskService.create(content));
    }

    handleClose();
  };

  return (
    <DialogRoot open={open} onOpenChange={handleClose}>
      <AnimatePresence>
        {open && (
          <>
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
                  <Editor
                    editor={editor}
                    onEmptyChange={setIsEmpty}
                    placeholder="What's on your mind?"
                  />
                  <div className="flex justify-between gap-4 p-2">
                    <Button onClick={handleClose} variant="slate">
                      Cancel
                    </Button>
                    <Button disabled={isEmpty} onClick={handleSave} variant="gold">
                      Save
                    </Button>
                  </div>
                </DialogPopup>
              </div>
            </DialogPortal>
            {createPortal(
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed right-2 z-50 flex items-center gap-1 rounded-lg border bg-slate-medium px-2 py-1"
                style={{ bottom: "calc(var(--keyboard-height) + var(--spacing)*3)" }}
                onMouseDown={(e) => e.preventDefault()}
              >
                <EntryTypeToggle entryType={entryType} onEntryTypeChange={setEntryType} />
              </motion.div>,
              document.body,
            )}
          </>
        )}
      </AnimatePresence>
    </DialogRoot>
  );
}

function EntryTypeToggle({
  entryType,
  onEntryTypeChange,
}: {
  entryType: "note" | "task";
  onEntryTypeChange: (type: "note" | "task") => void;
}) {
  return (
    <div className="flex w-fit shrink-0 gap-2">
      <EntryTypeButton selected={entryType === "note"} onClick={() => onEntryTypeChange("note")}>
        <CircleIcon className="size-4" />
        Note
      </EntryTypeButton>
      <EntryTypeButton selected={entryType === "task"} onClick={() => onEntryTypeChange("task")}>
        <SquareIcon className="size-4" />
        Task
      </EntryTypeButton>
    </div>
  );
}

function EntryTypeButton({
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
      onMouseDown={(e) => e.preventDefault()}
      className={cx(
        "flex px-2 py-1 rounded-md gap-2 items-center justify-center text-cloud-medium data-active:scale-105 transition-all",
        selected && "bg-slate-dark text-ivory-light",
      )}
    >
      {children}
    </BaseButton>
  );
}
