import { trackAICrawlerRequest } from "@datafast/ai-crawl";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

import { getAuth } from "@/lib/auth/server";

const protectedPrefixes = ["/dashboard", "/runs"];
const DATAFAST_WEBSITE_ID = "dfid_WIXXIARdwVFPbyM6Mib8P";

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  // Best-effort and non-blocking: the package uses event.waitUntil() so bot
  // analytics never delay or fail the page response.
  trackAICrawlerRequest(request, event, {
    websiteId: DATAFAST_WEBSITE_ID,
    authToken: process.env.DATAFAST_BOT_TOKEN,
  });

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
