import { NextResponse } from "next/server";
import { ALLOWED_SCOPES } from "@/lib/route/constants";

export async function GET() {
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  return NextResponse.json({
    resource: `${baseUrl}/api/mcp`,
    authorization_servers: [baseUrl],
    scopes_supported: [...ALLOWED_SCOPES],
    bearer_methods_supported: ["header"],
  });
}
