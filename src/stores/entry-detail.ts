import { atom } from "nanostores";

export const $selectedEntryId = atom<string | null>(null);

export function openEntryDetail(id: string) {
  $selectedEntryId.set(id);
}

export function closeEntryDetail() {
  $selectedEntryId.set(null);
}
