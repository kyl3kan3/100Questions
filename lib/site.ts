export const SITE_NAME = "100 Questions";
export const SITE_URL = "https://100questionsai.com";
export const SITE_TITLE = "100 Questions — AI Visibility Audit & Benchmark Tool";
export const SITE_DESCRIPTION =
  "Run a $9 AI visibility audit across OpenAI, Claude, Gemini, and Grok. See where AI overlooks your brand, who appears instead, and what to fix next.";
export const SITE_UPDATED_AT = "2026-07-24T00:00:00.000Z";
// X's card crawler is unreliable with query-stringed image URLs and RGBA
// PNGs, so the card is a flattened RGB PNG versioned via the filename only.
export const SOCIAL_IMAGE_PATH = "/social-card-v4.png";
export const SOCIAL_IMAGE_URL = `${SITE_URL}${SOCIAL_IMAGE_PATH}`;
export const SOCIAL_IMAGE_ALT =
  "100 Questions — see whether AI puts your brand in the answer";

export const SOCIAL_IMAGE = {
  url: SOCIAL_IMAGE_URL,
  width: 1200,
  height: 630,
  alt: SOCIAL_IMAGE_ALT,
  type: "image/png",
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
