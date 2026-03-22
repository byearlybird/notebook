import { format, parseISO } from "date-fns";
import { Renderer } from "@/components/lexical";

export function TextContent({
  content,
  updatedAt,
  createdAt,
}: {
  content: string;
  updatedAt: string;
  createdAt: string;
}) {
  const isEdited = updatedAt !== createdAt;
  const editedTime = isEdited ? format(parseISO(updatedAt), "M/d/yy h:mm a") : null;

  return (
    <section className="flex-1 px-4 py-2 pb-2">
      <div className="rounded-md p-4 items-center flex">
        <div className="flex flex-col">
          <Renderer content={content} />
        </div>
      </div>
      {editedTime && (
        <time
          className="flex items-center gap-2 px-4 text-sm text-cloud-medium"
          dateTime={updatedAt}
        >
          Edited {editedTime}
        </time>
      )}
    </section>
  );
}
