import { Button } from "@/components/button";
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
import { useDeleteGoal, useSetGoalStatus, useUpdateGoal } from "@/features/monthly-log";
import { goalService } from "@/app";
import {
  ArrowCounterClockwiseIcon,
  CaretLeftIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/goal/$id")({
  component: RouteComponent,
  loader: async ({ params }) => {
    const goal = await goalService.get(params.id);
    if (!goal) {
      throw notFound();
    }
    return { goal };
  },
});

function RouteComponent() {
  const { goal } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const setGoalStatus = useSetGoalStatus();
  const deleteGoal = useDeleteGoal();
  const updateGoal = useUpdateGoal();

  const isComplete = goal.status === "complete";

  const goBack = () => {
    navigate({
      to: "/app",
      viewTransition: { types: ["slide-right"] },
    });
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
          <span className="font-medium">Goal</span>
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
                    await deleteGoal(goal.id);
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

      <TextContent content={goal.content} updatedAt={goal.updated_at} createdAt={goal.created_at} />

      <section className="flex w-full gap-2 px-4 pb-safe-bottom pt-2">
        {isComplete ? (
          <Button variant="slate" onClick={() => setGoalStatus(goal.id, "incomplete")}>
            <ArrowCounterClockwiseIcon />
            Complete
          </Button>
        ) : (
          <Button onClick={() => setGoalStatus(goal.id, "complete")}>
            <StarIcon />
            Complete
          </Button>
        )}
      </section>

      <TextareaDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={async (content) => {
          await updateGoal(goal.id, { content });
          setEditOpen(false);
        }}
        title="Edit goal"
        initialContent={goal.content}
      />
      <SwipeBackEdge onBack={goBack} />
    </div>
  );
}
