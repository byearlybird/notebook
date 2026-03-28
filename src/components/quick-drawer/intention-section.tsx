import { Renderer } from "@/components/lexical/renderer";
import { IntentionDialog } from "@/components/entries/intention-dialog";
import type { Intention } from "@/models";
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { StarIcon } from "@phosphor-icons/react";

export function IntentionSection({
  intention,
  month,
}: {
  intention: Intention | null;
  month: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
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
        className="w-full rounded-lg -mx-2 px-2 py-2.5 text-left transition-colors active:bg-slate-light/50 flex items-center gap-2.5"
        onClick={handleClick}
      >
        <StarIcon className="size-4" />
        {intention ? (
          <Renderer content={intention.content} />
        ) : (
          <span className="text-sm text-cloud-light">Set a monthly intention</span>
        )}
      </button>

      <IntentionDialog month={month} open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
