import { Select } from "@base-ui/react/select";
import { CheckIcon, TagSimpleIcon } from "@phosphor-icons/react";
import { useLabels } from "@/hooks/use-labels";
import { Button } from "./button";

type LabelPickerProps = {
  value: string | null;
  onValueChange: (labelId: string | null) => void;
  radius?: "inner" | "outermost";
  placeholder?: string;
};

export function LabelPicker({
  value,
  onValueChange,
  radius = "inner",
  placeholder,
}: LabelPickerProps) {
  const labels = useLabels();
  const currentLabelName = labels.find((l) => l.id === value)?.name;

  return (
    <Select.Root value={value} onValueChange={(next) => onValueChange(next as string | null)}>
      <Select.Trigger render={<Button variant="outline" radius={radius} />}>
        <TagSimpleIcon />
        {currentLabelName ? (
          <span>{currentLabelName}</span>
        ) : placeholder ? (
          <span>{placeholder}</span>
        ) : null}
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner side="bottom" align="end" sideOffset={8}>
          <Select.Popup className="min-w-40 max-h-96 overflow-y-auto bg-neutral-800 outline outline-neutral-700 rounded-xl p-1 shadow-lg origin-top data-starting-style:opacity-0 data-starting-style:scale-95 data-ending-style:opacity-0 data-ending-style:scale-95 transition-all duration-100 ease-out">
            <LabelItem value={null} name="None" />
            {labels?.map((label) => (
              <LabelItem key={label.id} value={label.id} name={label.name} />
            ))}
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
      className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm text-neutral-200 cursor-default data-highlighted:bg-neutral-700/60"
    >
      <Select.ItemText>{name}</Select.ItemText>
      <Select.ItemIndicator>
        <CheckIcon className="size-4" />
      </Select.ItemIndicator>
    </Select.Item>
  );
}
