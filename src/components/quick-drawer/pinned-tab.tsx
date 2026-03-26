import { Renderer } from "@/components/lexical/renderer";
import type { Intention, Note } from "@/models";
import { CircleIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { IntentionSection } from "./intention-section";

export function PinnedTab({
  intention,
  month,
  pinnedNotes,
}: {
  intention: Intention | null;
  month: string;
  pinnedNotes: Note[];
}) {
  const navigate = useNavigate();

  return (
    <>
      <IntentionSection intention={intention} month={month} />
      <section className="">
        {pinnedNotes.map((note) => (
          <button
            key={note.id}
            type="button"
            className="w-full flex items-center rounded-md -mx-2 px-2 py-2.5 text-left transition-colors active:bg-slate-light/50 gap-2.5"
            onClick={() =>
              navigate({
                to: "/note/$id",
                params: { id: note.id },
                viewTransition: { types: ["slide-left"] },
              })
            }
          >
            <CircleIcon className="size-4 shrink-0 text-cloud-light" />
            <div className="min-w-0 flex-1 line-clamp-3 text-sm">
              <Renderer content={note.content} />
            </div>
          </button>
        ))}
      </section>
    </>
  );
}
