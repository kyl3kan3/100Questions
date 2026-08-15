export type VisibilityScoreCounts = {
  eligible: number;
  mentions: number;
  prominent: number;
  citations: number;
  accurate: number;
};

export const DEFAULT_VISIBILITY_SCORE_COUNTS: VisibilityScoreCounts = {
  eligible: 100,
  mentions: 25,
  prominent: 10,
  citations: 12,
  accurate: 22,
};

export const VISIBILITY_SCORE_FIELDS = [
  [
    "eligible",
    "Eligible answers",
    "Answers successfully collected with the required grounding.",
  ],
  [
    "mentions",
    "Answers mentioning the brand",
    "Count the brand only when it appears in the answer itself.",
  ],
  [
    "prominent",
    "Prominent mentions",
    "Answers where the brand leads or appears in the primary shortlist.",
  ],
  [
    "citations",
    "Claimed-domain citations",
    "Eligible answers linking to the brand's canonical domain.",
  ],
  [
    "accurate",
    "Accurate brand descriptions",
    "Mentioning answers with materially correct positioning and facts.",
  ],
] as const;

function percent(numerator: number, denominator: number): number {
  if (denominator <= 0) return 0;
  return Math.round((Math.min(numerator, denominator) / denominator) * 100);
}

export function calculateVisibilityScores(counts: VisibilityScoreCounts) {
  const visibility = percent(counts.mentions, counts.eligible);
  const prominence = percent(counts.prominent, counts.mentions);
  const citation = percent(counts.citations, counts.eligible);
  const accuracy = percent(counts.accurate, counts.mentions);
  const composite = Math.round(
    visibility * 0.5 + prominence * 0.2 + citation * 0.2 + accuracy * 0.1,
  );

  return { visibility, prominence, citation, accuracy, composite };
}

export const CHATGPT_BRAND_VISIBILITY_PROMPTS = [
  "What are the best [category] options for [target audience]?",
  "Which [category] providers should a [buyer role] evaluate?",
  "What tools help [target audience] solve [problem]?",
  "Which [category] is best for [use case]?",
  "What are the best alternatives to [competitor]?",
  "Which [category] vendors publish the clearest methodology?",
  "What evidence should I ask for before buying [category]?",
  "What is [brand], and what does it do?",
  "What are the strengths and limitations of [brand]?",
  "How does [brand] compare with [competitor]?",
] as const;
