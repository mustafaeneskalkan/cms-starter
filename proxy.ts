import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN_COOKIE = process.env.ACCESS_TOKEN_COOKIE_NAME ?? "accessToken";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has(ACCESS_TOKEN_COOKIE);

  if (pathname.startsWith("/cms")) {
    if (!hasAccessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === "/login" && hasAccessToken) {
    return NextResponse.redirect(new URL("/cms", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/cms/:path*", "/login"],
};
