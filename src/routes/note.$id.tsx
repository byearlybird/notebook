import { noteService } from "@/app";
import {
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  TextContent,
} from "@/components";
import { SwipeBackEdge } from "@/components/swipe-back-edge";
import { EditNoteDialog } from "@/features/notes";
import { CaretLeftIcon, DotsThreeIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import z from "zod";

const noteSearchSchema = z.object({
  from: z.enum(["index", "entries"]).optional().catch(undefined),
});

export const Route = createFileRoute("/note/$id")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => noteSearchSchema.parse(search),
  loader: async ({ params }) => {
    const note = await noteService.get(params.id);
    if (!note) {
      throw notFound();
    }
    return { note };
  },
});

function RouteComponent() {
  const { note } = Route.useLoaderData();
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [editOpen, setEditOpen] = useState(false);

  const goBack = () => {
    if (from === "index") {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    } else if (from === "entries") {
      navigate({
        to: "/app/entries",
        viewTransition: { types: ["slide-right"] },
      });
    } else {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    }
  };

  const handleDelete = () => {
    noteService.delete(note.id);
    goBack();
  };

  const formattedDate = format(parseISO(note.date), "MMMM d");
  const createdTime = format(parseISO(note.created_at), "h:mm a");

  return (
    <div className="flex min-h-screen flex-col max-w-2xl mx-auto pt-safe-top pb-safe-bottom">
      {/* Header row */}
      <header className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={goBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
        <div className="flex-1 text-center flex flex-col justify-between gap-2">
          <time className="font-medium" dateTime={note.date}>
            {formattedDate}
          </time>
          <time className="block text-xs text-cloud-medium" dateTime={note.created_at}>
            {createdTime}
          </time>
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
                <MenuItem onClick={handleDelete} className="text-error flex gap-2">
                  <TrashIcon className="size-4" />
                  Delete
                </MenuItem>
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </MenuRoot>
      </header>
      {/* Content area */}
      <TextContent content={note.content} updatedAt={note.updated_at} createdAt={note.created_at} />
      <EditNoteDialog open={editOpen} onClose={() => setEditOpen(false)} note={note} />
      <SwipeBackEdge onBack={goBack} />
    </div>
  );
}
