"use client";

import { Download, LoaderCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

export function ReportActions({ runId }: { runId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rerun() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/runs/${runId}/rerun`, {
        method: "POST",
        headers: { "idempotency-key": crypto.randomUUID() },
      });
      const data = (await response.json()) as { run?: { id: string }; error?: string };
      if (!response.ok || !data.run) throw new Error(data.error ?? "The rerun could not be started.");
      trackEvent("rerun_started", { baseline_run_id: runId, run_id: data.run.id });
      router.push(`/runs/${data.run.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The rerun could not be started.");
      setPending(false);
    }
  }

  function exported(format: "pdf" | "csv") {
    trackEvent("report_exported", { run_id: runId, format });
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button asChild variant="outline" size="sm">
        <a href={`/api/runs/${runId}/export?format=pdf`} onClick={() => exported("pdf")}><Download /> PDF</a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={`/api/runs/${runId}/export?format=csv`} onClick={() => exported("csv")}><Download /> CSV</a>
      </Button>
      <Button type="button" size="sm" onClick={() => void rerun()} disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}{pending ? "Starting…" : "Rerun this benchmark"}
      </Button>
      {error ? <p role="alert" className="basis-full text-right text-xs text-red-300">{error}</p> : null}
    </div>
  );
}
