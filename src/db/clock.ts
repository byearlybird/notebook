import * as crdt from "@byearlybird/crdt";
import type { Storage } from "./storage";

const STAMP_KEY = "__stamp";

export function createClock(storage: Storage) {
  let clock: crdt.Clock | undefined;

  async function getClock(): Promise<crdt.Clock> {
    if (!clock) {
      const [deviceId, lastStamp] = await Promise.all([
        storage.getDeviceId(),
        storage.get<crdt.Stamp>(STAMP_KEY),
      ]);
      clock = crdt.createClock(deviceId, lastStamp);
    }
    return clock;
  }

  return {
    async tick(): Promise<crdt.Stamp> {
      const clock = await getClock();
      const stamp = clock.tick();
      await storage.set(STAMP_KEY, stamp);
      return stamp;
    },
  };
}

export type Clock = ReturnType<typeof createClock>;
