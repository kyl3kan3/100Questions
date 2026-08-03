import { buildOpenApiDocument } from "@/lib/agent-discovery";

export function GET() {
  return Response.json(buildOpenApiDocument(), {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": "application/vnd.oai.openapi+json",
    },
  });
}
