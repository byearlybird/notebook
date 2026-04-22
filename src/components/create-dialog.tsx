import { Dialog } from "@base-ui/react/dialog";
import { Button } from "./button";

type CreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateDialog({ open, onOpenChange }: CreateDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/70 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-200" />
        <Dialog.Viewport className="fixed inset-0 flex items-start justify-center pt-[8vh] sm:pt-[20vh] p-4">
          <Dialog.Popup className="w-full max-w-md rounded-2xl bg-neutral-800 outline outline-neutral-700 p-6 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 transition-[transform,opacity] duration-200">
            <Dialog.Title className="text-lg font-semibold font-sans mb-1">Create</Dialog.Title>
            <Dialog.Description className="text-sm text-neutral-400 mb-6">
              Create a new entry.
            </Dialog.Description>
            <div className="flex justify-end gap-2">
              <Dialog.Close render={(props) => <Button variant="secondary" {...props} />}>
                Cancel
              </Dialog.Close>
              <Button>Done</Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
