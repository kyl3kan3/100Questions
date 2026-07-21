export type NotifiableRunStatus =
  | "complete"
  | "partial"
  | "failed"
  | "cancelled";

type RunNotificationContentInput = {
  subjectName: string;
  status: NotifiableRunStatus;
  runUrl: string;
};

type RunNotificationContent = {
  subject: string;
  text: string;
  html: string;
};

const statusCopy: Record<
  NotifiableRunStatus,
  { subjectSuffix: string; heading: string; detail: string }
> = {
  complete: {
    subjectSuffix: "benchmark is ready",
    heading: "Your benchmark is ready",
    detail:
      "All planned provider answers finished. Your visibility results and source evidence are ready to review.",
  },
  partial: {
    subjectSuffix: "benchmark finished with partial results",
    heading: "Your benchmark results are ready",
    detail:
      "The benchmark finished with partial provider coverage. Completed answers and source evidence are ready to review.",
  },
  failed: {
    subjectSuffix: "benchmark needs attention",
    heading: "Your benchmark stopped early",
    detail:
      "The benchmark could not finish. Open the run to review its status and any evidence retained before it stopped.",
  },
  cancelled: {
    subjectSuffix: "benchmark was cancelled",
    heading: "Your benchmark was cancelled",
    detail:
      "No new provider calls will be started. Any evidence completed before cancellation remains available on the run page.",
  },
};

export function buildRunNotificationContent(
  input: RunNotificationContentInput,
): RunNotificationContent {
  const copy = statusCopy[input.status];
  const subjectName = input.subjectName.trim() || "Your brand";
  const subject = `${subjectName}: ${copy.subjectSuffix}`;
  const text = `${copy.heading}\n\n${copy.detail}\n\nReview your benchmark: ${input.runUrl}\n\n- 100 Questions`;

  return {
    subject,
    text,
    html: `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#070908;color:#e4e4e7;font-family:Arial,Helvetica,sans-serif">
    <div style="max-width:560px;margin:0 auto;padding:40px 20px">
      <p style="margin:0 0 24px;color:#6ee7b7;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">100 Questions</p>
      <h1 style="margin:0 0 16px;color:#ffffff;font-size:28px;line-height:1.2">${escapeHtml(copy.heading)}</h1>
      <p style="margin:0 0 24px;color:#a1a1aa;font-size:16px;line-height:1.6">${escapeHtml(subjectName)}</p>
      <p style="margin:0 0 28px;color:#d4d4d8;font-size:15px;line-height:1.7">${escapeHtml(copy.detail)}</p>
      <a href="${escapeHtml(input.runUrl)}" style="display:inline-block;border-radius:12px;background:#6ee7b7;color:#07100b;padding:13px 18px;font-size:14px;font-weight:700;text-decoration:none">Review benchmark</a>
      <p style="margin:32px 0 0;color:#71717a;font-size:12px;line-height:1.6">This is a transactional notification for a benchmark started from your account.</p>
    </div>
  </body>
</html>`,
  };
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character]!,
  );
}
