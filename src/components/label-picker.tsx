import { Select } from "@base-ui/react/select";
import { CheckIcon, TagSimpleIcon } from "@phosphor-icons/react";
import { useLabels } from "@/hooks/use-labels";
import { openCreateLabel } from "@/stores/create-label";
import { Button } from "./shared/button";

type LabelPickerProps = {
  value: string | null;
  onValueChange: (labelId: string | null) => void;
  placeholder?: string;
};

export function LabelPicker({ value, onValueChange, placeholder }: LabelPickerProps) {
  const labels = useLabels();
  const currentLabelName = labels.find((l) => l.id === value)?.name;

  return (
    <Select.Root value={value} onValueChange={(next) => onValueChange(next as string | null)}>
      <Select.Trigger render={<Button variant="outline" />}>
        <TagSimpleIcon />
        {currentLabelName ? (
          <span>{currentLabelName}</span>
        ) : placeholder ? (
          <span>{placeholder}</span>
        ) : null}
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner side="top" align="start" sideOffset={8} alignItemWithTrigger={false}>
          <Select.Popup className="min-w-40 max-h-96 overflow-y-auto bg-surface outline outline-border rounded-xl p-1 shadow-lg data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 transition-all duration-100 ease-out">
            {labels.length === 0 ? (
              <button
                className="w-full flex items-center rounded-lg px-2 py-1.5 text-sm text-foreground/60 hover:bg-accent-hover/60 cursor-default transition-colors"
                onPointerDown={(e) => e.preventDefault()}
                onClick={openCreateLabel}
              >
                Add a label +
              </button>
            ) : (
              <>
                <LabelItem value={null} name="None" />
                {labels.map((label) => (
                  <LabelItem key={label.id} value={label.id} name={label.name} />
                ))}
              </>
            )}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

function LabelItem({ value, name }: { value: string | null; name: string }) {
  return (
    <Select.Item
      value={value}
      className="transition-all flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground cursor-default data-highlighted:bg-accent-hover/60"
    >
      <Select.ItemText>{name}</Select.ItemText>
      <Select.ItemIndicator>
        <CheckIcon className="size-4" />
      </Select.ItemIndicator>
    </Select.Item>
  );
}
