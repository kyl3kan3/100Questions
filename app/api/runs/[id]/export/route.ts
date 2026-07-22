import { getAuthenticatedUser } from "@/lib/auth/session";
import { buildResultsCsv, buildResultsPdf } from "@/lib/report-export";
import { getRunResultsForUser } from "@/lib/runs";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return jsonError("Sign in to export this report.", 401, "unauthorized");

  const { id } = await context.params;
  const payload = await getRunResultsForUser(id, user.id);
  if (!payload) return jsonError("Benchmark run not found.", 404, "not_found");
  if (!["complete", "partial"].includes(payload.run.status)) {
    return jsonError("Exports are available when the benchmark finishes.", 409, "run_not_finished");
  }

  const format = new URL(request.url).searchParams.get("format");
  const filename = `${slug(payload.run.subjectName)}-ai-visibility-audit`;
  if (format === "csv") {
    return new Response(`\uFEFF${buildResultsCsv(payload)}`, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}.csv"`,
        "cache-control": "private, no-store",
      },
    });
  }
  if (format === "pdf") {
    const pdf = await buildResultsPdf(payload);
    return new Response(Buffer.from(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}.pdf"`,
        "cache-control": "private, no-store",
      },
    });
  }
  return jsonError("Choose format=pdf or format=csv.", 400, "invalid_format");
}

function slug(value: string) {
  return value.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "").slice(0, 64) || "report";
}
