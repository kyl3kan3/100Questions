import { parse as parseDomain } from "tldts";

export type BrandMatchKind = "canonical_name" | "alias" | "canonical_domain";

export interface BrandIdentity {
  canonicalName: string;
  aliases?: readonly string[];
  canonicalDomain?: string | null;
}

export interface BrandMatch {
  mentioned: boolean;
  matches: readonly {
    kind: BrandMatchKind;
    value: string;
    normalized: string;
  }[];
  matchedAliases: readonly string[];
}

const COMBINING_MARKS = /\p{M}+/gu;
const MATCH_SEPARATORS = /[^\p{L}\p{N}]+/gu;
const EXPLICIT_SCHEME = /^[a-z][a-z\d+.-]*:\/\//iu;
const DOMAIN_LABEL = /^(?!-)[a-z\d-]{1,63}(?<!-)$/u;

/**
 * Normalizes human-readable values for deterministic, whole-token matching.
 * Punctuation, case, spacing, and diacritics do not affect a match.
 */
export function normalizeMatchText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(COMBINING_MARKS, "")
    .toLocaleLowerCase("en-US")
    .replaceAll("&", " and ")
    .replace(MATCH_SEPARATORS, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

/**
 * Returns a normalized hostname from either a hostname or an HTTP(S) URL.
 * Credentials and non-HTTP protocols are rejected.
 */
export function normalizeHostname(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed || /\s/u.test(trimmed)) {
    return null;
  }

  const candidate = EXPLICIT_SCHEME.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username ||
      url.password ||
      !url.hostname
    ) {
      return null;
    }

    return url.hostname.toLocaleLowerCase("en-US").replace(/\.+$/u, "");
  } catch {
    return null;
  }
}

/** Treats a conventional www host as the same claimed site as its apex. */
export function normalizeCanonicalDomain(value: string): string | null {
  const hostname = normalizeHostname(value)?.replace(/^www\./u, "") ?? null;

  if (
    !hostname ||
    hostname.length > 253 ||
    !hostname.split(".").every((label) => DOMAIN_LABEL.test(label))
  ) {
    return null;
  }

  const parsed = parseDomain(hostname, { allowPrivateDomains: true });

  // A claimed site must contain a registrable domain. Public suffixes, IPs,
  // and special single-label hosts would otherwise make every subdomain look
  // owned and inflate citation metrics.
  if (!parsed.domain || parsed.isIp) {
    return null;
  }

  return hostname;
}

export function isOwnedHostname(
  candidate: string,
  canonicalDomain: string,
): boolean {
  const candidateHostname = normalizeHostname(candidate);
  const canonicalHostname = normalizeCanonicalDomain(canonicalDomain);

  if (!candidateHostname || !canonicalHostname) {
    return false;
  }

  return (
    candidateHostname === canonicalHostname ||
    candidateHostname.endsWith(`.${canonicalHostname}`)
  );
}

/**
 * Only absolute HTTP(S) citation URLs can establish an owned-domain citation.
 */
export function isOwnedDomainCitation(
  citationUrl: string,
  canonicalDomain: string,
): boolean {
  if (!EXPLICIT_SCHEME.test(citationUrl.trim())) {
    return false;
  }

  return isOwnedHostname(citationUrl, canonicalDomain);
}

export function matchBrand(
  text: string,
  identity: BrandIdentity,
): BrandMatch {
  const normalizedText = normalizeMatchText(text);
  const paddedText = ` ${normalizedText} `;
  const candidates: {
    kind: BrandMatchKind;
    value: string;
    normalized: string;
  }[] = [];
  const seen = new Set<string>();

  const addCandidate = (kind: BrandMatchKind, rawValue: string) => {
    const normalized = normalizeMatchText(rawValue);

    if (!normalized || seen.has(normalized)) {
      return;
    }

    seen.add(normalized);
    candidates.push({ kind, value: rawValue.trim(), normalized });
  };

  addCandidate("canonical_name", identity.canonicalName);

  for (const alias of identity.aliases ?? []) {
    addCandidate("alias", alias);
  }

  if (identity.canonicalDomain) {
    const hostname = normalizeCanonicalDomain(identity.canonicalDomain);

    if (hostname) {
      addCandidate("canonical_domain", hostname);
    }
  }

  const matches = candidates.filter(({ normalized }) =>
    paddedText.includes(` ${normalized} `),
  );

  return {
    mentioned: matches.length > 0,
    matches,
    matchedAliases: matches.map(({ value }) => value),
  };
}
