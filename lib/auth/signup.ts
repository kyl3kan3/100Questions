const ALLOWED_SIGNUP_EMAILS = new Set(["kyle@decent4.com"]);

export function isSignupEmailAllowed(value: unknown): boolean {
  return (
    typeof value === "string" &&
    ALLOWED_SIGNUP_EMAILS.has(value.trim().toLocaleLowerCase("en-US"))
  );
}

export function signupRestrictedMessage(): string {
  return "Account creation is not open yet.";
}
