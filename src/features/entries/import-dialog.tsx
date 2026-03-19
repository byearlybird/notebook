import { useState } from "react";
import { Button } from "@/components/button";
import {
  DialogBackdrop,
  DialogRoot,
  DialogPortal,
  DialogPopup,
  DialogTitle,
} from "@/components/dialog";
import { mergeIntoDatabase } from "@/db/dump";
import { useRouter } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";

export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleClose = () => {
    setJson("");
    setError(null);
    onClose();
  };

  const handleImport = async () => {
    setError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("Invalid JSON. Please check the format and try again.");
      return;
    }

    setImporting(true);
    try {
      await mergeIntoDatabase(parsed as Parameters<typeof mergeIntoDatabase>[0]);
      await router.invalidate();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
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
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <DialogPopup
                className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden p-4"
                render={
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                }
              >
                <DialogTitle>Import Database</DialogTitle>
                <textarea
                  value={json}
                  onChange={(e) => setJson(e.target.value)}
                  placeholder="Paste exported JSON here…"
                  className="flex-1 min-h-48 resize-y rounded-md bg-slate-dark p-3 text-xs text-cloud-light placeholder:text-cloud-medium/50 focus:outline-none"
                />
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
                <div className="mt-4 flex justify-end gap-2">
                  <Button onClick={handleClose} variant="slate">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleImport}
                    variant="gold"
                    disabled={importing || !json.trim()}
                  >
                    {importing ? "Importing…" : "Import"}
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
