import { Button } from "@/components/shared/button";
import { LabelRow } from "@/components/label-row";
import { useDBQuery } from "@/hooks/use-db-query";
import { openCreateLabel } from "@/stores/create-label";
import { PlusIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
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
      <Button variant="outline" className="mb-4" onClick={openCreateLabel}>
        Create label
        <PlusIcon />
      </Button>
      {labels?.length === 0 ? (
        <p className="px-5 py-3 min-h-36 flex items-center justify-center text-sm bg-background/30 rounded-xl text-center text-foreground-muted">
          No labels yet
        </p>
      ) : (
        <ul className="bg-background/50 rounded-xl overflow-hidden divide-y divide-border/50">
          {labels?.map((label) => (
            <LabelRow key={label.id} label={label} />
          ))}
        </ul>
      )}
    </>
  );
}
