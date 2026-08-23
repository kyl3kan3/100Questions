"use client";

import { Check, ClipboardCopy, Download, FileCode2 } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type BuilderSnapshot = {
  content: string;
  name: string;
  summary: string;
  links: Array<{ label: string; url: string; description: string }>;
};

export function LlmsTxtBuilder() {
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [links, setLinks] = useState("");
  const [snapshot, setSnapshot] = useState<BuilderSnapshot | null>(null);
  const [copied, setCopied] = useState(false);

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedLinks = parseLinks(links);
    const trimmedName = name.trim();
    const trimmedSummary = summary.trim();
    if (!trimmedName || !trimmedSummary || parsedLinks.length === 0) return;

    const content = [
      `# ${trimmedName}`,
      "",
      `> ${trimmedSummary}`,
      "",
      "## Key pages",
      "",
      ...parsedLinks.map(
        ({ label, url, description }) =>
          `- [${label}](${url})${description ? `: ${description}` : ""}`,
      ),
      "",
    ].join("\n");

    setSnapshot({
      content,
      name: trimmedName,
      summary: trimmedSummary,
      links: parsedLinks,
    });
    setCopied(false);
  }

  async function copy() {
    if (!snapshot) return;
    try {
      await navigator.clipboard.writeText(snapshot.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    } catch {
      setCopied(false);
    }
  }

  function download() {
    if (!snapshot) return;
    const blob = new Blob([snapshot.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "llms.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section
      id="generator"
      className="scroll-mt-24 rounded-[28px] bg-[#0a0d0b] p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_18px_60px_-32px_rgba(0,0,0,0.9)]"
      aria-labelledby="llms-builder-heading"
    >
      <div className="rounded-[20px] bg-[#0d110f] p-5 sm:p-7 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Free llms.txt generator</p>
            <h2
              id="llms-builder-heading"
              className="mt-4 max-w-xl text-balance text-3xl font-semibold tracking-[-0.035em] text-white"
            >
              Generate a concise, standards-aligned starting file
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-6 text-zinc-400">
              The proposed format starts with one H1, a blockquote summary,
              and Markdown lists of important pages. Edit the result before
              publishing it at your site root.
            </p>
          </div>

          <form onSubmit={generate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="llms-name">Site or project name</Label>
              <Input
                id="llms-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Acme Analytics"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="llms-summary">One-sentence canonical summary</Label>
              <Textarea
                id="llms-summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Acme helps operations teams compare warehouse performance using source-linked benchmarks."
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="llms-links">Important pages</Label>
              <Textarea
                id="llms-links"
                value={links}
                onChange={(event) => setLinks(event.target.value)}
                placeholder={"Product | https://example.com/product | Capabilities and fit\nMethodology | https://example.com/methodology | How results are calculated"}
                className="min-h-32 font-mono text-xs"
              />
              <p className="text-xs leading-5 text-zinc-400">
                One per line: Label | absolute URL | optional description
              </p>
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!name.trim() || !summary.trim() || parseLinks(links).length === 0}
            >
              Generate llms.txt <FileCode2 aria-hidden="true" />
            </Button>
          </form>
        </div>

        {snapshot ? (
          <div className="animate-enter mt-8 grid gap-4 border-t border-white/[0.08] pt-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="overflow-hidden rounded-[20px] bg-black/30 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
                <span className="font-mono text-xs text-zinc-400">/llms.txt</span>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={() => void copy()}>
                    {copied ? <Check aria-hidden="true" /> : <ClipboardCopy aria-hidden="true" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={download}>
                    <Download aria-hidden="true" /> Download
                  </Button>
                </div>
              </div>
              <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap p-5 font-mono text-xs leading-6 text-zinc-300">
                {snapshot.content}
              </pre>
            </div>
            <aside className="rounded-[20px] bg-emerald-300 p-6 text-zinc-950">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em]">
                Format check
              </p>
              <ul className="mt-5 space-y-4 text-sm leading-6">
                <CheckItem text="One H1 project name" />
                <CheckItem text="Blockquote summary follows the H1" />
                <CheckItem text={`${snapshot.links.length} absolute page link${snapshot.links.length === 1 ? "" : "s"}`} />
                <CheckItem text="Markdown list under a named H2 section" />
              </ul>
              <p className="mt-6 text-xs leading-5 text-zinc-800">
                This validates the generated structure, not adoption by a
                particular model or any visibility improvement.
              </p>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex gap-3">
      <Check className="mt-1 size-4 shrink-0" aria-hidden="true" />
      <span>{text}</span>
    </li>
  );
}

function parseLinks(value: string) {
  return value
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [label = "", url = "", description = ""] = line
        .split("|")
        .map((part) => part.trim());
      try {
        const parsed = new URL(url);
        if (!/^https?:$/u.test(parsed.protocol)) return [];
        return [{ label: label || parsed.hostname, url: parsed.toString(), description }];
      } catch {
        return [];
      }
    });
}
