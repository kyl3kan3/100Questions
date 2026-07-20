export type AuthFailure = {
  code?: string;
  status?: number;
};

type AuthOperation = "sign-in" | "sign-up";

const duplicateAccountCodes = new Set([
  "USER_ALREADY_EXISTS",
  "user_already_exists",
]);

export function getAuthFailureLogContext(
  operation: AuthOperation,
  error: AuthFailure,
) {
  return {
    operation,
    code: error.code ?? "unknown",
    status: error.status ?? null,
  };
}

function isNetworkError(error: AuthFailure): boolean {
  return Boolean(error.code?.startsWith("NETWORK_"));
}

function isRateLimited(error: AuthFailure): boolean {
  return error.status === 429 || error.code === "over_request_rate_limit";
}

export function getSignInFailureMessage(error: AuthFailure): string {
  if (isNetworkError(error)) {
    return "Authentication is temporarily unavailable. Try again shortly.";
  }

  if (isRateLimited(error)) {
    return "Too many sign-in attempts. Wait a moment and try again.";
  }

  return "The email or password did not match an account.";
}

export function getSignUpFailureMessage(error: AuthFailure): string {
  if (isNetworkError(error) || error.status === 403) {
    return "Account creation is temporarily unavailable. Try again shortly.";
  }

  if (isRateLimited(error)) {
    return "Too many account creation attempts. Wait a moment and try again.";
  }

  if (
    error.status === 409 ||
    (error.code ? duplicateAccountCodes.has(error.code) : false)
  ) {
    return "An account with that email already exists. Sign in instead.";
  }

  return "We could not create that account. Try signing in instead.";
}
