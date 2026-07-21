"use client";

import { Ban, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CancelRunButton({ runId }: { runId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function cancel() {
    if (
      !window.confirm(
        "Cancel this benchmark? Completed evidence will be kept. A provider call already in flight may finish, but no new calls will start.",
      )
    ) {
      return;
    }

    setPending(true);
    const response = await fetch(`/api/runs/${runId}/cancel`, {
      method: "POST",
    });

    if (response.ok) {
      router.refresh();
      return;
    }

    setPending(false);
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    window.alert(payload?.error ?? "This benchmark could not be cancelled.");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={cancel}
    >
      {pending ? <LoaderCircle className="animate-spin" /> : <Ban />}
      {pending ? "Cancelling" : "Cancel run"}
    </Button>
  );
}
