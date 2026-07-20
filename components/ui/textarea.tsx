import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-28 w-full resize-y rounded-xl bg-white/[0.055] px-3.5 py-3 text-pretty text-sm leading-6 text-zinc-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_1px_2px_rgba(0,0,0,0.24)] outline-none transition-[background-color,box-shadow,color] duration-150 ease-out placeholder:text-zinc-400 hover:bg-white/[0.075] hover:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_1px_2px_rgba(0,0,0,0.24)] focus-visible:bg-white/[0.08] focus-visible:shadow-[inset_0_0_0_1px_rgba(110,231,183,0.8),0_0_0_3px_rgba(110,231,183,0.12)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:shadow-[inset_0_0_0_1px_rgba(248,113,113,0.85),0_0_0_3px_rgba(248,113,113,0.12)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
