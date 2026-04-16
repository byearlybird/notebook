import { RPCLink } from "@orpc/client/fetch";
import { createORPCClient } from "@orpc/client";
import type { ContractRouterClient } from "@orpc/contract";
import { appContract } from "../worker/contract";

const link = new RPCLink({
  url: "./api",
});

export const api: ContractRouterClient<typeof appContract> = createORPCClient(link);
