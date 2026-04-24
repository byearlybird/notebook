import { useState } from "react";
import type { ReactElement } from "react";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { useMonthIntention } from "@/hooks/use-month-intention";
import { intentionService } from "@/services/intention-service";
import { SidebarPopover } from "@/components/shared/sidebar-popover";
import { TextareaDialog } from "@/components/shared/textarea-dialog";

export function IntentionPreview({ children }: { children: ReactElement }) {
  const intention = useMonthIntention();
  const [editOpen, setEditOpen] = useState(false);

  function handleSave(value: string) {
    intentionService.setCurrentMonthIntention(value);
  }

  return (
    <>
      <SidebarPopover trigger={children}>
        {intention ? (
          <div className="flex items-start gap-1 px-2 py-2">
            <p className="flex-1 text-sm text-foreground">{intention.content}</p>
            <button
              onClick={() => setEditOpen(true)}
              className="shrink-0 p-1 rounded-lg text-foreground/70 hover:bg-foreground/10 transition-all"
            >
              <PencilSimpleIcon className="size-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditOpen(true)}
            className="w-full text-left px-2 py-3 text-sm text-foreground-muted hover:text-foreground transition-colors"
          >
            Set an intention for this month +
          </button>
        )}
      </SidebarPopover>
      <TextareaDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        title={intention ? "Edit intention" : "Set intention"}
        initialValue={intention?.content ?? ""}
        placeholder="What's your intention for this month?"
        size="small"
        onSave={handleSave}
      />
    </>
  );
}
