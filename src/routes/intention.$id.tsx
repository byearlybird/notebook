import {
  MenuButton,
  MenuContent,
  MenuItem,
  MenuRoot,
  TextContent,
  TextareaDialog,
} from "@/components";
import {
  DetailPage,
  DetailPageHeader,
  DetailPageActions,
  DetailPageTitle,
} from "@/components/page/detail-page";
import { intentionService } from "@/app";
import { intentionQueryOptions } from "@/queries";
import { useMutation } from "@/utils/use-mutation";
import { PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

const searchSchema = z.object({
  from: z.enum(["index", "entries"]).optional().catch(undefined),
});

export const Route = createFileRoute("/intention/$id")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  loader: async ({ params, context: { queryClient } }) => {
    await queryClient.ensureQueryData(intentionQueryOptions(params.id));
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: intention } = useSuspenseQuery(intentionQueryOptions(id));
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const mutation = useMutation();

  const goBack = () => {
    if (from === "entries") {
      navigate({
        to: "/app",
        search: { view: "entries" },
        viewTransition: { types: ["slide-right"] },
      });
    } else {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    }
  };

  return (
    <DetailPage onGoBack={goBack}>
      <DetailPageHeader>
        <DetailPageTitle>
          <span className="font-medium">Intention</span>
        </DetailPageTitle>
        <DetailPageActions>
          <MenuRoot>
            <MenuButton />
            <MenuContent>
              <MenuItem onClick={() => setEditOpen(true)}>
                <PencilSimpleIcon className="size-4" />
                Edit
              </MenuItem>
              <MenuItem
                onClick={async () => {
                  await mutation(() => intentionService.delete(intention.id));
                  goBack();
                }}
                variant="destructive"
              >
                <TrashIcon className="size-4" />
                Delete
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </DetailPageActions>
      </DetailPageHeader>

      <TextContent
        content={intention.content}
        updatedAt={intention.updatedAt}
        createdAt={intention.createdAt}
      />

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
    </DetailPage>
  );
}
