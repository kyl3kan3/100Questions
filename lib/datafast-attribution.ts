const STRIPE_METADATA_VALUE_MAX_LENGTH = 500;
const UNSAFE_METADATA_CHARACTERS = /[\u0000-\u001f\u007f]/u;

export interface DataFastCookieValues {
  visitorId?: string;
  sessionId?: string;
}

export type DataFastCheckoutMetadata = Partial<
  Record<"datafast_visitor_id" | "datafast_session_id", string>
>;

/**
 * Converts untrusted browser cookies into bounded Stripe metadata. DataFast's
 * IDs must be preserved exactly for attribution, so values that would require
 * trimming or truncation are omitted rather than silently changed.
 */
export function buildDataFastCheckoutMetadata(
  cookies: DataFastCookieValues,
): DataFastCheckoutMetadata {
  const metadata: DataFastCheckoutMetadata = {};
  const visitorId = validMetadataValue(cookies.visitorId);
  const sessionId = validMetadataValue(cookies.sessionId);

  if (visitorId) metadata.datafast_visitor_id = visitorId;
  if (sessionId) metadata.datafast_session_id = sessionId;

  return metadata;
}

function validMetadataValue(value: string | undefined): string | null {
  if (
    !value ||
    value !== value.trim() ||
    value.length > STRIPE_METADATA_VALUE_MAX_LENGTH ||
    UNSAFE_METADATA_CHARACTERS.test(value)
  ) {
    return null;
  }

  return value;
}
