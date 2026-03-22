import { Button } from "@/components/common/button";
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
import { SwipeBackEdge } from "@/components/swipe-back-edge";
import { taskService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareRightIcon,
  CaretLeftIcon,
  CheckSquareIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import z from "zod";
import type { Task } from "@/models";

const taskSearchSchema = z.object({
  from: z.enum(["index", "entries"]).optional().catch(undefined),
});

export const Route = createFileRoute("/task/$id")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => taskSearchSchema.parse(search),
  loader: async ({ params }) => {
    try {
      const task = await taskService.get(params.id);
      let rolledTask: Task | undefined;
      if (!task) throw notFound();
      if (task.status === "deferred") {
        rolledTask = await taskService.getFirstByOriginalId(task.id);
      }
      return { task, rolledTask };
    } catch {
      throw notFound();
    }
  },
});

function RouteComponent() {
  const { task, rolledTask } = Route.useLoaderData();
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();
  const mutation = useMutation();
  const [editOpen, setEditOpen] = useState(false);

  const handleComplete = () => {
    mutation(() => taskService.update(task.id, { status: "complete" }));
  };

  const handleCancel = () => {
    mutation(() => taskService.update(task.id, { status: "canceled" }));
  };

  const handleReset = () => {
    mutation(() => taskService.update(task.id, { status: "incomplete" }));
  };

  const handleDelete = () => {
    taskService.delete(task.id);
    handleBack();
  };

  const handleBack = () => {
    if (from === "index") {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    } else if (from === "entries") {
      navigate({ to: "/app/entries", viewTransition: { types: ["slide-right"] } });
    } else {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    }
  };

  const formattedDate = format(parseISO(task.date), "MMMM d");
  const createdTime = format(parseISO(task.createdAt), "h:mm a");

  return (
    <div className="flex min-h-screen flex-col max-w-2xl mx-auto pt-safe-top pb-safe-bottom">
      {/* Header row */}
      <header className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={handleBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
        <div className="flex-1 text-center flex flex-col justify-between gap-2">
          <time className="font-medium" dateTime={task.date}>
            {formattedDate}
          </time>
          <time className="block text-xs text-cloud-medium" dateTime={task.createdAt}>
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
      <TextContent content={task.content} updatedAt={task.updatedAt} createdAt={task.createdAt} />
      {/* Controls section */}
      <section className="flex w-full gap-2 px-4 pb-safe-bottom pt-2">
        {task.status === "incomplete" ? (
          <>
            <Button onClick={handleCancel} variant="slate">
              <XSquareIcon />
              Cancel task
            </Button>
            <Button onClick={handleComplete}>
              <CheckSquareIcon />
              Complete
            </Button>
          </>
        ) : task.status === "deferred" ? (
          <Button
            variant="slate"
            disabled={!rolledTask}
            onClick={() =>
              rolledTask &&
              navigate({
                to: "/task/$id",
                params: { id: rolledTask.id },
                search: { from },
                viewTransition: { types: ["slide-left"] },
              })
            }
          >
            <ArrowSquareRightIcon />
            Deferred
          </Button>
        ) : (
          <Button variant="slate" onClick={handleReset}>
            <ArrowCounterClockwiseIcon />
            {task.status === "complete" ? "Complete" : "Canceled"}
          </Button>
        )}
      </section>
      <TextareaDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(content) => mutation(() => taskService.update(task.id, { content }))}
        title="Edit task"
        placeholder="What needs to be done?"
        initialContent={task.content}
      />
      <SwipeBackEdge onBack={handleBack} />
    </div>
  );
}
