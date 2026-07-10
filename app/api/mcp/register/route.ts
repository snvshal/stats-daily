import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { ClientRegistration } from "@/models/client-registration.model";

type RegistrationRequest = {
  redirect_uris?: string[];
  client_name?: string;
  grant_types?: string[];
  response_types?: string[];
  token_endpoint_auth_method?: string;
  scope?: string;
};

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    let body: RegistrationRequest;
    const ct = request.headers.get("content-type") ?? "";

    try {
      if (ct.includes("application/json")) {
        body = (await request.json()) as RegistrationRequest;
      } else if (ct.includes("application/x-www-form-urlencoded")) {
        const fd = await request.formData();
        body = Object.fromEntries(fd) as unknown as RegistrationRequest;
      } else {
        return NextResponse.json(
          { error: "invalid_client_metadata" },
          { status: 400 },
        );
      }
    } catch {
      return NextResponse.json(
        {
          error: "invalid_client_metadata",
          error_description: "Invalid request body",
        },
        { status: 400 },
      );
    }

    const redirectUris = body.redirect_uris;
    const clientName = body.client_name;
    const grantTypes = body.grant_types;
    const responseTypes = body.response_types;
    const tokenEndpointAuthMethod = body.token_endpoint_auth_method;
    const scope = body.scope;

    const SUPPORTED_AUTH_METHODS = [
      "none",
      "client_secret_post",
      "client_secret_basic",
    ];

    if (
      tokenEndpointAuthMethod &&
      !SUPPORTED_AUTH_METHODS.includes(tokenEndpointAuthMethod)
    ) {
      return NextResponse.json(
        {
          error: "invalid_client_metadata",
          error_description: `Unsupported token_endpoint_auth_method. Supported: ${SUPPORTED_AUTH_METHODS.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (
      !redirectUris ||
      !Array.isArray(redirectUris) ||
      redirectUris.length === 0
    ) {
      return NextResponse.json(
        {
          error: "invalid_client_metadata",
          error_description: "redirect_uris is required",
        },
        { status: 400 },
      );
    }

    for (const uri of redirectUris) {
      try {
        const parsed = new URL(uri);
        if (
          parsed.protocol !== "https:" &&
          parsed.hostname !== "localhost" &&
          parsed.hostname !== "127.0.0.1" &&
          parsed.hostname !== "[::1]"
        ) {
          return NextResponse.json(
            {
              error: "invalid_client_metadata",
              error_description: "redirect_uri must be HTTPS (except localhost)",
            },
            { status: 400 },
          );
        }
      } catch {
        return NextResponse.json(
          {
            error: "invalid_client_metadata",
            error_description: `Invalid redirect_uri: ${uri}`,
          },
          { status: 400 },
        );
      }
    }

    const clientId = `mcp_${crypto.randomBytes(24).toString("base64url")}`;
    const clientSecret = crypto.randomBytes(32).toString("base64url");

    await ClientRegistration.create({
      clientId,
      clientSecret,
      clientName,
      redirectUris,
      grantTypes: grantTypes ?? ["authorization_code", "refresh_token"],
      responseTypes: responseTypes ?? ["code"],
      tokenEndpointAuthMethod: tokenEndpointAuthMethod ?? "none",
      scope,
      createdAt: new Date(),
    });

    return NextResponse.json(
      {
        client_id: clientId,
        client_secret: clientSecret,
        client_id_issued_at: Math.floor(Date.now() / 1000),
        client_secret_expires_at: 0,
        redirect_uris: redirectUris,
        grant_types: grantTypes ?? ["authorization_code", "refresh_token"],
        response_types: responseTypes ?? ["code"],
        token_endpoint_auth_method: tokenEndpointAuthMethod ?? "none",
        ...(scope && { scope }),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[MCP_REGISTER_ERROR]", err);
    return NextResponse.json(
      { error: "server_error", error_description: "Internal server error" },
      { status: 500 },
    );
  }
}
