import * as React from "react";

import { cn } from "@/lib/utils";

type BrandMarkProps = React.ComponentProps<"div"> & {
  showName?: boolean;
};

function BrandMark({
  className,
  showName = true,
  "aria-label": ariaLabel = "100 Questions",
  ...props
}: BrandMarkProps) {
  return (
    <div
      data-slot="brand-mark"
      role="img"
      aria-label={ariaLabel}
      className={cn("inline-flex items-center gap-3", className)}
      {...props}
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-emerald-300 text-[11px] font-black tracking-[-0.08em] text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.12),0_8px_24px_-12px_rgba(110,231,183,0.72)]"
      >
        100
      </span>
      {showName ? (
        <span className="text-balance text-sm font-semibold tracking-[-0.015em] text-zinc-50">
          100 Questions
        </span>
      ) : null}
    </div>
  );
}

export { BrandMark };
export type { BrandMarkProps };
