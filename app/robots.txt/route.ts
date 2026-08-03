import { buildRobotsText } from "@/lib/agent-discovery";

export function GET() {
  return new Response(buildRobotsText(), {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
