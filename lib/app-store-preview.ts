export type AppStoreLookupResult = {
  wrapperType?: string;
  kind?: string;
  trackName?: string;
  trackCensoredName?: string;
  artistName?: string;
  sellerName?: string;
  primaryGenreName?: string;
  description?: string;
  trackViewUrl?: string;
  sellerUrl?: string;
};

export function parseAppStoreListingUrl(value: string) {
  const candidate = /^[a-z][a-z\d+.-]*:\/\//iu.test(value.trim())
    ? value.trim()
    : `https://${value.trim()}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:" || url.hostname !== "apps.apple.com") return null;
    const id = /\/id(\d+)(?:[/?]|$)/u.exec(url.pathname)?.[1];
    if (!id) return null;
    const country = /^\/([a-z]{2})(?:\/|$)/iu.exec(url.pathname)?.[1]?.toLocaleLowerCase("en-US") ?? "us";
    url.hash = "";
    return { id, country, url: url.href };
  } catch {
    return null;
  }
}

export function buildAppStoreSuggestion(
  result: AppStoreLookupResult,
  subjectName: string,
) {
  const appName = clean(result.trackName || result.trackCensoredName || subjectName);
  const developer = clean(result.sellerName || result.artistName || "");
  const genre = clean(result.primaryGenreName || "");
  const listingDescription = clean(result.description || "");
  const lead = [
    appName,
    genre ? `is a ${genre} app` : "is an app",
    developer ? `by ${developer}` : "",
  ].filter(Boolean).join(" ");
  const description = `${lead}. ${listingDescription}`.trim().slice(0, 2_000);

  return {
    description,
    aliases: [...new Set([subjectName, appName].filter(Boolean))].slice(0, 6),
    developer,
    developerWebsite: safeHttpsUrl(result.sellerUrl),
    sourceUrl: safeHttpsUrl(result.trackViewUrl),
  };
}

function clean(value: string) {
  return value.replace(/\s+/gu, " ").trim();
}

function safeHttpsUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}
