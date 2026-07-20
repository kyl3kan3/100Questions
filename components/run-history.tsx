import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { RunSummary } from "@/lib/runs";

export function RunHistory({ runs }: { runs: RunSummary[] }) {
  return (
    <Card className="bg-[#0b0e0c]">
      <CardHeader className="border-b border-white/[0.07] pb-5">
        <CardTitle>Run history</CardTitle>
        <CardDescription>
          Private benchmarks are retained for the configured retention window.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {runs.length ? (
          <ul className="divide-y divide-white/[0.07]">
            {runs.map((run) => (
              <li key={run.id}>
                <Link
                  href={`/runs/${run.id}`}
                  className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300/60"
                >
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-zinc-200">
                        {run.subjectName}
                      </p>
                      <RunStatus status={run.status} />
                    </div>
                    <p className="truncate text-xs text-zinc-400">
                      {run.canonicalDomain} · {run.questionCountPlanned} questions ·{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(run.createdAt)}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-zinc-400 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-300" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-zinc-400">No benchmarks yet.</p>
            <p className="mt-1 text-xs text-zinc-400">
              Purchase a credit, then define the first subject above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RunStatus({ status }: { status: string }) {
  const variant =
    status === "complete"
      ? "success"
      : status === "failed" || status === "cancelled"
        ? "destructive"
        : status === "partial"
          ? "warning"
          : "info";

  return (
    <Badge variant={variant} className="min-h-5 px-2 py-0.5 text-[10px] capitalize">
      {status}
    </Badge>
  );
}
