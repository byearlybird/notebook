import { z } from "zod";
import { oc } from "@orpc/contract";

const pushChangesContract = oc
  .input(z.object({ changes: z.array(z.string()) }))
  .output(z.object({ seqs: z.array(z.number()), maxSeq: z.number() }));

const pullChangesContract = oc
  .input(
    z.object({
      since: z.number().int().nonnegative().default(0),
      limit: z.number().int().positive().optional(),
    }),
  )
  .output(
    z.object({
      changes: z.array(z.object({ seq: z.number(), cyphertext: z.string() })),
      maxSeq: z.number(),
      hasMore: z.boolean(),
    }),
  );

const wrappedKeySchema = z.object({
  wrappedKey: z.string(),
  salt: z.string(),
  iv: z.string(),
});

const getWrappedKeyContract = oc.output(wrappedKeySchema.nullable());

const setWrappedKeyContract = oc.input(wrappedKeySchema).output(z.object({ success: z.boolean() }));

const changeWrappedKeyContract = oc
  .input(wrappedKeySchema)
  .output(z.object({ success: z.boolean() }));

export const appContract = {
  pushChanges: pushChangesContract,
  pullChanges: pullChangesContract,
  getWrappedKey: getWrappedKeyContract,
  setWrappedKey: setWrappedKeyContract,
  changeWrappedKey: changeWrappedKeyContract,
};
