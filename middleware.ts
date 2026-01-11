import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  if (url.startsWith("/api/auth")) return NextResponse.next();
  if (url.startsWith("/api/mcp")) return NextResponse.next();

  const token = await getToken({ req });

  if (url.startsWith("/api")) {
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const publicRoutes = ["/", "/countdown"];
  const authRoutes = ["/sign-in"];

  const isPublicRoute = publicRoutes.includes(url);
  const isAuthRoute = authRoutes.some((route) => url.startsWith(route));

  if (!token && !isPublicRoute && !isAuthRoute) {
    const redirectUrl = new URL(`/sign-in?callbackUrl=${url}`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/api/:path*",
  ],
};
