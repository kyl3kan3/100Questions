export const SITE_NAME = "100 Questions";
export const SITE_URL = "https://100questionsai.com";
export const SITE_UPDATED_AT = "2026-07-20T00:00:00.000Z";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString();
}
