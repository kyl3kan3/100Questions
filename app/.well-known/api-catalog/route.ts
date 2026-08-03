import {
  AGENT_DISCOVERY_LINK_HEADER,
  API_CATALOG_CONTENT_TYPE,
  buildApiCatalog,
} from "@/lib/agent-discovery";

const headers = {
  "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
  "content-type": API_CATALOG_CONTENT_TYPE,
  link: AGENT_DISCOVERY_LINK_HEADER,
};

export function GET() {
  return new Response(JSON.stringify(buildApiCatalog()), { headers });
}

export function HEAD() {
  return new Response(null, { headers });
}
