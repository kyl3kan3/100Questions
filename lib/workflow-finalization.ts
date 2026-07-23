export const ACTION_PLAN_FINALIZATION_RETRY_CODE =
  "ACTION_PLAN_FINALIZATION_RETRY";

export function isActionPlanFinalizationRetry(
  status: string,
  failureCode: string | null,
): boolean {
  return (
    status === "analyzing" &&
    failureCode === ACTION_PLAN_FINALIZATION_RETRY_CODE
  );
}
