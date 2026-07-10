import { NextRequest, NextResponse } from "next/server";
import {
  createMcpHandler,
  hostHeaderValidationResponse,
} from "@modelcontextprotocol/server";
import { validateAccessToken } from "@/mcp/oauth";
import { toAuthInfo } from "@/mcp/types";
import { createFactory } from "@/mcp/server";
import { getOAuthBaseUrl } from "@/lib/oauth/base-url";

const handler = createMcpHandler(createFactory(), { legacy: "stateless" });

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Authorization, Content-Type, Mcp-Method, Mcp-Name",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(request: NextRequest) {
  try {
    const metaUrl = getOAuthBaseUrl(request);
    const allowedHosts = [
      ...(process.env.MCP_BASE_URL
        ? [new URL(process.env.MCP_BASE_URL).host]
        : []),
      ...(process.env.NEXTAUTH_URL
        ? [new URL(process.env.NEXTAUTH_URL).host]
        : []),
      ...(process.env.MCP_ALLOWED_HOSTS
        ? process.env.MCP_ALLOWED_HOSTS.split(",").map((h) => h.trim()).filter(Boolean)
        : []),
      ...(process.env.VERCEL_URL ? [process.env.VERCEL_URL] : []),
      "localhost",
      "127.0.0.1",
      "[::1]",
    ];
    const hostValidation = hostHeaderValidationResponse(request, allowedHosts);
    if (hostValidation) return hostValidation;

    if (process.env.MCP_DISABLE_AUTH === "true") {
      const response = await handler.fetch(request);
      return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: { ...Object.fromEntries(response.headers), ...corsHeaders() },
      });
    }

    const auth = request.headers.get("authorization");

    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "unauthorized", message: "Bearer token required" },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": `Bearer realm="stats-daily", resource_metadata="${metaUrl}/.well-known/oauth-protected-resource"`,
            ...corsHeaders(),
          },
        },
      );
    }

    const rawToken = auth.slice(7);
    const doc = await validateAccessToken(rawToken);

    if (!doc) {
      return NextResponse.json(
        { error: "invalid_token", message: "Token is invalid or expired" },
        {
          status: 401,
          headers: {
            "WWW-Authenticate": `Bearer realm="stats-daily", error="invalid_token", resource_metadata="${metaUrl}/.well-known/oauth-protected-resource"`,
            ...corsHeaders(),
          },
        },
      );
    }

    const authInfo = toAuthInfo(doc, rawToken);
    const response = await handler.fetch(request, { authInfo });

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: { ...Object.fromEntries(response.headers), ...corsHeaders() },
    });
  } catch (err) {
    console.error("[MCP_POST_ERROR]", err);
    return NextResponse.json(
      { error: "server_error", error_description: "Internal server error" },
      { status: 500, headers: corsHeaders() },
    );
  }
}
