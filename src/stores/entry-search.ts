import { atom, effect } from "nanostores";

export const $searchTerm = atom("");
export const $debouncedSearchTerm = atom("");
export type LabelFilter = { id: string; name: string } | null;
export const $labelFilter = atom<LabelFilter>(null);

effect($searchTerm, (value) => {
  const timer = setTimeout(() => $debouncedSearchTerm.set(value), 300);
  return () => clearTimeout(timer);
});
