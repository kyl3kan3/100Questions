import { SITE_NAME, absoluteUrl } from "./site";

export const CHATGPT_STARTUP_CHECK_PATH = "/check" as const;

export const X_PLAYER_EMBED_QUERY = "embed=1";

export const X_PLAYER_WIDTH = 640;
export const X_PLAYER_HEIGHT = 480;

/** CSP `frame-ancestors` for routes that X may embed in a Player Card iframe. */
export const X_PLAYER_FRAME_ANCESTORS =
  "'self' https://x.com https://*.x.com https://twitter.com https://*.twitter.com";

export function chatgptStartupCheckShareUrl(): string {
  return absoluteUrl(CHATGPT_STARTUP_CHECK_PATH);
}

export function chatgptStartupCheckEmbedUrl(): string {
  return absoluteUrl(`${CHATGPT_STARTUP_CHECK_PATH}?${X_PLAYER_EMBED_QUERY}`);
}

export function chatgptStartupCheckTwitterImageUrl(): string {
  return absoluteUrl(`${CHATGPT_STARTUP_CHECK_PATH}/twitter-image`);
}

export type XPlayerCardMeta = {
  title: string;
  description: string;
  shareUrl: string;
  embedUrl: string;
  imageUrl: string;
  siteName: string;
};

export function buildChatgptStartupCheckPlayerCardMeta(): XPlayerCardMeta {
  return {
    title: "Does ChatGPT know your startup?",
    description:
      "Instant AI discovery preview: technical readiness score plus three sample buyer questions. Not a live ChatGPT query.",
    shareUrl: chatgptStartupCheckShareUrl(),
    embedUrl: chatgptStartupCheckEmbedUrl(),
    imageUrl: chatgptStartupCheckTwitterImageUrl(),
    siteName: SITE_NAME,
  };
}

/** HTML meta tags X expects for a Player Card (for tests and documentation). */
export function xPlayerFrameSecurityHeaders(): { key: string; value: string }[] {
  return [
    {
      key: "Content-Security-Policy",
      value: `frame-ancestors ${X_PLAYER_FRAME_ANCESTORS}`,
    },
  ];
}

export function renderXPlayerCardMetaTags(meta: XPlayerCardMeta): string[] {
  return [
    '<meta name="twitter:card" content="player">',
    `<meta name="twitter:title" content="${escapeMeta(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeMeta(meta.description)}">`,
    `<meta name="twitter:image" content="${meta.imageUrl}">`,
    `<meta name="twitter:player" content="${meta.embedUrl}">`,
    `<meta name="twitter:player:width" content="${X_PLAYER_WIDTH}">`,
    `<meta name="twitter:player:height" content="${X_PLAYER_HEIGHT}">`,
    `<meta property="og:title" content="${escapeMeta(meta.title)}">`,
    `<meta property="og:description" content="${escapeMeta(meta.description)}">`,
    `<meta property="og:url" content="${meta.shareUrl}">`,
    `<meta property="og:site_name" content="${escapeMeta(meta.siteName)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:image" content="${meta.imageUrl}">`,
  ];
}

function escapeMeta(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/"/gu, "&quot;")
    .replace(/</gu, "&lt;");
}
