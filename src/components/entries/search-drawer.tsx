import { entryService } from "@/app";
import {
  DrawerCloseButton,
  DrawerContent,
  DrawerRoot,
  DrawerTitle,
} from "@/components/common/drawer";
import { Timeline } from "@/components/entries/timeline";
import type { Entry } from "@/models";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export function SearchDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Entry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when drawer closes; focus input when it opens
  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
    } else {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(() => {
      entryService.search(query, 10).then(setResults);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleEntryClick = (entry: Entry) => {
    onClose();
    if (entry.type === "note") {
      navigate({
        to: "/note/$id",
        params: { id: entry.id },
        viewTransition: { types: ["slide-left"] },
      });
    } else if (entry.type === "task") {
      navigate({
        to: "/task/$id",
        params: { id: entry.id },
        viewTransition: { types: ["slide-left"] },
      });
    } else if (entry.type === "intention") {
      navigate({
        to: "/intention/$id",
        params: { id: entry.id },
        viewTransition: { types: ["slide-left"] },
      });
    }
  };

  return (
    <DrawerRoot
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DrawerContent fullHeight>
        <DrawerTitle>Search</DrawerTitle>
        <div className="flex items-center gap-2 px-2 pb-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-slate-light px-3 py-2">
            <MagnifyingGlassIcon className="size-4 shrink-0 text-cloud-medium" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries…"
              className="flex-1 bg-transparent focus:outline-none text-sm text-ivory-light placeholder:text-cloud-dark outline-none"
            />
          </div>
          <DrawerCloseButton />
        </div>
        <div className="flex-1 overflow-y-auto px-4">
          {query.trim() && results.length === 0 && (
            <p className="mt-8 text-center text-xs text-cloud-light">No results</p>
          )}
          {results.length > 0 && (
            <Timeline entries={results} size="compact" onEntryClick={handleEntryClick} />
          )}
        </div>
      </DrawerContent>
    </DrawerRoot>
  );
}
