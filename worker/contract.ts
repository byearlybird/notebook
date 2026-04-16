import { z } from "zod";
import { oc } from "@orpc/contract";

const pushChangesContract = oc
  .input(z.object({ req_id: z.uuid(), changes: z.array(z.string()) }))
  .output(z.object({ push_id: z.uuid(), seqs: z.array(z.number()), max_seq: z.number() }));

const pullChangesContract = oc
  .input(z.object({ since: z.number().int().nonnegative().default(0) }))
  .output(
    z.object({
      changes: z.array(z.object({ seq: z.number(), cyphertext: z.string() })),
      max_seq: z.number(),
      has_more: z.boolean(),
    }),
  );

export const appContract = {
  pushChanges: pushChangesContract,
  pullChanges: pullChangesContract,
};
