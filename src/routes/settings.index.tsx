import { Button } from "@/components/button";
import { LabelRow } from "@/components/label-row";
import { useDBQuery } from "@/hooks/use-db-query";
import { labelsService } from "@/services/label-service";
import { PlusIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings/")({
  component: RouteComponent,
});

function RouteComponent() {
  const labels = useDBQuery((db) =>
    db
      .selectFrom("labels")
      .where("is_deleted", "=", 0)
      .orderBy("name", "asc")
      .selectAll()
      .select((eb) =>
        eb(
          eb
            .selectFrom("notes")
            .whereRef("notes.label", "=", "labels.id")
            .where("notes.is_deleted", "=", 0)
            .select(eb.fn.countAll<number>().as("c")),
          "+",
          eb
            .selectFrom("tasks")
            .whereRef("tasks.label", "=", "labels.id")
            .where("tasks.is_deleted", "=", 0)
            .select(eb.fn.countAll<number>().as("c")),
        ).as("item_count"),
      ),
  );
  return (
    <>
      <Button
        variant="secondary"
        className="mb-4"
        onClick={() => {
          const name = window.prompt("Label name");
          if (name?.trim()) labelsService.createLabel(name.trim());
        }}
      >
        Create label
        <PlusIcon />
      </Button>
      {labels?.length === 0 ? (
        <p className="px-5 py-3 min-h-36 flex items-center justify-center text-sm bg-neutral-900/30 rounded-xl text-center text-neutral-500">
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
