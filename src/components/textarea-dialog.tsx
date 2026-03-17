import {
  DialogBackdrop,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

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
  const [content, setContent] = useState(initialContent);

  const handleClose = () => {
    setContent(initialContent);
    onClose();
  };

  const handleSave = () => {
    if (content.trim() === "") return;
    onSave(content.trim());
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
                <textarea
                  placeholder={placeholder}
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
