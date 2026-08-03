import { trackAICrawlerRequest } from "@datafast/ai-crawl";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

import { getAuth } from "@/lib/auth/server";
import {
  acceptsMarkdown,
  AGENT_DISCOVERY_LINK_HEADER,
  HOME_MARKDOWN,
} from "@/lib/agent-discovery";

const protectedPrefixes = ["/dashboard", "/runs"];
const DATAFAST_WEBSITE_ID = "dfid_WIXXIARdwVFPbyM6Mib8P";

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  // Best-effort and non-blocking: the package uses event.waitUntil() so bot
  // analytics never delay or fail the page response.
  trackAICrawlerRequest(request, event, {
    websiteId: DATAFAST_WEBSITE_ID,
    authToken: process.env.DATAFAST_BOT_TOKEN,
  });

  if (
    request.nextUrl.pathname === "/" &&
    (request.method === "GET" || request.method === "HEAD") &&
    acceptsMarkdown(request.headers.get("accept"))
  ) {
    return new NextResponse(request.method === "HEAD" ? null : HOME_MARKDOWN, {
      headers: {
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
        "content-location": "/",
        "content-type": "text/markdown; charset=utf-8",
        link: AGENT_DISCOVERY_LINK_HEADER,
        vary: "Accept",
      },
    });
  }

  const isProtected = protectedPrefixes.some(
    (prefix) =>
      request.nextUrl.pathname === prefix ||
      request.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  return getAuth().middleware({ loginUrl: "/auth/sign-in" })(request);
}

export const config = {
  matcher: [
    // Keep crawler-facing files such as robots.txt, llms.txt, and sitemaps in
    // scope while excluding APIs, framework assets, and workflow callbacks.
    "/((?!api|_next/static|_next/image|favicon.ico|\\.well-known/workflow).*)",
  ],
};
