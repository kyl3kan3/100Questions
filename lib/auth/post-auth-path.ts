const KNOWN_PACKAGES = new Set(["intro", "single", "three", "ten"]);

/**
 * Resolve a safe internal path after sign-in / sign-up.
 * Prefer an explicit next= path; otherwise map a package id to dashboard buy intent.
 */
export function resolvePostAuthPath(input: {
  next?: FormDataEntryValue | string | null;
  packageId?: FormDataEntryValue | string | null;
}): string {
  const next = String(input.next ?? "").trim();
  if (
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !next.includes("://")
  ) {
    return next;
  }

  const packageId = String(input.packageId ?? "").trim();
  if (packageId && KNOWN_PACKAGES.has(packageId)) {
    return `/dashboard?buy=${encodeURIComponent(packageId)}`;
  }

  return "/dashboard";
}
