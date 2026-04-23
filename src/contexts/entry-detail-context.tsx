import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { EntryDetail } from "@/components/entry-detail";

type EntryDetailContextValue = {
  selectedId: string | null;
  openDetail: (id: string) => void;
};

const EntryDetailContext = createContext<EntryDetailContextValue | null>(null);

export function useEntryDetail() {
  const ctx = useContext(EntryDetailContext);
  if (!ctx) throw new Error("useEntryDetail must be used within EntryDetailProvider");
  return ctx;
}

export function EntryDetailProvider({ children }: { children: ReactNode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <EntryDetailContext.Provider value={{ selectedId, openDetail: setSelectedId }}>
      {children}
      <EntryDetail
        id={selectedId}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </EntryDetailContext.Provider>
  );
}
