export const SITE_NAME = "100 Questions";
export const SITE_URL = "https://100questionsai.com";
export const SITE_UPDATED_AT = "2026-07-21T00:00:00.000Z";
export const SOCIAL_IMAGE_PATH = "/social-card-v2.png";
export const SOCIAL_IMAGE_ALT =
  "100 Questions — see whether AI puts your brand in the answer";

export const SOCIAL_IMAGE = {
  url: `${SITE_URL}${SOCIAL_IMAGE_PATH}`,
  width: 1200,
  height: 630,
  alt: SOCIAL_IMAGE_ALT,
} as const;

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
