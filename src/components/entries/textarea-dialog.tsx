import {
  DialogBackdrop,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "@/components/common/dialog";
import { Button } from "@/components/common/button";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Editor, useEditor, readEditorContent } from "@/components/lexical";

export function TextareaDialog({
  open,
  onClose,
  onSave,
  title,
  placeholder,
  initialContent,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  title: string;
  placeholder?: string;
  initialContent: string;
}) {
  const editor = useEditor();
  const [isEmpty, setIsEmpty] = useState(!initialContent);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    const content = readEditorContent(editor);
    if (!content) return;
    onSave(content);
    handleClose();
  };

  return (
    <DialogRoot open={open} onOpenChange={handleClose}>
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
                <DialogTitle>{title}</DialogTitle>
                <Editor
                  editor={editor}
                  initialContent={initialContent}
                  onEmptyChange={setIsEmpty}
                  placeholder={placeholder}
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
        )}
      </AnimatePresence>
    </DialogRoot>
  );
}
