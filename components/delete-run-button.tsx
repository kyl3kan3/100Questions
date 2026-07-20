"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function DeleteRunButton({ runId, disabled = false }: { runId: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function remove() {
    if (!window.confirm("Delete this benchmark and its retained answers? This cannot be undone.")) {
      return;
    }

    setPending(true);
    const response = await fetch(`/api/runs/${runId}`, { method: "DELETE" });

    if (response.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setPending(false);
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    window.alert(payload?.error ?? "This benchmark could not be deleted.");
  }

  return (
    <Button type="button" variant="ghost" size="sm" disabled={disabled || pending} onClick={remove}>
      {pending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
      Delete
    </Button>
  );
}
