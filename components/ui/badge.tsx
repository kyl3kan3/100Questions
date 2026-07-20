import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-6 w-fit shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none tabular-nums shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] [&_svg]:size-3 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-emerald-300/14 text-emerald-200",
        secondary: "bg-white/[0.07] text-zinc-300",
        outline: "bg-transparent text-zinc-300",
        success: "bg-emerald-400/12 text-emerald-200",
        warning: "bg-amber-400/12 text-amber-200",
        destructive: "bg-red-400/12 text-red-200",
        info: "bg-sky-400/12 text-sky-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
