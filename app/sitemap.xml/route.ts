import { buildSitemapXml } from "@/lib/seo";

export function GET() {
  return new Response(buildSitemapXml(), {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": "application/xml; charset=utf-8",
    },
  });
}

export function HEAD() {
  return new Response(null, {
    headers: {
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "content-type": "application/xml; charset=utf-8",
    },
  });
}
