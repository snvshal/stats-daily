export const ALLOWED_SCOPES = [
  "mcp:read",
  "mcp:areas:read",
  "mcp:achievements:read",
  "mcp:achievements:write",
] as const;

export const BASE_SCOPES = ["mcp:read"] as Scope[];

export type Scope = (typeof ALLOWED_SCOPES)[number];
