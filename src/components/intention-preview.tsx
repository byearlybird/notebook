import { useState } from "react";
import { StarIcon } from "@phosphor-icons/react";
import { useMonthIntention } from "@/hooks/use-month-intention";
import { intentionService } from "@/services/intention-service";
import { PromptDialog } from "@/components/shared/prompt-dialog";

export function IntentionPreview() {
  const intention = useMonthIntention();
  const [editOpen, setEditOpen] = useState(false);

  function handleSave(value: string) {
    intentionService.setCurrentMonthIntention(value);
  }

  return (
    <>
      <button
        onClick={() => setEditOpen(true)}
        className="w-full flex flex-col items-center gap-1 text-center px-2.5 py-2 rounded-xl text-sm text-foreground/70 hover:bg-foreground/10 transition-colors leading-relaxed"
      >
        <StarIcon className={`size-4 ${!intention ? "text-accent" : ""}`} />
        <span className="font-serif">
          {intention ? intention.content : "Set an intention for the month"}
        </span>
      </button>
      <PromptDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title={intention ? "Edit intention" : "Set intention"}
        initialValue={intention?.content ?? ""}
        placeholder="What's your intention for this month?"
        onSave={handleSave}
      />
    </>
  );
}
