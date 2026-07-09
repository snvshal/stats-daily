import type { AuthInfo } from "@modelcontextprotocol/server";
import type { TOAuthToken } from "@/lib/types";

export function toAuthInfo(token: TOAuthToken, rawToken: string): AuthInfo {
  return {
    token: rawToken,
    clientId: token.clientId ?? "mcp-client",
    scopes: token.scopes,
    expiresAt: Math.floor(token.expiresAt.getTime() / 1000),
    extra: { userId: token.userId },
  };
}
