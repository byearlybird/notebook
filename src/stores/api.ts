import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { appContract } from "../../worker/contract";
import { atom } from "nanostores";

export type APIClient = ContractRouterClient<typeof appContract>;

export type APIStore =
  | {
      status: "authed";
      client: APIClient;
    }
  | {
      status: "unauthed";
      client: null;
    };

export const $api = atom<APIStore>({
  status: "unauthed",
  client: null,
});

export function setAuthed(getToken: () => Promise<string | null>) {
  $api.set({ status: "authed", client: createAPIClient(getToken) });
}

export function setUnauthed() {
  $api.set({ status: "unauthed", client: null });
}

function createAPIClient(getToken: () => Promise<string | null>): APIClient {
  const link = new RPCLink({
    url: "http://localhost:5173/api",
    headers: async () => {
      const token = await getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  });

  return createORPCClient(link);
}
