import { buildAgentSkillsIndex } from "@/lib/agent-discovery";

export function GET() {
  return Response.json(buildAgentSkillsIndex(), {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
