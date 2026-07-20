import {
  matchBrand,
  normalizeMatchText,
  type BrandIdentity,
  type BrandMatch,
} from "./matching";

export type DiscoveryQuestionIssue = "empty" | "brand_reference";

export interface DiscoveryQuestionValidation {
  valid: boolean;
  issues: readonly DiscoveryQuestionIssue[];
  normalizedQuestion: string;
  brandMatch: BrandMatch;
}

/**
 * Discovery questions must be neutral: any whole-token normalized brand name,
 * alias, or canonical-domain reference makes the question ineligible.
 */
export function validateDiscoveryQuestion(
  question: string,
  identity: BrandIdentity,
): DiscoveryQuestionValidation {
  const normalizedQuestion = normalizeMatchText(question);
  const brandMatch = matchBrand(question, identity);
  const issues: DiscoveryQuestionIssue[] = [];

  if (!normalizedQuestion) {
    issues.push("empty");
  }

  if (brandMatch.mentioned) {
    issues.push("brand_reference");
  }

  return {
    valid: issues.length === 0,
    issues,
    normalizedQuestion,
    brandMatch,
  };
}

export function isValidDiscoveryQuestion(
  question: string,
  identity: BrandIdentity,
): boolean {
  return validateDiscoveryQuestion(question, identity).valid;
}
