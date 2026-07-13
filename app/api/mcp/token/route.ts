import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ConsentChallenge } from "@/models/consent-challenge.model";
import { ClientRegistration } from "@/models/client-registration.model";
import {
  createAccessToken,
  rotateRefreshToken,
  lookupRefreshToken,
  ACCESS_TOKEN_TTL_SECONDS,
} from "@/mcp/oauth";

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const ct = request.headers.get("content-type") ?? "";
    let body: Record<string, string>;
    if (ct.includes("application/json")) {
      body = (await request.json()) as Record<string, string>;
    } else {
      const fd = await request.formData();
      body = Object.fromEntries(
        Array.from(fd.entries(), ([k, v]) => [
          k,
          typeof v === "string" ? v : v.name,
        ]),
      );
    }

    const grantType = body.grant_type ?? null;

    if (grantType === "authorization_code") {
      const code = body.code ?? null;
      const codeVerifier = body.code_verifier ?? null;
      const redirectUri = body.redirect_uri ?? null;
      const clientId = body.client_id ?? null;

      if (!code || !codeVerifier) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "Missing code or code_verifier",
          },
          { status: 400 },
        );
      }

      const authCode = await ConsentChallenge.findOneAndDelete({
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

      if (redirectUri) {
        const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "[::1]", "::1"];
        const isLoopbackHost = (h: string) => LOOPBACK_HOSTS.includes(h);

        let uriMatch: boolean;
        if (redirectUri === authCode.redirectUri) {
          uriMatch = true;
        } else {
          try {
            const reqUrl = new URL(redirectUri);
            const storedUrl = new URL(authCode.redirectUri);
            const hostMatch =
              reqUrl.hostname === storedUrl.hostname ||
              (isLoopbackHost(reqUrl.hostname) &&
                isLoopbackHost(storedUrl.hostname));
            uriMatch =
              hostMatch &&
              reqUrl.protocol === storedUrl.protocol &&
              reqUrl.pathname === storedUrl.pathname &&
              reqUrl.search === storedUrl.search;
          } catch {
            uriMatch = false;
          }
        }

        if (!uriMatch) {
          return NextResponse.json(
            {
              error: "invalid_grant",
              error_description: "redirect_uri mismatch",
            },
            { status: 400 },
          );
        }
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
      if (!registration) {
        return NextResponse.json(
          { error: "invalid_client", error_description: "Unknown client" },
          { status: 400 },
        );
      }

      const authMethod = registration.tokenEndpointAuthMethod ?? "none";
      if (authMethod === "client_secret_post") {
        if (!clientId || clientId !== authCode.clientId) {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Invalid client credentials",
            },
            { status: 400 },
          );
        }
        const secret = body.client_secret ?? null;
        if (
          !secret ||
          !registration.clientSecret ||
          Buffer.from(secret).length !==
            Buffer.from(registration.clientSecret).length
        ) {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Invalid client secret",
            },
            { status: 400 },
          );
        }
        if (
          !crypto.timingSafeEqual(
            Buffer.from(secret),
            Buffer.from(registration.clientSecret),
          )
        ) {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Invalid client secret",
            },
            { status: 400 },
          );
        }
      } else if (authMethod === "client_secret_basic") {
        const authHeader = request.headers.get("authorization") ?? "";
        if (!authHeader.startsWith("Basic ")) {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Basic authentication required",
            },
            { status: 400 },
          );
        }
        let headerClientId: string;
        let secret: string;
        try {
          const decoded = Buffer.from(
            authHeader.slice(6),
            "base64url",
          ).toString();
          const colon = decoded.indexOf(":");
          headerClientId = decodeURIComponent(
            colon >= 0 ? decoded.slice(0, colon) : decoded,
          );
          secret = colon >= 0 ? decoded.slice(colon + 1) : decoded;
        } catch {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Invalid client credentials",
            },
            { status: 400 },
          );
        }
        if (headerClientId !== authCode.clientId) {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Invalid client credentials",
            },
            { status: 400 },
          );
        }
        if (
          !registration.clientSecret ||
          Buffer.from(secret).length !==
            Buffer.from(registration.clientSecret).length
        ) {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Invalid client secret",
            },
            { status: 400 },
          );
        }
        if (
          !crypto.timingSafeEqual(
            Buffer.from(secret),
            Buffer.from(registration.clientSecret),
          )
        ) {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Invalid client secret",
            },
            { status: 400 },
          );
        }
      } else if (authMethod !== "none") {
        return NextResponse.json(
          {
            error: "invalid_client",
            error_description: "Unsupported token_endpoint_auth_method",
          },
          { status: 400 },
        );
      }

      const expectedChallenge = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");

      if (
        Buffer.from(expectedChallenge).length !==
        Buffer.from(authCode.codeChallenge).length
      ) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "PKCE verification failed",
          },
          { status: 400 },
        );
      }
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
      const refreshToken = body.refresh_token ?? null;
      if (!refreshToken) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "Missing refresh_token",
          },
          { status: 400 },
        );
      }

      const tokenInfo = await lookupRefreshToken(refreshToken);
      if (!tokenInfo) {
        return NextResponse.json(
          {
            error: "invalid_grant",
            error_description: "Invalid or expired refresh token",
          },
          { status: 400 },
        );
      }

      const clientId = body.client_id ?? tokenInfo.clientId ?? null;
      if (tokenInfo.clientId && clientId !== tokenInfo.clientId) {
        return NextResponse.json(
          { error: "invalid_grant", error_description: "client_id mismatch" },
          { status: 400 },
        );
      }

      if (tokenInfo.clientId) {
        const registration = await ClientRegistration.findOne({
          clientId: tokenInfo.clientId,
        });
        if (!registration) {
          return NextResponse.json(
            { error: "invalid_client", error_description: "Unknown client" },
            { status: 400 },
          );
        }

        const authMethod = registration.tokenEndpointAuthMethod ?? "none";
        if (authMethod === "client_secret_post") {
          if (!clientId || clientId !== tokenInfo.clientId) {
            return NextResponse.json(
              {
                error: "invalid_client",
                error_description: "Invalid client credentials",
              },
              { status: 400 },
            );
          }
          const secret = body.client_secret ?? null;
          if (
            !secret ||
            !registration.clientSecret ||
            Buffer.from(secret).length !==
              Buffer.from(registration.clientSecret).length
          ) {
            return NextResponse.json(
              {
                error: "invalid_client",
                error_description: "Invalid client secret",
              },
              { status: 400 },
            );
          }
          if (
            !crypto.timingSafeEqual(
              Buffer.from(secret),
              Buffer.from(registration.clientSecret),
            )
          ) {
            return NextResponse.json(
              {
                error: "invalid_client",
                error_description: "Invalid client secret",
              },
              { status: 400 },
            );
          }
        } else if (authMethod === "client_secret_basic") {
          const authHeader = request.headers.get("authorization") ?? "";
          if (!authHeader.startsWith("Basic ")) {
            return NextResponse.json(
              {
                error: "invalid_client",
                error_description: "Basic authentication required",
              },
              { status: 400 },
            );
          }
          let headerClientId: string;
          let secret: string;
          try {
            const decoded = Buffer.from(
              authHeader.slice(6),
              "base64url",
            ).toString();
            const colon = decoded.indexOf(":");
            headerClientId = decodeURIComponent(
              colon >= 0 ? decoded.slice(0, colon) : decoded,
            );
            secret = colon >= 0 ? decoded.slice(colon + 1) : decoded;
          } catch {
            return NextResponse.json(
              {
                error: "invalid_client",
                error_description: "Invalid client credentials",
              },
              { status: 400 },
            );
          }
          if (headerClientId !== tokenInfo.clientId) {
            return NextResponse.json(
              {
                error: "invalid_client",
                error_description: "Invalid client credentials",
              },
              { status: 400 },
            );
          }
          if (
            !registration.clientSecret ||
            Buffer.from(secret).length !==
              Buffer.from(registration.clientSecret).length
          ) {
            return NextResponse.json(
              {
                error: "invalid_client",
                error_description: "Invalid client secret",
              },
              { status: 400 },
            );
          }
          if (
            !crypto.timingSafeEqual(
              Buffer.from(secret),
              Buffer.from(registration.clientSecret),
            )
          ) {
            return NextResponse.json(
              {
                error: "invalid_client",
                error_description: "Invalid client secret",
              },
              { status: 400 },
            );
          }
        } else if (authMethod !== "none") {
          return NextResponse.json(
            {
              error: "invalid_client",
              error_description: "Unsupported token_endpoint_auth_method",
            },
            { status: 400 },
          );
        }
      }

      const tokens = await rotateRefreshToken(refreshToken);
      if (!tokens) {
        return NextResponse.json(
          {
            error: "server_error",
            error_description: "Failed to rotate refresh token",
          },
          { status: 500 },
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
