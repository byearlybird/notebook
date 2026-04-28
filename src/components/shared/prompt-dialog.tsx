import { useEffect, useState } from "react";
import { Button } from "@/components/shared/button";
import { Dialog, DialogClose } from "@/components/shared/dialog";

type PromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  initialValue?: string;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  submitLabel?: string;
  onSave: (value: string) => void;
};

export function PromptDialog({
  open,
  onOpenChange,
  title,
  initialValue = "",
  placeholder,
  multiline = false,
  maxLength,
  submitLabel = "Save",
  onSave,
}: PromptDialogProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDisabled = !value.trim() || value.trim() === initialValue.trim();

  function handleSave() {
    if (saveDisabled) return;
    onSave(value.trim());
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size={multiline ? "default" : "small"}
    >
      {multiline ? (
        <textarea
          className="w-full bg-transparent text-foreground placeholder:text-foreground-muted resize-none outline-none text-base leading-relaxed font-serif field-sizing-content min-h-32 sm:min-h-48 max-h-[33vh] sm:max-h-[50vh] overflow-y-auto mb-4"
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSave();
          }}
          autoFocus
        />
      ) : (
        <input
          type="text"
          className="w-full bg-transparent text-foreground placeholder:text-foreground-muted outline-none text-base leading-relaxed mb-4 font-serif"
          placeholder={placeholder}
          value={value}
          maxLength={maxLength}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          autoFocus
        />
      )}
      <div className="flex items-center justify-end gap-2">
        <DialogClose render={(props) => <Button variant="secondary" {...props} />}>
          Cancel
        </DialogClose>
        <Button onClick={handleSave} disabled={saveDisabled}>
          {submitLabel}
        </Button>
      </div>
    </Dialog>
  );
}
