import { Button } from "@/components/common/button";
import {
  MenuButton,
  MenuContent,
  MenuItem,
  MenuRoot,
  LabelPicker,
  TextContent,
  TextareaDialog,
} from "@/components";
import {
  DetailPage,
  DetailPageHeader,
  DetailPageActions,
  DetailPageTitle,
} from "@/components/page/detail-page";
import { labelService, taskService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareRightIcon,
  CheckSquareIcon,
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
      const allLabels = await labelService.getAll();
      return { task, rolledTask, allLabels };
    } catch {
      throw notFound();
    }
  },
});

function RouteComponent() {
  const { task, rolledTask, allLabels } = Route.useLoaderData();
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
      navigate({
        to: "/app",
        search: { view: "entries" },
        viewTransition: { types: ["slide-right"] },
      });
    } else {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    }
  };

  const formattedDate = format(parseISO(task.date), "MMMM d");
  const createdTime = format(parseISO(task.createdAt), "h:mm a");

  return (
    <DetailPage onGoBack={handleBack}>
      {/* Header row */}
      <DetailPageHeader>
        <DetailPageTitle>
          <time className="font-medium" dateTime={task.date}>
            {formattedDate}
          </time>
          <time className="block text-xs text-cloud-medium" dateTime={task.createdAt}>
            {createdTime}
          </time>
        </DetailPageTitle>
        <DetailPageActions>
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
      <TextContent content={task.content} updatedAt={task.updatedAt} createdAt={task.createdAt} />
      {/* Label picker */}
      <div className="mt-auto flex justify-center px-4 pt-2 pb-3">
        <LabelPicker
          allLabels={allLabels}
          selectedLabelId={task.label?.id ?? null}
          onChange={(labelId) => mutation(() => taskService.setLabel(task.id, labelId))}
        />
      </div>
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
    </DetailPage>
  );
}
