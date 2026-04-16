export function parseHlc(hlc: string): { wall: number; count: number; nodeId: string } {
  const [wallStr, countStr, nodeId] = hlc.split("@");
  return { wall: Number(wallStr), count: Number(countStr), nodeId };
}

/**
 * Three-way HLC merge used when receiving remote changes.
 *
 * new_wall = max(localWall, remoteWall, now)
 * count:
 *   - both walls matched new_wall → max(localCount, remoteCount) + 1
 *   - only local wall matched     → localCount + 1
 *   - only remote wall matched    → remoteCount + 1
 *   - now advanced past both      → 0
 */
export function mergeHlc(
  localWall: number,
  localCount: number,
  remoteWall: number,
  remoteCount: number,
  now: number,
): { wall: number; count: number } {
  const wall = Math.max(localWall, remoteWall, now);

  let count: number;
  if (wall === localWall && wall === remoteWall) {
    count = Math.max(localCount, remoteCount) + 1;
  } else if (wall === localWall) {
    count = localCount + 1;
  } else if (wall === remoteWall) {
    count = remoteCount + 1;
  } else {
    count = 0;
  }

  return { wall, count };
}
