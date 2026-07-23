export const SITE_NAME = "100 Questions";
export const SITE_URL = "https://100questionsai.com";
export const SITE_TITLE = "100 Questions — AI Visibility Benchmark";
export const SITE_DESCRIPTION =
  "Find where web-grounded AI models overlook your brand, why competitors appear instead, and what to fix next—with evidence and no subscription.";
export const SITE_UPDATED_AT = "2026-07-23T00:00:00.000Z";
export const SOCIAL_IMAGE_PATH = "/social-card-v3.png";
export const SOCIAL_IMAGE_URL = `${SITE_URL}${SOCIAL_IMAGE_PATH}?v=e5060413`;
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
