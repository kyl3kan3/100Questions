import { NextResponse, type NextRequest } from "next/server";

import { getAuth } from "@/lib/auth/server";

const protectedPrefixes = ["/dashboard", "/runs"];

export async function proxy(request: NextRequest) {
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
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|\\.well-known/workflow).*)",
  ],
};
