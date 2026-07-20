import { LogOut } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export function AppHeader({ email }: { email: string }) {
  return (
    <header className="border-b border-white/[0.07] bg-[#070908]/95">
      <div className="page-shell flex h-16 items-center justify-between gap-4">
        <Link href="/dashboard" aria-label="100Questions dashboard">
          <BrandMark />
        </Link>
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden max-w-56 truncate text-xs text-zinc-400 sm:block">
            {email}
          </span>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut /> <span className="hidden sm:inline">Sign out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
