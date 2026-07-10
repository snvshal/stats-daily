import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_SCOPES } from "@/lib/route/constants";
import { getOAuthBaseUrl } from "@/lib/oauth/base-url";

export async function GET(request: NextRequest) {
  const baseUrl = getOAuthBaseUrl(request);

  return NextResponse.json({
    resource: `${baseUrl}/api/mcp`,
    authorization_servers: [baseUrl],
    scopes_supported: [...ALLOWED_SCOPES],
    bearer_methods_supported: ["header"],
  });
}
