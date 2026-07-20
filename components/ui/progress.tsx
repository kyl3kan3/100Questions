import * as React from "react";

import { cn } from "@/lib/utils";

type ProgressProps = React.ComponentProps<"div"> & {
  value?: number;
  max?: number;
};

function Progress({
  className,
  value = 0,
  max = 100,
  ...props
}: ProgressProps) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const safeValue = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), safeMax)
    : 0;
  const percentage = (safeValue / safeMax) * 100;

  return (
    <div
      data-slot="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={safeValue}
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-white/[0.07] tabular-nums shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),inset_0_1px_2px_rgba(0,0,0,0.25)]",
        className,
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className="h-full rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.42)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export { Progress };
export type { ProgressProps };
