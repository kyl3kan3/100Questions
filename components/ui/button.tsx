import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold outline-none select-none transition-[color,background-color,box-shadow,scale] duration-150 ease-out focus-visible:ring-2 focus-visible:ring-emerald-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-300 text-zinc-950 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_-12px_rgba(110,231,183,0.7)] hover:bg-emerald-200 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_10px_28px_-12px_rgba(110,231,183,0.8)]",
        secondary:
          "bg-white/[0.07] text-zinc-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.09),0_1px_2px_rgba(0,0,0,0.24)] hover:bg-white/[0.11] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.24)]",
        outline:
          "bg-transparent text-zinc-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)] hover:bg-white/[0.06] hover:text-white hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18)]",
        ghost: "text-zinc-300 hover:bg-white/[0.07] hover:text-white",
        destructive:
          "bg-red-500 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_24px_-14px_rgba(239,68,68,0.8)] hover:bg-red-400",
        link: "min-h-0 min-w-0 rounded-none px-0 text-emerald-300 underline-offset-4 hover:text-emerald-200 hover:underline focus-visible:ring-offset-4",
      },
      size: {
        default:
          "h-11 px-4 [&:has(>svg:first-child)]:pl-3.5 [&:has(>svg:last-child)]:pr-3.5",
        sm: "h-10 px-3.5 text-xs [&:has(>svg:first-child)]:pl-3 [&:has(>svg:last-child)]:pr-3",
        lg: "h-12 px-5 text-base [&:has(>svg:first-child)]:pl-4.5 [&:has(>svg:last-child)]:pr-4.5",
        icon: "size-10 p-0",
        "icon-lg": "size-12 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  static: isStatic = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    static?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size }),
        !isStatic && "active:scale-[0.96]",
        className,
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
