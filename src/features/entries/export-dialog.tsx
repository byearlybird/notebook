import { useEffect, useState } from "react";
import { Button } from "@/components/button";
import {
  DialogBackdrop,
  DialogRoot,
  DialogPortal,
  DialogPopup,
  DialogTitle,
} from "@/components/dialog";
import { dumpDatabase, type DatabaseDump } from "@/db/sync-utils";
import { AnimatePresence, motion } from "motion/react";

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [dump, setDump] = useState<DatabaseDump | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setDump(null);
      setCopied(false);
      return;
    }

    setLoading(true);
    dumpDatabase()
      .then(setDump)
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <DialogRoot open={open} onOpenChange={onClose}>
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
                <DialogTitle>Export Database</DialogTitle>
                {loading ? (
                  <p className="py-8 text-center text-sm text-cloud-medium">Exporting…</p>
                ) : (
                  <pre className="flex-1 overflow-auto rounded-md bg-slate-dark p-3 text-xs text-cloud-light">
                    {JSON.stringify(dump, null, 2)}
                  </pre>
                )}
                <div className="mt-4 flex justify-end gap-2">
                  <Button onClick={onClose} variant="slate">
                    Close
                  </Button>
                  {!loading && (
                    <Button
                      variant="gold"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(dump, null, 2));
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                    >
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  )}
                </div>
              </DialogPopup>
            </div>
          </DialogPortal>
        )}
      </AnimatePresence>
    </DialogRoot>
  );
}
