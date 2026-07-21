import { z } from "zod";

/**
 * Keep schemas sent to AI Gateway to its broadly supported JSON Schema subset.
 * Product constraints are enforced locally after the structured response arrives.
 */
export const gatewayBriefOutputSchema = z.object({
  neutralBrief: z.string(),
  themes: z.array(z.string()),
});

const gatewayQuestionOutputSchema = z.object({
  category: z.string(),
  text: z.string(),
});

export const gatewayQuestionSetOutputSchema = z.object({
  questions: z.array(gatewayQuestionOutputSchema),
});

const briefValidationSchema = z.object({
  neutralBrief: z.string().trim().min(40).max(1_500),
  themes: z.array(z.string().trim().min(2).max(100)).min(3).max(12),
});

const questionValidationSchema = z.object({
  category: z.string().trim().min(2).max(80),
  text: z.string().trim().min(12).max(280),
});

export function parseGeneratedBrief(value: unknown) {
  return briefValidationSchema.parse(value);
}

export function parseGeneratedQuestionSet(
  value: unknown,
  minimumCount: number,
  maximumCount = minimumCount,
) {
  if (
    !Number.isSafeInteger(minimumCount) ||
    !Number.isSafeInteger(maximumCount) ||
    minimumCount < 1 ||
    maximumCount < minimumCount ||
    maximumCount > 100
  ) {
    throw new RangeError("Question count bounds must be integers between 1 and 100");
  }

  return z
    .object({
      questions: z
        .array(questionValidationSchema)
        .min(minimumCount)
        .max(maximumCount),
    })
    .parse(value);
}
