"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trackEvent } from "@/lib/analytics";

export function ReadinessEmailOptIn({ website, score }: { website: string; score: number }) {
  const [email, setEmail] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    setState("sending");
    const utm = typeof window === "undefined" ? "" : window.location.search;
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, website, score, utm, company_url: companyUrl }),
    }).catch(() => null);
    if (res?.ok) {
      setState("done");
      trackEvent("lead_captured", { source: "readiness_checker", score });
    } else {
      setState("error");
    }
  }

  if (state === "done") {
    return <p className="mt-6 text-sm text-emerald-400">Sent. Kyle will email you the fix list for {website}.</p>;
  }
  return (
    <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input
        type="text" name="company_url" tabIndex={-1} autoComplete="off"
        aria-hidden="true" value={companyUrl}
        onChange={(e) => setCompanyUrl(e.target.value)}
        style={{ position: "absolute", left: "-10000px", width: 1, height: 1, opacity: 0 }}
      />
      <Input
        type="email" required name="email" placeholder="you@company.com"
        aria-label="Email me the fix list" value={email}
        onChange={(e) => setEmail(e.target.value)} className="h-11"
      />
      <Button type="submit" disabled={state === "sending"}>Email me the fix list</Button>
      {state === "error" ? <p className="text-sm text-red-400">Could not save. Try again.</p> : null}
    </form>
  );
}
