import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_SCOPES } from "@/lib/route/constants";
import { getOAuthBaseUrl } from "@/lib/oauth/base-url";

export async function GET(request: NextRequest) {
  const baseUrl = getOAuthBaseUrl(request);

  return NextResponse.json({
    issuer: baseUrl,
    authorization_endpoint: `${baseUrl}/api/mcp/authorize`,
    token_endpoint: `${baseUrl}/api/mcp/token`,
    registration_endpoint: `${baseUrl}/api/mcp/register`,
    scopes_supported: [...ALLOWED_SCOPES],
    response_types_supported: ["code"],
    response_modes_supported: ["query"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: [
      "none",
      "client_secret_post",
      "client_secret_basic",
    ],
  });
}
