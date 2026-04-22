import { get, set } from "idb-keyval";
import { onMount, task, map } from "nanostores";
const KEY_NAME = "dek";

export type DEKStore =
  | {
      status: "loading";
      dek: null;
    }
  | {
      status: "ready";
      dek: CryptoKey;
    }
  | {
      status: "empty";
      dek: null;
    };

export const $dek = map<DEKStore>({
  status: "loading",
  dek: null,
});

onMount($dek, () => {
  task(async () => {
    const cachedKey = await get<CryptoKey>(KEY_NAME);
    if (cachedKey) {
      $dek.set({ status: "ready", dek: cachedKey });
    } else {
      $dek.set({ status: "empty", dek: null });
    }
  });
});

export async function clearDEK() {
  $dek.set({ status: "empty", dek: null });
  await set(KEY_NAME, null);
}

export async function setDEK(dek: CryptoKey) {
  $dek.set({ status: "ready", dek });
  await set(KEY_NAME, dek);
}
