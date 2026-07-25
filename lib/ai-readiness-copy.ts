import type { AiReadinessResult } from "./ai-readiness";

export function buildReadinessSuggestionCopy(
  result: AiReadinessResult,
  action: string,
) {
  const check = result.checks.find((candidate) => candidate.action === action);
  const context = check
    ? `\nEvidence: ${check.evidence}\nCurrent check: ${check.score}/${check.maxScore}`
    : "";

  return [
    `AI readiness suggestion for ${result.checkedUrl}`,
    action,
    context,
    "",
    `Technical readiness score: ${result.score}/100. This is a technical preflight result, not proof of visibility or recommendations in AI answers.`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildReadinessAgentPrompt(result: AiReadinessResult) {
  const prioritizedChecks = result.topActions.map((action) => {
    const check = result.checks.find(
      (candidate) => candidate.action === action,
    );

    return {
      action,
      check,
    };
  });

  const tasks = prioritizedChecks.length
    ? prioritizedChecks
        .map(({ action, check }, index) => {
          const details = check
            ? [
                `Area: ${check.label}`,
                `Evidence: ${check.evidence}`,
                `Current check: ${check.score}/${check.maxScore}`,
              ]
            : [];

          return [
            `${index + 1}. ${action}`,
            ...details.map((detail) => `   ${detail}`),
          ].join("\n");
        })
        .join("\n\n")
    : "No prioritized technical fixes were returned. Inspect the implementation and verify the passing checks without inventing additional work.";

  return `Improve the technical AI-search readiness of ${result.checkedUrl}.

Current technical-readiness score: ${result.score}/100 (${result.grade}).

Prioritized work:
${tasks}

Implementation requirements:
- Inspect the actual code, CMS, hosting, and HTTP behavior before changing anything.
- Make the smallest scoped changes that address the evidence above.
- Preserve intentional robots, authentication, privacy, and security controls.
- Do not use cloaking or serve different substantive HTML to bots and users.
- Validate relevant metadata, structured data, robots.txt, sitemap, and public page behavior after the change.
- Run the project's lint, typecheck, tests, and production build when available.
- Do not claim improved ChatGPT visibility, citations, rankings, or recommendations without measuring those outcomes separately.
- Summarize the files changed, verification performed, and anything that still requires human review.`;
}
