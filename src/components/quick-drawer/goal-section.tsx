import type { Goal } from "@/models";
import { Renderer } from "@/components/lexical";
import { TextareaDialog } from "@/components";
import { PlusIcon, StarIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { goalService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import { useNavigate } from "@tanstack/react-router";

export function GoalSection({
  goals,
  month,
  onClose,
}: {
  goals: Goal[];
  month: string;
  onClose: () => void;
}) {
  const mutation = useMutation();
  const navigate = useNavigate();
  const [createGoalOpen, setCreateGoalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col w-full">
        {goals.map((goal, index) => (
          <button
            type="button"
            key={goal.id}
            className="flex gap-3 text-left"
            onClick={() => {
              onClose();
              navigate({
                to: "/goal/$id",
                params: { id: goal.id },
              });
            }}
          >
            <div className="flex flex-col items-center">
              <StarIcon
                weight={goal.status === "complete" ? "fill" : "regular"}
                className={
                  goal.status === "complete" ? "size-4 text-gold-light" : "size-4 text-cloud-light"
                }
              />
              {index < goals.length - 1 && (
                <div className="w-px flex-1 border-r border-slate-light border-dotted my-1" />
              )}
            </div>
            <div className="flex-1 min-w-0 pb-4 min-h-10">
              <Renderer content={goal.content} />
            </div>
          </button>
        ))}
        <button
          type="button"
          className="flex items-center gap-2 py-2 text-sm text-cloud-medium transition-colors active:text-cloud-light"
          onClick={() => setCreateGoalOpen(true)}
        >
          <PlusIcon className="size-4" />
          Add a goal
        </button>
      </div>
      <TextareaDialog
        open={createGoalOpen}
        onClose={() => setCreateGoalOpen(false)}
        onSave={async (content) => {
          await mutation(() => goalService.create(month, content));
          setCreateGoalOpen(false);
        }}
        title="New goal"
        initialContent=""
        placeholder="What do you want to achieve this month?"
      />
    </>
  );
}
