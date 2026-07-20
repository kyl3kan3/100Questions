import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#070908] px-6 text-center text-zinc-100">
      <div>
        <div className="mb-8 flex justify-center"><BrandMark /></div>
        <p className="eyebrow">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">Benchmark not found</h1>
        <p className="mt-3 text-sm text-zinc-400">It may have expired, been deleted, or belong to another account.</p>
        <Button asChild className="mt-7"><Link href="/dashboard">Back to dashboard</Link></Button>
      </div>
    </main>
  );
}
