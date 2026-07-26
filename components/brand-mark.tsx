import * as React from "react";
import Image from "next/image";

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
      <Image
        aria-hidden="true"
        src="/logo-mark.svg"
        alt="100 Questions logo"
        width={40}
        height={40}
        className="size-10 shrink-0 drop-shadow-[0_8px_18px_rgba(110,231,183,0.2)]"
        priority
      />
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
