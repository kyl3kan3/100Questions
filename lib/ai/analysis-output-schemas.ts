import { z } from "zod";

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
