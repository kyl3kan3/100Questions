import { buildMcpServerCard } from "@/lib/agent-discovery";

const CORS_HEADERS = {
  "access-control-allow-headers": "Content-Type",
  "access-control-allow-methods": "GET, OPTIONS",
  "access-control-allow-origin": "*",
} as const;

export function GET() {
  return Response.json(buildMcpServerCard(), {
    headers: {
      ...CORS_HEADERS,
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
