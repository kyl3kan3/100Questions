import { afterEach, describe, expect, it, vi } from "vitest";

const { generate } = vi.hoisted(() => ({ generate: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("@/lib/config", () => ({ PROVIDERS: ["openai", "anthropic", "google", "xai"] }));
vi.mock("ai", async (importOriginal) => ({
  ...await importOriginal<typeof import("ai")>(),
  generateText: generate,
}));

import { analyzeAnswer } from "./analyze";
import { askFirstPickChange, askFirstPickVerdict, type FirstPickInput } from "./first-pick";
import { queryGroundedProvider } from "./providers";

const input: FirstPickInput = {
  subjectName: "Tempo",
  canonicalDomain: "tempo.example",
  question: "Which scheduler should a team of ten buy?",
  market: "United States",
  locale: "en-US",
  provider: "anthropic",
  model: "anthropic/claude-sonnet-5",
  answerText: "My first pick would be Acme because its team plan covers ten seats.",
  sources: [{
    title: "Acme team pricing",
    url: "https://acme.example/pricing",
    snippet: "Our team plan includes ten seats.",
    publisher: "acme.example",
    publishedAt: null,
  }],
  competingPick: { name: "Acme", quote: "My first pick would be Acme" },
  gatewayUserId: "test-owner",
  runId: "test-run",
};

describe("first-pick follow-ups", () => {
  afterEach(() => generate.mockReset());

  it("carries the grounded answer and the first verdict into the second turn on the original model", async () => {
    const verdict = "I would consider Tempo, but could only verify ten-seat pricing for Acme.";
    const change = "Add a worked ten-seat example to Tempo's pricing page.";
    const reason = "A ten-seat total was decisive for this team.";
    generate.mockResolvedValueOnce({ text: verdict, usage: {}, providerMetadata: { gateway: { cost: 0.003 } } })
      .mockResolvedValueOnce({ output: { change, reason, sourceIds: [1, 1] }, usage: {} });
    const first = await askFirstPickVerdict(input);
    const second = await askFirstPickChange(input, first.verdict);
    expect(first).toMatchObject({ verdict, accounting: { costMicros: 3_000 } });
    const [firstCall, secondCall] = generate.mock.calls.map(([call]) => call);
    expect(firstCall.model).toBe(input.model);
    expect(firstCall.messages[0].content).toContain(input.question);
    expect(firstCall.messages[1]).toEqual({ role: "assistant", content: input.answerText });
    expect(firstCall.messages[2].content).toContain(input.sources[0].snippet);
    expect(secondCall.model).toBe(firstCall.model);
    expect(secondCall.messages.slice(0, 3)).toEqual(firstCall.messages);
    expect(secondCall.messages[3]).toEqual({ role: "assistant", content: verdict });
    expect(secondCall.messages[4].content).toContain("What one change");
    expect(second).toMatchObject({ change, reason, sourceUrls: [input.sources[0].url] });
  });

  it.each([{ ids: [] }, { ids: [2] }, { ids: [1, -1] }])("withholds an actionable claim without valid supporting source IDs ($ids)", async ({ ids }) => {
    generate.mockResolvedValueOnce({
      output: { change: "Reduce the price.", reason: "The plans cost too much.", sourceIds: ids },
      usage: {},
    });
    const result = await askFirstPickChange(input, "I would choose Acme.");
    expect(result.change).toBeNull();
    expect(result.sourceUrls).toEqual([]);
  });

  it("preserves an explicit no-change answer", async () => {
    const reason = "The evidence gives no basis for changing Tempo's pricing.";
    generate.mockResolvedValueOnce({ output: { change: null, reason, sourceIds: [] }, usage: {} });
    expect(await askFirstPickChange(input, "I cannot rank Tempo reliably.")).toMatchObject({
      change: null, reason, sourceUrls: [],
    });
  });

  it("checks for an actual pick even when the owner supplied no known competitors", async () => {
    const labels = { prominence: "absent", sentiment: null, competitors: [], competingPick: input.competingPick };
    const analysisInput = {
      ...input, competitors: [], aliases: [], analysisVersion: "analysis-v3", findCompetingPick: true,
    };
    generate.mockResolvedValueOnce({ output: labels, usage: {} });
    expect(await analyzeAnswer(analysisInput)).toMatchObject({
      competingPick: input.competingPick, targetMentioned: false, competitorMentions: [],
    });
    expect(await analyzeAnswer({ ...analysisInput, findCompetingPick: false })).toMatchObject({ competingPick: null });
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("retains Exa highlights when a bare citation URL precedes the full tool result", async () => {
    const { url, title, snippet } = input.sources[0];
    generate.mockResolvedValueOnce({
      text: input.answerText, usage: {}, sources: [{ url, title }], finishReason: "stop", toolCalls: [],
      toolResults: [{ output: { results: [{ url, title, highlights: [snippet] }] } }],
    });
    const result = await queryGroundedProvider({ ...input, promptVersion: "provider-v2", cohort: "discovery" });
    expect(result.sources).toEqual(input.sources);
  });

  it("keeps deterministic scoring when only the optional pick lookup fails", async () => {
    generate.mockRejectedValueOnce(new Error("Provider unavailable"));
    const result = await analyzeAnswer({
      ...input, competitors: [], aliases: [], analysisVersion: "analysis-v3", findCompetingPick: true,
    });
    expect(result).toMatchObject({ targetMentioned: false, prominence: "absent", competingPick: null });
    expect(result.latencyMs).toBeGreaterThan(0);
  });
});
