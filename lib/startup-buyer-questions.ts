export const BUYER_QUESTION_MAX_CHARS = 110;

export type BuyerQuestionCategory = {
  label: string;
};

export function normalizeCategoryLabel(label: string): string {
  const cleaned = label
    .replace(/[|–—]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim()
    .toLowerCase();

  if (!cleaned || cleaned === "your category" || cleaned === "tools in your space") {
    return "B2B software tools";
  }

  return cleaned.replace(/\bai\b/gu, "AI");
}

/** Mass-noun style labels use “What's the best …”; plural lists use “What are the best …”. */
export function usesMassNounQuestionForm(label: string): boolean {
  if (/\b(tools|platforms|stacks|services)\b/iu.test(label)) {
    return false;
  }
  return /\b(infrastructure|software|analytics|workspace)\b/iu.test(label);
}

export function buildBuyerQuestionTexts(category: BuyerQuestionCategory): string[] {
  const label = normalizeCategoryLabel(category.label);
  const lead = usesMassNounQuestionForm(label)
    ? `What's the best ${label} for a startup`
    : `What are the best ${label} for a startup`;

  return [
    finalizeBuyerQuestion(lead),
    finalizeBuyerQuestion(
      `Which ${label} should a technical founder shortlist this quarter`,
    ),
    finalizeBuyerQuestion(
      `What public evidence should I check before trusting an AI answer about ${label}`,
    ),
  ];
}

export function finalizeBuyerQuestion(text: string): string {
  let question = text
    .replace(/\s+/gu, " ")
    .replace(/\s+([,.!?])/gu, "$1")
    .replace(/\d+\s*$/u, "")
    .trim();

  if (question.length > BUYER_QUESTION_MAX_CHARS) {
    question = trimToWordBoundary(question, BUYER_QUESTION_MAX_CHARS);
  }

  question = question.replace(/[?.!]+$/u, "").trim();
  if (!question) {
    question = "What are the best B2B software tools for a startup";
  }

  return `${question}?`;
}

function trimToWordBoundary(value: string, max: number): string {
  if (value.length <= max) return value;
  const slice = value.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace > 40) {
    return slice.slice(0, lastSpace).trim();
  }
  return slice.trim();
}

export function assertCleanBuyerQuestion(text: string): void {
  if (!text.endsWith("?") || text.includes("??")) {
    throw new Error(`Question must end with a single ?: ${text}`);
  }
  if (text.length > BUYER_QUESTION_MAX_CHARS + 1) {
    throw new Error(`Question too long: ${text}`);
  }
  if (/\s{2,}/u.test(text)) {
    throw new Error(`Question has double spaces: ${text}`);
  }
  if (/\d/u.test(text) && /\s\d+\s*$/u.test(text)) {
    throw new Error(`Question has stray trailing digits: ${text}`);
  }
}
