import { noteService, labelService } from "@/app";
import {
  MenuButton,
  MenuContent,
  MenuItem,
  MenuRoot,
  LabelPicker,
  TextContent,
  TextareaDialog,
} from "@/components";
import { SwipeBackEdge } from "@/components/navigation/swipe-back-edge";
import {
  DetailPage,
  DetailPageHeader,
  DetailPageActions,
  DetailPageTitle,
} from "@/components/page/detail-page";
import { useMutation } from "@/utils/use-mutation";
import { PencilSimpleIcon, PushPinSimpleIcon, TrashIcon } from "@phosphor-icons/react";
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
    const allLabels = await labelService.getAll();
    return { note, allLabels };
  },
});

function RouteComponent() {
  const { note, allLabels } = Route.useLoaderData();
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();
  const mutation = useMutation();
  const [editOpen, setEditOpen] = useState(false);
  const isPinned = note.status === "pinned";

  const goBack = () => {
    if (from === "index") {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    } else if (from === "entries") {
      navigate({
        to: "/app",
        search: { view: "entries" },
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
  const createdTime = format(parseISO(note.createdAt), "h:mm a");

  return (
    <DetailPage onGoBack={goBack}>
      {/* Header row */}
      <DetailPageHeader>
        <DetailPageTitle>
          <time className="font-medium" dateTime={note.date}>
            {formattedDate}
          </time>
          <time className="block text-xs text-cloud-medium" dateTime={note.createdAt}>
            {createdTime}
          </time>
        </DetailPageTitle>
        <DetailPageActions>
          <button
            type="button"
            onClick={() => mutation(() => noteService.togglePin(note.id, !isPinned))}
            className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
            aria-label={isPinned ? "Unpin note" : "Pin note"}
          >
            {isPinned ? (
              <PushPinSimpleIcon className="size-4" weight="fill" />
            ) : (
              <PushPinSimpleIcon className="size-4 text-cloud-medium" />
            )}
          </button>
          <MenuRoot>
            <MenuButton />
            <MenuContent>
              <MenuItem onClick={() => setEditOpen(true)}>
                <PencilSimpleIcon className="size-4" />
                Edit
              </MenuItem>
              <MenuItem onClick={handleDelete} variant="destructive">
                <TrashIcon className="size-4" />
                Delete
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </DetailPageActions>
      </DetailPageHeader>
      {/* Content area */}
      <TextContent content={note.content} updatedAt={note.updatedAt} createdAt={note.createdAt} />
      {/* Label picker */}
      <div className="mt-auto flex justify-center px-4 pt-2">
        <LabelPicker
          allLabels={allLabels}
          selectedLabelId={note.label?.id ?? null}
          onChange={(labelId) => mutation(() => noteService.setLabel(note.id, labelId))}
        />
      </div>
      <TextareaDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(content) => mutation(() => noteService.update(note.id, { content }))}
        title="Edit note"
        placeholder="What's on your mind?"
        initialContent={note.content}
      />
      <SwipeBackEdge onBack={goBack} />
    </DetailPage>
  );
}
