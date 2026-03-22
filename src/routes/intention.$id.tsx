import {
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  TextContent,
  TextareaDialog,
} from "@/components";
import { SwipeBackEdge } from "@/components/navigation/swipe-back-edge";
import { intentionService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import {
  CaretLeftIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

const searchSchema = z.object({
  from: z.enum(["index", "entries"]).optional().catch(undefined),
});

export const Route = createFileRoute("/intention/$id")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  loader: async ({ params }) => {
    const intention = await intentionService.get(params.id);
    if (!intention) {
      throw notFound();
    }
    return { intention };
  },
});

function RouteComponent() {
  const { intention } = Route.useLoaderData();
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const mutation = useMutation();

  const goBack = () => {
    if (from === "entries") {
      navigate({ to: "/app/entries", viewTransition: { types: ["slide-right"] } });
    } else {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    }
  };

  return (
    <div className="flex min-h-screen flex-col max-w-2xl mx-auto pt-safe-top pb-safe-bottom">
      <header className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={goBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
        <div className="flex-1 text-center">
          <span className="font-medium">Intention</span>
        </div>
        <MenuRoot>
          <MenuTrigger className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105">
            <DotsThreeIcon className="size-6" />
          </MenuTrigger>
          <MenuPortal>
            <MenuPositioner align="end">
              <MenuPopup>
                <MenuItem onClick={() => setEditOpen(true)} className="flex gap-2">
                  <PencilSimpleIcon className="size-4" />
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={async () => {
                    await mutation(() => intentionService.delete(intention.id));
                    goBack();
                  }}
                  className="text-error flex gap-2"
                >
                  <TrashIcon className="size-4" />
                  Delete
                </MenuItem>
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </MenuRoot>
      </header>

      <TextContent content={intention.content} updatedAt={intention.updatedAt} createdAt={intention.createdAt} />

      <TextareaDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={async (content) => {
          await mutation(() => intentionService.update(intention.id, { content }));
          setEditOpen(false);
        }}
        title="Edit intention"
        initialContent={intention.content}
      />
      <SwipeBackEdge onBack={goBack} />
    </div>
  );
}
