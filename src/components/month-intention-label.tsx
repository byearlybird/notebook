import { useState } from "react";
import { StarIcon } from "@phosphor-icons/react";
import { useMonthIntention } from "@/hooks/use-month-intention";
import { intentionService } from "@/services/intention-service";
import { PromptDialog } from "./shared/prompt-dialog";

type MonthIntentionLabelProps = {
  month: string;
};

export function MonthIntentionLabel({ month }: MonthIntentionLabelProps) {
  const intention = useMonthIntention(month);
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setEditOpen(true)}
        className="flex items-center gap-1.5 text-sm text-foreground-muted min-w-0 rounded-md px-1.5 py-0.5 -mx-1.5 hover:bg-surface-tint transition-colors"
      >
        <StarIcon className={`size-3 shrink-0 ${!intention ? "opacity-30" : ""}`} />
        {intention && <span className="font-serif truncate">{intention.content}</span>}
      </button>
      <PromptDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title={intention ? "Edit intention" : "Set intention"}
        initialValue={intention?.content ?? ""}
        placeholder="What's your intention for this month?"
        maxLength={48}
        onSave={(value) => intentionService.createIntention(value, month)}
      />
    </>
  );
}
