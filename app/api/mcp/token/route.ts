import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { AuthCode } from "@/models/auth-code.model";
import { ClientRegistration } from "@/models/client-registration.model";
import {
  createAccessToken,
  rotateRefreshToken,
  ACCESS_TOKEN_TTL_SECONDS,
} from "@/mcp/oauth";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.formData();
    const grantType = body.get("grant_type") as string | null;

    if (grantType === "authorization_code") {
      const code = body.get("code") as string | null;
      const codeVerifier = body.get("code_verifier") as string | null;
      const redirectUri = body.get("redirect_uri") as string | null;
      const clientId = body.get("client_id") as string | null;

      if (!code || !codeVerifier) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "Missing code or code_verifier",
          },
          { status: 400 },
        );
      }

      const authCode = await AuthCode.findOneAndDelete({
        code,
        expiresAt: { $gt: new Date() },
      });

      if (!authCode) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "Invalid or expired authorization code",
          },
          { status: 400 },
        );
      }

      if (redirectUri && authCode.redirectUri !== redirectUri) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "redirect_uri mismatch",
          },
          { status: 400 },
        );
      }

      if (clientId && authCode.clientId !== clientId) {
        return NextResponse.json(
          { error: "invalid_grant", error_description: "client_id mismatch" },
          { status: 400 },
        );
      }

      const registration = await ClientRegistration.findOne({
        clientId: authCode.clientId,
      });
      if (registration) {
        const method = registration.tokenEndpointAuthMethod;
        if (method !== "none") {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Unsupported token_endpoint_auth_method",
            },
            { status: 400 },
          );
        }
      }

      const expectedChallenge = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");

      if (
        !crypto.timingSafeEqual(
          Buffer.from(expectedChallenge),
          Buffer.from(authCode.codeChallenge),
        )
      ) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "PKCE verification failed",
          },
          { status: 400 },
        );
      }

      const tokens = await createAccessToken(
        authCode.userId,
        authCode.scope,
        authCode.clientId,
      );

      return NextResponse.json({
        access_token: tokens.accessToken,
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_TTL_SECONDS,
        refresh_token: tokens.refreshToken,
        scope: authCode.scope.join(" "),
      });
    }

    if (grantType === "refresh_token") {
      const refreshToken = body.get("refresh_token") as string | null;
      if (!refreshToken) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "Missing refresh_token",
          },
          { status: 400 },
        );
      }

      const tokens = await rotateRefreshToken(refreshToken);
      if (!tokens) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "Invalid or expired refresh token",
          },
          { status: 400 },
        );
      }

      return NextResponse.json({
        access_token: tokens.accessToken,
        token_type: "Bearer",
        expires_in: ACCESS_TOKEN_TTL_SECONDS,
        refresh_token: tokens.refreshToken,
        scope: tokens.scope.join(" "),
      });
    }

    return NextResponse.json(
      { error: "unsupported_grant_type" },
      { status: 400 },
    );
  } catch (err) {
    console.error("[MCP_TOKEN_ERROR]", err);
    return NextResponse.json(
      { error: "server_error", error_description: "Internal server error" },
      { status: 500 },
    );
  }
}
