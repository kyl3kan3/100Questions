"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  getAuthFailureLogContext,
  getSignInFailureMessage,
  getSignUpFailureMessage,
} from "@/lib/auth/errors";
import { auth } from "@/lib/auth/server";

const emailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "Email address is too long.")
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be 128 characters or fewer.");

const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const signUpSchema = signInSchema.extend({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
});

function checkoutRedirect(formData: FormData) {
  const value = formData.get("checkoutSessionId");
  return typeof value === "string" && /^cs_[A-Za-z0-9_]+$/.test(value)
    ? `/checkout/complete?session_id=${encodeURIComponent(value)}`
    : "/dashboard";
}

export type AuthActionState = {
  error?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "password", string[]>>;
};

function validationFailure(
  error: z.ZodError,
): AuthActionState {
  const fieldErrors: NonNullable<AuthActionState["fieldErrors"]> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (field === "name" || field === "email" || field === "password") {
      fieldErrors[field] ??= [];
      fieldErrors[field].push(issue.message);
    }
  }

  return {
    error: "Check the highlighted fields and try again.",
    fieldErrors,
  };
}

export async function signInWithEmail(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  const { error } = await auth.signIn.email(parsed.data);

  if (error) {
    console.warn(
      "[auth] request failed",
      getAuthFailureLogContext("sign-in", error),
    );

    return {
      error: getSignInFailureMessage(error),
    };
  }

  redirect(checkoutRedirect(formData));
}
export async function signUpWithEmail(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return validationFailure(parsed.error);
  }

  const { error } = await auth.signUp.email(parsed.data);

  if (error) {
    console.warn(
      "[auth] request failed",
      getAuthFailureLogContext("sign-up", error),
    );

    return {
      error: getSignUpFailureMessage(error),
    };
  }

  redirect(checkoutRedirect(formData));
}
