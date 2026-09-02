"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  signInWithEmail,
  signUpWithEmail,
  type AuthActionState,
} from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: AuthActionState = {};

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  checkoutSessionId?: string;
  email?: string;
  nextPath?: string;
  packageId?: string;
};

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p className="text-sm leading-5 text-red-300" role="alert">
      {messages[0]}
    </p>
  );
}

export function AuthForm({
  mode,
  checkoutSessionId,
  email,
  nextPath,
  packageId,
}: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const action = isSignUp ? signUpWithEmail : signInWithEmail;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const switchHref = (() => {
    const params = new URLSearchParams();
    if (checkoutSessionId) params.set("checkout_session", checkoutSessionId);
    if (packageId) params.set("package", packageId);
    if (nextPath) params.set("next", nextPath);
    const qs = params.toString();
    const base = isSignUp ? "/auth/sign-in" : "/auth/sign-up";
    return qs ? `${base}?${qs}` : base;
  })();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle as="h1" className="text-2xl">
          {isSignUp ? "Create your account" : "Welcome back"}
        </CardTitle>
        <CardDescription>
          {checkoutSessionId
            ? isSignUp
              ? "Payment received. Choose a password to open the workspace tied to your payment email."
              : "Sign in with the payment email to add the purchased credit to your workspace."
            : isSignUp
            ? packageId
              ? "Create a free account, then continue to secure checkout for your selected package."
              : "Create a private workspace for your visibility benchmarks. No charge until you buy a credit."
            : "Sign in to run benchmarks and review your results."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form action={formAction} className="space-y-5" noValidate>
          {checkoutSessionId ? (
            <input
              type="hidden"
              name="checkoutSessionId"
              value={checkoutSessionId}
            />
          ) : null}
          {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
          {packageId ? (
            <input type="hidden" name="package" value={packageId} />
          ) : null}
          {isSignUp ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
                aria-invalid={Boolean(state.fieldErrors?.name)}
                aria-describedby={
                  state.fieldErrors?.name ? "name-error" : undefined
                }
                placeholder="Alex Morgan"
              />
              <div id="name-error">
                <FieldError messages={state.fieldErrors?.name} />
              </div>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              required
              defaultValue={email}
              readOnly={Boolean(email)}
              aria-invalid={Boolean(state.fieldErrors?.email)}
              aria-describedby={
                state.fieldErrors?.email ? "email-error" : undefined
              }
              placeholder="you@company.com"
            />
            <div id="email-error">
              <FieldError messages={state.fieldErrors?.email} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={8}
              maxLength={128}
              required
              aria-invalid={Boolean(state.fieldErrors?.password)}
              aria-describedby={
                state.fieldErrors?.password ? "password-error" : undefined
              }
              placeholder="At least 8 characters"
            />
            <div id="password-error">
              <FieldError messages={state.fieldErrors?.password} />
            </div>
          </div>

          <div
            aria-live="polite"
            className="min-h-5 text-sm leading-5 text-red-300"
          >
            {state.error}
          </div>

          <Button className="w-full" disabled={isPending} type="submit">
            {isPending
              ? isSignUp
                ? "Creating account…"
                : "Signing in…"
              : isSignUp
                ? "Create account"
                : "Sign in"}
          </Button>
        </form>

        {isSignUp && !checkoutSessionId ? (
          <p className="mt-4 text-center text-xs leading-5 text-zinc-400">
            By creating an account, you agree to the{" "}
            <Link
              className="text-emerald-300 underline-offset-4 hover:text-emerald-200 hover:underline"
              href="/terms"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              className="text-emerald-300 underline-offset-4 hover:text-emerald-200 hover:underline"
              href="/privacy"
            >
              Privacy
            </Link>{" "}
            notices.
          </p>
        ) : null}

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isSignUp ? "Already have an account?" : "New to 100 Questions?"}{" "}
          <Link
            className="font-medium text-emerald-300 underline-offset-4 hover:text-emerald-200 hover:underline"
            href={switchHref}
          >
            {isSignUp ? "Sign in" : "Create one"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
