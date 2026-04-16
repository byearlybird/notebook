import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { appContract } from "../worker/contract";
import type { ChangeTransport, KeyTransport } from "./transport";

const link = new RPCLink({
  url: "http://localhost:5173/api",
});

const api: ContractRouterClient<typeof appContract> = createORPCClient(link);

export const keyTransport: KeyTransport = {
  getWrappedKey: () => api.getWrappedKey({}),
  setWrappedKey: (key) => api.setWrappedKey(key).then(() => undefined),
  changeWrappedKey: (key) => api.changeWrappedKey(key).then(() => undefined),
};

export const changeTransport: ChangeTransport = {
  pullChanges: (since) => api.pullChanges({ since }),
  pushChanges: (changes) => api.pushChanges({ changes }).then(() => undefined),
};
