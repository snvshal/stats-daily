import crypto from "crypto";
import connectToDatabase from "@/lib/db/mongodb";
import { OAuthToken } from "@/models/oauth-token.model";
import { hashToken } from "@/lib/crypto-utils";
import type { TOAuthToken } from "@/lib/types";

export const ACCESS_TOKEN_TTL_SECONDS = 900;
export const REFRESH_TOKEN_TTL_SECONDS = 86400;

function generateToken(): string {
  return `mcp_${crypto.randomBytes(32).toString("base64url")}`;
}

export async function createAccessToken(
  userId: string,
  scopes: string[],
  clientId?: string,
  ttlSeconds: number = ACCESS_TOKEN_TTL_SECONDS,
): Promise<{ accessToken: string; refreshToken: string }> {
  await connectToDatabase();

  const accessToken = generateToken();
  const accessHash = hashToken(accessToken);

  const refreshToken = generateToken();
  const refreshHash = hashToken(refreshToken);

  const now = new Date();

  await OAuthToken.create([
    {
      tokenHash: accessHash,
      userId,
      type: "access",
      scopes,
      expiresAt: new Date(now.getTime() + ttlSeconds * 1000),
      clientId,
    },
    {
      tokenHash: refreshHash,
      userId,
      type: "refresh",
      scopes,
      expiresAt: new Date(now.getTime() + REFRESH_TOKEN_TTL_SECONDS * 1000),
      clientId,
    },
  ]);

  return { accessToken, refreshToken };
}

export async function lookupRefreshToken(
  rawRefreshToken: string,
): Promise<{ clientId?: string } | null> {
  await connectToDatabase();

  const tokenHash = hashToken(rawRefreshToken);
  const doc = await OAuthToken.findOne({
    tokenHash,
    type: "refresh",
    expiresAt: { $gt: new Date() },
  });

  if (!doc) return null;
  return { clientId: doc.clientId };
}

export async function validateAccessToken(
  rawToken: string,
): Promise<TOAuthToken | null> {
  await connectToDatabase();

  const tokenHash = hashToken(rawToken);
  const doc = await OAuthToken.findOne({
    tokenHash,
    type: "access",
    expiresAt: { $gt: new Date() },
  });

  return doc;
}

export async function rotateRefreshToken(
  rawRefreshToken: string,
  scopes?: string[],
): Promise<{
  accessToken: string;
  refreshToken: string;
  scope: string[];
} | null> {
  await connectToDatabase();

  const tokenHash = hashToken(rawRefreshToken);
  const doc = await OAuthToken.findOneAndDelete({
    tokenHash,
    type: "refresh",
    expiresAt: { $gt: new Date() },
  });

  if (!doc) return null;

  await OAuthToken.deleteMany({ userId: doc.userId, type: "access" });

  const resolvedScopes = scopes ?? doc.scopes;
  const tokens = await createAccessToken(
    doc.userId,
    resolvedScopes,
    doc.clientId,
  );
  return { ...tokens, scope: resolvedScopes };
}
