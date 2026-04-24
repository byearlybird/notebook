import { useState } from "react";
import { Button } from "@/components/button";
import { LabelRow } from "@/components/label-row";
import { TextareaDialog } from "@/components/shared/textarea-dialog";
import { useDBQuery } from "@/hooks/use-db-query";
import { labelsService } from "@/services/label-service";
import { PlusIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [createOpen, setCreateOpen] = useState(false);
  const labels = useDBQuery((db) =>
    db
      .selectFrom("labels")
      .orderBy("name", "asc")
      .selectAll()
      .select((eb) =>
        eb(
          eb
            .selectFrom("notes")
            .whereRef("notes.label", "=", "labels.id")
            .select(eb.fn.countAll<number>().as("c")),
          "+",
          eb
            .selectFrom("tasks")
            .whereRef("tasks.label", "=", "labels.id")
            .select(eb.fn.countAll<number>().as("c")),
        ).as("item_count"),
      ),
  );
  return (
    <>
      <Button variant="outline" className="mb-4" onClick={() => setCreateOpen(true)}>
        Create label
        <PlusIcon />
      </Button>
      <TextareaDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create label"
        placeholder="Label name"
        size="small"
        onSave={(name) => labelsService.createLabel(name)}
      />
      {labels?.length === 0 ? (
        <p className="px-5 py-3 min-h-36 flex items-center justify-center text-sm bg-background/30 rounded-xl text-center text-foreground-muted">
          No labels yet
        </p>
      ) : (
        <ul className="space-y-1 py-2">
          {labels?.map((label) => (
            <LabelRow key={label.id} label={label} />
          ))}
        </ul>
      )}
    </>
  );
}
