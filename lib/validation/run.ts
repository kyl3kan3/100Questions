import { z } from "zod";

import { normalizeCanonicalDomain } from "../ai/matching";

const trimmed = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

const shortList = z
  .array(trimmed(1, 120))
  .max(12)
  .default([])
  .transform((values) => [
    ...new Map(
      values.map((value) => [value.toLocaleLowerCase("en-US"), value]),
    ).values(),
  ]);

export const createRunSchema = z.object({
  subjectName: trimmed(2, 120),
  canonicalDomain: trimmed(3, 253).transform((value, context) => {
    const normalized = normalizeCanonicalDomain(value);

    if (!normalized) {
      context.addIssue({
        code: "custom",
        message: "Enter a valid website domain.",
      });
      return z.NEVER;
    }

    return normalized;
  }),
  description: trimmed(20, 2_000),
  aliases: shortList,
  competitors: shortList,
  market: trimmed(2, 120),
  locale: trimmed(2, 32).default("en-US"),
  questionCount: z.coerce.number().int().min(25).max(25).default(25),
  confirmedBudget: z.literal(true, {
    error: "Confirm the displayed budget ceiling before starting.",
  }),
});

export type CreateRunInput = z.infer<typeof createRunSchema>;

export function parseDelimitedList(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(/[\n,]/u)
    .map((item) => item.trim())
    .filter(Boolean);
}
