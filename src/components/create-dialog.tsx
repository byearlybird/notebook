import { useEffect, useRef, useState } from "react";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import {
  CircleIcon,
  DiamondIcon,
  ImageIcon,
  SquareIcon,
  TriangleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { clsx } from "clsx";
import { Button } from "@/components/shared/button";
import { Slider } from "@/components/shared/slider";
import { LabelPicker } from "./label-picker";
import { Dialog, DialogClose } from "./shared/dialog";
import { notesService } from "@/services/note-service";
import { taskService } from "@/services/task-service";
import { moodService } from "@/services/mood-service";
import { momentService } from "@/services/moment-service";
import { deriveImages, type ImageDerivatives } from "@/utils/image-resize";
import { moodLabel } from "@/utils/mood-label";
import { $labelFilter } from "@/stores/entry-search";

type EntryType = "note" | "task" | "mood" | "moment";

type CreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateDialog({ open, onOpenChange }: CreateDialogProps) {
  const [content, setContent] = useState("");
  const [entryType, setEntryType] = useState<EntryType>("note");
  const [mood, setMood] = useState(50);
  const [labelId, setLabelId] = useState<string | null>(() => $labelFilter.get()?.id ?? null);
  const [derivatives, setDerivatives] = useState<ImageDerivatives | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [encoding, setEncoding] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setLabelId($labelFilter.get()?.id ?? null);
  }, [open]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    };
  }, [imagePreviewUrl]);

  function clearImage() {
    setDerivatives(null);
    setImagePreviewUrl(null);
    setImageError(null);
    setEncoding(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDerivatives(null);
    setImageError(null);
    setEncoding(true);
    setImagePreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    try {
      const result = await deriveImages(file);
      setDerivatives(result);
    } catch {
      setImageError("Couldn't process that image.");
      setImagePreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } finally {
      setEncoding(false);
    }
  }

  async function handleSubmit() {
    if (entryType === "mood") {
      await moodService.createMood(mood, labelId);
    } else if (entryType === "moment") {
      if (!content.trim() && !derivatives) return;
      await momentService.createMoment(
        content.trim(),
        derivatives?.display ?? null,
        derivatives?.thumbnail ?? null,
        labelId,
      );
    } else {
      if (!content.trim()) return;
      if (entryType === "note") {
        await notesService.createNote(content.trim(), labelId);
      } else {
        await taskService.createTask(content.trim(), labelId);
      }
    }
    setContent("");
    setMood(50);
    clearImage();
    setLabelId($labelFilter.get()?.id ?? null);
    onOpenChange(false);
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setContent("");
      setMood(50);
      clearImage();
    }
    onOpenChange(isOpen);
  }

  function handleTypeChange(value: string[]) {
    if (value.length > 0) setEntryType(value[0] as EntryType);
  }

  const submitDisabled =
    entryType === "mood"
      ? false
      : entryType === "moment"
        ? encoding || (!content.trim() && !derivatives)
        : !content.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <div className="-mx-2">
        <EntryTypeToggle value={entryType} onValueChange={handleTypeChange} />
      </div>
      {entryType === "mood" ? (
        <div className="my-4 flex flex-col gap-2">
          <div className="text-center text-sm text-foreground-muted h-5">
            {moodLabel(mood)}
          </div>
          <Slider value={mood} onValueChange={setMood} />
        </div>
      ) : (
        <>
          <textarea
            className="w-full mt-4 mb-2 bg-transparent text-foreground placeholder:text-foreground-muted resize-none outline-none text-base leading-relaxed min-h-32 md:min-h-48 max-h-[33vh] md:max-h-[50vh] overflow-y-auto field-sizing-content font-serif"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
            }}
            autoFocus
          />
          {entryType === "moment" && (
            <div className="mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              {imagePreviewUrl ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreviewUrl}
                    alt=""
                    className="max-h-40 rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 rounded-full bg-background border border-border p-1 hover:bg-surface-tint cursor-pointer"
                    aria-label="Remove image"
                  >
                    <XIcon className="size-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-sm text-foreground-muted hover:text-foreground cursor-pointer"
                >
                  <ImageIcon className="size-4" />
                  Add an image
                </button>
              )}
              {imageError && (
                <div className="mt-2 text-sm text-foreground-muted">{imageError}</div>
              )}
            </div>
          )}
        </>
      )}
      <div className="flex items-center justify-between gap-2">
        <LabelPicker value={labelId} onValueChange={setLabelId} radius="outermost" />
        <div className="flex gap-2">
          <DialogClose render={(props) => <Button variant="secondary" {...props} />}>
            Cancel
          </DialogClose>
          <Button onClick={handleSubmit} disabled={submitDisabled}>
            Done
          </Button>
        </div>
      </div>
    </Dialog>
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
      <TypeToggle
        value="moment"
        label="Moment"
        icon={<TriangleIcon className="size-4" />}
        active={value === "moment"}
      />
      <TypeToggle
        value="mood"
        label="Mood"
        icon={<DiamondIcon className="size-4" />}
        active={value === "mood"}
        className="ms-auto"
      />
    </ToggleGroup>
  );
}

function TypeToggle({
  value,
  label,
  icon,
  active,
  className,
}: {
  value: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  className?: string;
}) {
  return (
    <Toggle
      value={value}
      className={clsx(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-medium transition-all cursor-pointer outline-none",
        active ? "bg-background text-foreground" : "text-foreground-muted hover:text-foreground",
        className,
      )}
    >
      {icon}
      {label}
    </Toggle>
  );
}
