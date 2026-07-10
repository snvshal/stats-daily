import { NextRequest } from "next/server";

export function getOAuthBaseUrl(request?: NextRequest): string {
  if (process.env.MCP_BASE_URL) return process.env.MCP_BASE_URL;

  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;

  if (request) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https";
    const host = request.headers.get("x-forwarded-host");
    if (host) return `${proto}://${host}`;

    return request.nextUrl.origin;
  }

  return "http://localhost:3000";
}
