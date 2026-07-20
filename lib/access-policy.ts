const USER_ID_SEPARATOR = /[\s,]+/u;

export function matchesUserIdAllowlist(
  userId: string,
  configuredUserIds: string | undefined,
): boolean {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId || !configuredUserIds?.trim()) {
    return false;
  }

  return configuredUserIds
    .split(USER_ID_SEPARATOR)
    .map((candidate) => candidate.trim())
    .filter(Boolean)
    .some((candidate) => candidate === normalizedUserId);
}
