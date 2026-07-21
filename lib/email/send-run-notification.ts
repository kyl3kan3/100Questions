import "server-only";

import {
  buildRunNotificationContent,
  type NotifiableRunStatus,
} from "@/lib/email/run-notification-content";
import { absoluteUrl } from "@/lib/site";

type SendRunNotificationInput = {
  runId: string;
  recipientEmail: string;
  subjectName: string;
  status: NotifiableRunStatus;
};

export type RunNotificationSendResult =
  | { sent: true; messageId: string | null }
  | { sent: false; reason: "not_configured" };

export async function sendRunNotificationEmail(
  input: SendRunNotificationInput,
): Promise<RunNotificationSendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RUN_NOTIFICATION_FROM_EMAIL?.trim();

  if (!apiKey || !from) {
    return { sent: false, reason: "not_configured" };
  }

  const runUrl = absoluteUrl(`/runs/${encodeURIComponent(input.runId)}`);
  const content = buildRunNotificationContent({
    subjectName: input.subjectName,
    status: input.status,
    runUrl,
  });
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `run-finished-${input.runId}-${input.status}`,
    },
    body: JSON.stringify({
      from,
      to: [input.recipientEmail],
      subject: content.subject,
      html: content.html,
      text: content.text,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new Error(`Run notification provider returned ${response.status}`);
  }

  const payload = (await response.json().catch(() => null)) as {
    id?: unknown;
  } | null;

  return {
    sent: true,
    messageId: typeof payload?.id === "string" ? payload.id : null,
  };
}
