import { NextResponse, type NextRequest } from "next/server";

/**
 * Host-routing for creatives.utopiamodels.ai (knowledge#2608).
 *
 * The standalone creatives surface rides THIS already-green Vercel project instead
 * of a brand-new project built an hour before judges. When a request arrives on the
 * creatives host, its root and /background are rewritten to the dedicated /showcase
 * routes. Every OTHER host (hack.utopiamodels.ai — the deck) passes straight
 * through, and the matcher below limits this middleware to exactly "/" and
 * "/background", so the deck's routes are physically untouched.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();

  if (host.startsWith("creatives.utopiamodels.ai")) {
    const url = req.nextUrl.clone();
    if (url.pathname === "/") {
      url.pathname = "/showcase";
      return NextResponse.rewrite(url);
    }
    if (url.pathname === "/background") {
      url.pathname = "/showcase/background";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/background"],
};
