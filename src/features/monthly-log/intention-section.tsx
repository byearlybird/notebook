import { Renderer } from "@/components/lexical/renderer";
import { TextareaDialog } from "@/components/textarea-dialog";
import type { Intention } from "@/db/schema";
import { useUpdateIntention } from "./use-monthly-log";
import { useState } from "react";
import { FlowerLotusIcon } from "@phosphor-icons/react";

export function IntentionSection({
  intention,
  month,
}: {
  intention: Intention | null;
  month: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const updateIntention = useUpdateIntention();

  const hasContent = !!intention;

  return (
    <>
      <button
        type="button"
        className="w-full rounded-lg my-2 -mx-2 px-2 py-4 text-left transition-colors active:bg-slate-light/50 flex items-center gap-2.5"
        onClick={() => setDialogOpen(true)}
      >
        <FlowerLotusIcon />
        {hasContent ? (
          <Renderer content={intention.content} />
        ) : (
          <span className="text-sm text-cloud-light">Set an intention</span>
        )}
      </button>

      <TextareaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(content) => updateIntention(month, content)}
        title="Monthly intention"
        placeholder="What's your intention for this month?"
        initialContent={intention?.content ?? ""}
      />
    </>
  );
}
