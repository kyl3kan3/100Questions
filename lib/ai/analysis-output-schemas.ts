import { z } from "zod";

import type { CompetingPick } from "../db/schema";
import { matchBrand, type BrandIdentity } from "./matching";

const prominenceSchema = z.enum(["lead", "shortlist", "incidental", "absent"]);
const sentimentSchema = z.enum(["positive", "neutral", "negative"]).nullable();

/** Gateway-facing schema limited to broadly supported JSON Schema keywords. */
export const gatewayAnalysisOutputSchema = z.object({
  prominence: prominenceSchema,
  sentiment: sentimentSchema,
  competitors: z.array(
    z.object({
      name: z.string(),
      sentiment: sentimentSchema,
    }),
  ),
});

export const gatewayAnalysisWithPickOutputSchema = gatewayAnalysisOutputSchema.extend({
  competingPick: z.object({ name: z.string(), quote: z.string() }).nullable(),
});

const competingPickSchema = z.object({
  competingPick: z.object({
    name: z.string().trim().min(1).max(150),
    quote: z.string().trim().min(1).max(800),
  }),
});

// A labeling mistake in the optional follow-up must not discard the run's
// independently scored target and competitor labels.
export function readCompetingPick(
  output: unknown,
  answerText: string,
  target: BrandIdentity,
): CompetingPick | null {
  const parsed = competingPickSchema.safeParse(output);
  if (!parsed.success) return null;

  const pick = parsed.data.competingPick;
  if (
    !answerText.includes(pick.quote) ||
    !matchBrand(pick.quote, { canonicalName: pick.name }).mentioned ||
    matchBrand(pick.name, target).mentioned
  ) {
    return null;
  }
  return pick;
}

const analysisValidationSchema = z.object({
  prominence: prominenceSchema,
  sentiment: sentimentSchema,
  competitors: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(150),
        sentiment: sentimentSchema,
      }),
    )
    .max(30),
});

export function parseGeneratedAnalysis(value: unknown) {
  return analysisValidationSchema.parse(value);
}
