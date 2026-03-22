import { Renderer } from "@/components/lexical/renderer";
import { TextareaDialog } from "@/components/entries/textarea-dialog";
import type { Intention } from "@/models";
import { intentionService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FlowerLotusIcon } from "@phosphor-icons/react";

export function IntentionSection({
  intention,
  month,
}: {
  intention: Intention | null;
  month: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const mutation = useMutation();
  const navigate = useNavigate();

  const handleClick = () => {
    if (intention) {
      navigate({
        to: "/intention/$id",
        params: { id: intention.id },
        viewTransition: { types: ["slide-left"] },
      });
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        className="w-full rounded-lg my-2 -mx-2 px-2 py-4 text-left transition-colors active:bg-slate-light/50 flex items-center gap-2.5"
        onClick={handleClick}
      >
        <FlowerLotusIcon />
        {intention ? (
          <Renderer content={intention.content} />
        ) : (
          <span className="text-sm text-cloud-light">Set an intention</span>
        )}
      </button>

      <TextareaDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(content) => mutation(() => intentionService.upsert(month, content))}
        title="Monthly intention"
        placeholder="What's your intention for this month?"
      />
    </>
  );
}
