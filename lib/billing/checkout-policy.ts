import { createHash } from "node:crypto";

function userFingerprint(userId: string): string {
  return createHash("sha256").update(userId).digest("hex").slice(0, 24);
}

export function getCheckoutIdempotencyKey({
  userId,
  packageId,
  clientRequestKey,
}: {
  userId: string;
  packageId: string;
  clientRequestKey: string;
}): string {
  const prefix = `100q:checkout:${userFingerprint(userId)}:${packageId}`;

  return `${prefix}:${clientRequestKey}`;
}

export function getIntroductoryClaimIdempotencyKey(
  claimId: string,
  attempt: number,
): string {
  return `100q:checkout:intro-claim:${claimId}:${attempt}`;
}
