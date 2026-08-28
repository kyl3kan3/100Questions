import { trackAICrawlerRequest } from "@datafast/ai-crawl";
import {
  NextResponse,
  type NextFetchEvent,
  type NextRequest,
} from "next/server";

import { getAuth } from "@/lib/auth/server";
import {
  acceptsMarkdown,
} from "@/lib/agent-discovery";
import {
  advertisedPublicMarkdownForHtmlPath,
  publicMarkdownResponse,
} from "@/lib/public-markdown";

const protectedPrefixes = ["/dashboard", "/runs"];
const DATAFAST_WEBSITE_ID = "dfid_WIXXIARdwVFPbyM6Mib8P";

const knownMachineClients = [
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Google-Extended",
  "GPTBot",
  "OAI-SearchBot",
  "PerplexityBot",
] as const;

function machineClientName(userAgent: string | null) {
  if (!userAgent) return "unknown";
  const normalized = userAgent.toLowerCase();
  return (
    knownMachineClients.find((client) =>
      normalized.includes(client.toLowerCase()),
    ) ?? "other"
  );
}

function logMachineDiscoveryRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requestedMarkdown = acceptsMarkdown(request.headers.get("accept"));
  const isMachineResource =
    pathname === "/llms.txt" ||
    pathname === "/llms-full.txt" ||
    pathname.endsWith(".md");

  if (!isMachineResource && !requestedMarkdown) return;

  console.info(
    JSON.stringify({
      event: "machine_discovery_request",
      path: pathname,
      method: request.method,
      representation: requestedMarkdown || pathname.endsWith(".md")
        ? "markdown"
        : "text",
      client: machineClientName(request.headers.get("user-agent")),
    }),
  );
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  // Best-effort and non-blocking: the package uses event.waitUntil() so bot
  // analytics never delay or fail the page response.
  trackAICrawlerRequest(request, event, {
    websiteId: DATAFAST_WEBSITE_ID,
    authToken: process.env.DATAFAST_BOT_TOKEN,
  });

  logMachineDiscoveryRequest(request);

  const isRepresentationRequest =
    request.method === "GET" || request.method === "HEAD";
  const publicMarkdownPage = isRepresentationRequest
    ? advertisedPublicMarkdownForHtmlPath(request.nextUrl.pathname)
    : undefined;

  if (
    isRepresentationRequest &&
    acceptsMarkdown(request.headers.get("accept"))
  ) {
    if (publicMarkdownPage) {
      return publicMarkdownResponse(
        publicMarkdownPage,
        request.method === "HEAD" ? "HEAD" : "GET",
      );
    }
  }

  const isProtected = protectedPrefixes.some(
    (prefix) =>
      request.nextUrl.pathname === prefix ||
      request.nextUrl.pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    const response = NextResponse.next();
    if (publicMarkdownPage) response.headers.set("vary", "Accept");
    return response;
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
