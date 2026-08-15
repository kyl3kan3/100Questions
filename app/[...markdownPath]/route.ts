import {
  publicMarkdownForMarkdownPath,
  publicMarkdownResponse,
} from "@/lib/public-markdown";

type RouteContext = {
  params: Promise<{ markdownPath: string[] }>;
};

async function markdownPageForContext({ params }: RouteContext) {
  const { markdownPath } = await params;
  return publicMarkdownForMarkdownPath(`/${markdownPath.join("/")}`);
}

export async function GET(_request: Request, context: RouteContext) {
  const page = await markdownPageForContext(context);
  if (!page) return new Response("Not found\n", { status: 404 });

  return publicMarkdownResponse(page);
}

export async function HEAD(_request: Request, context: RouteContext) {
  const page = await markdownPageForContext(context);
  if (!page) return new Response(null, { status: 404 });

  return publicMarkdownResponse(page, "HEAD");
}
