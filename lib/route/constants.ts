export const ALLOWED_SCOPES = [
  "mcp:areas:read",
  "mcp:areas:write",
  "mcp:achievements:read",
  "mcp:achievements:write",
  "mcp:notes:read",
  "mcp:notes:write",
] as const;

export type Scope = (typeof ALLOWED_SCOPES)[number];
