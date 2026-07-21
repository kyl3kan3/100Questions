import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { CancelRunButton } from "@/components/cancel-run-button";
import { DeleteRunButton } from "@/components/delete-run-button";
import { RunProgress } from "@/components/run-progress";
import { Button } from "@/components/ui/button";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getRunForUser } from "@/lib/runs";

export const metadata: Metadata = {
  title: "Benchmark run",
  alternates: { canonical: null },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: Promise<{ runId: string }> }) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { runId } = await params;
  const run = await getRunForUser(runId, user.id);

  if (!run) {
    notFound();
  }

  const active = ["queued", "generating", "querying", "analyzing"].includes(
    run.status,
  );

  return (
    <main className="min-h-screen bg-[#070908] text-zinc-100">
      <AppHeader email={user.email} />
      <div className="page-shell py-8 md:py-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard"><ArrowLeft /> Dashboard</Link>
          </Button>
          {active ? (
            <CancelRunButton runId={run.id} />
          ) : (
            <DeleteRunButton runId={run.id} />
          )}
        </div>
        <RunProgress
          initialRun={{
            ...run,
            createdAt: run.createdAt.toISOString(),
          }}
        />
      </div>
    </main>
  );
}
