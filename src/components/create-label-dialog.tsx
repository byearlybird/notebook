import { useStore } from "@nanostores/react";
import { PromptDialog } from "@/components/shared/prompt-dialog";
import { $createLabelOpen, closeCreateLabel } from "@/stores/create-label";
import { labelsService } from "@/services/label-service";

export function CreateLabelDialog() {
  const open = useStore($createLabelOpen);

  return (
    <PromptDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) closeCreateLabel();
      }}
      title="New label"
      placeholder="Label name"
      onSave={(name) => labelsService.createLabel(name)}
    />
  );
}
