"use client";

import { useEffect } from "react";

type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute(input: Record<string, unknown>): Promise<unknown>;
};

type ModelContext = {
  registerTool(
    tool: WebMcpTool,
    options?: { signal?: AbortSignal },
  ): Promise<void>;
};

type ModelContextDocument = Document & { modelContext?: ModelContext };
type ModelContextNavigator = Navigator & { modelContext?: ModelContext };

const resources = [
  {
    name: "AI visibility checker",
    url: "https://100questionsai.com/ai-visibility-checker",
    description: "Free technical readiness check for a public website.",
  },
  {
    name: "AI visibility methodology",
    url: "https://100questionsai.com/methodology",
    description: "Definitions, grounding rules, metrics, and limitations.",
  },
  {
    name: "2026 AI Visibility Index",
    url: "https://100questionsai.com/ai-visibility-index",
    description: "Preregistered study with downloadable source data.",
  },
] as const;

export function WebMcpTools() {
  useEffect(() => {
    // The current draft exposes Document.modelContext. The Navigator fallback
    // keeps compatibility with the earlier Chrome origin-trial implementation.
    const modelContext =
      (document as ModelContextDocument).modelContext ??
      (navigator as ModelContextNavigator).modelContext;
    if (!modelContext?.registerTool) return;

    const controller = new AbortController();

    void modelContext
      .registerTool(
        {
          name: "get-ai-visibility-resources",
          title: "Get AI visibility resources",
          description:
            "Return the official 100 Questions public resources for checking, measuring, and understanding AI search visibility.",
          inputSchema: {
            type: "object",
            properties: {},
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute: async () => ({ resources }),
        },
        { signal: controller.signal },
      )
      .catch(() => undefined);

    void modelContext
      .registerTool(
        {
          name: "check-ai-visibility-readiness",
          title: "Check AI visibility readiness",
          description:
            "Run the free technical readiness check for one public website. This reads public pages only and does not measure current AI rankings.",
          inputSchema: {
            type: "object",
            required: ["website"],
            additionalProperties: false,
            properties: {
              website: {
                type: "string",
                maxLength: 500,
                description: "Public website domain, such as example.com.",
              },
            },
          },
          annotations: { readOnlyHint: true, untrustedContentHint: true },
          execute: async (input) => {
            const website =
              typeof input.website === "string" ? input.website.trim() : "";
            if (!website || website.length > 500) {
              throw new Error("A public website domain is required.");
            }

            const response = await fetch("/api/tools/ai-readiness", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ website }),
            });
            const result = (await response.json().catch(() => null)) as
              | Record<string, unknown>
              | null;
            if (!response.ok || !result) {
              throw new Error("The website could not be checked.");
            }
            return result;
          },
        },
        { signal: controller.signal },
      )
      .catch(() => undefined);

    return () => controller.abort();
  }, []);

  return null;
}
