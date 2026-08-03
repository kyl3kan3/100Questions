import { AGENT_SKILL_MARKDOWN } from "@/lib/agent-discovery";

export function GET() {
  return new Response(AGENT_SKILL_MARKDOWN, {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": "text/markdown; charset=utf-8",
    },
  });
}
