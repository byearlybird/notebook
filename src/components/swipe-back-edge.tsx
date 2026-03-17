import { CaretLeftIcon } from "@phosphor-icons/react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useCallback } from "react";

type SwipeBackEdgeProps = {
  onBack: () => void;
};

const THRESHOLD_RATIO = 0.3;
const MAX_DRAG_RATIO = 0.5;
const VELOCITY_THRESHOLD = 500;

export function SwipeBackEdge({ onBack }: SwipeBackEdgeProps) {
  const x = useMotionValue(0);

  const maxDrag = window.innerWidth * MAX_DRAG_RATIO;
  const circleX = useTransform(x, [0, maxDrag], [-48, maxDrag - 24]);
  const circleScale = useTransform(x, [0, window.innerWidth * THRESHOLD_RATIO], [0.3, 1], {
    clamp: true,
  });
  const circleOpacity = useTransform(x, [0, 30], [0, 1], { clamp: true });

  const handleDragEnd = useCallback(
    (_: unknown, info: { velocity: { x: number } }) => {
      const position = x.get();
      const threshold = window.innerWidth * THRESHOLD_RATIO;
      if (position > threshold || info.velocity.x > VELOCITY_THRESHOLD) {
        onBack();
      }
    },
    [onBack, x],
  );

  return (
    <>
      {/* Visual indicator circle */}
      <motion.div
        className="pointer-events-none fixed top-1/2 left-0 z-50 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-slate-dark shadow border border-cloud-dark"
        style={{ x: circleX, scale: circleScale, opacity: circleOpacity }}
      />
      <motion.div
        className="pointer-events-none fixed top-1/2 left-0 z-50 flex size-12 -translate-y-1/2 items-center justify-center"
        style={{ x: circleX, opacity: circleOpacity }}
      >
        <CaretLeftIcon className="size-5 text-cloud-medium" />
      </motion.div>

      {/* Invisible drag handle on left edge */}
      <motion.div
        className="fixed top-0 left-0 z-40 h-full w-10 touch-none"
        drag="x"
        dragConstraints={{ left: 0, right: window.innerWidth * MAX_DRAG_RATIO }}
        dragElastic={0}
        dragSnapToOrigin
        dragTransition={{ bounceStiffness: 400, bounceDamping: 30 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
      />
    </>
  );
}
