import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/db/mongodb";
import { AuthCode } from "@/models/auth-code.model";
import { ClientRegistration } from "@/models/client-registration.model";
import { ConsentChallenge } from "@/models/consent-challenge.model";
import { User } from "@/models/user.model";
import { ALLOWED_SCOPES } from "@/lib/route/constants";
import { renderConsentPage } from "@/lib/oauth/consent-page";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const responseType = searchParams.get("response_type");
    const clientId = searchParams.get("client_id");
    const redirectUri = searchParams.get("redirect_uri");
    const scope = searchParams.get("scope");
    const state = searchParams.get("state");
    const codeChallenge = searchParams.get("code_challenge");
    const codeChallengeMethod = searchParams.get("code_challenge_method");

    if (responseType !== "code") {
      return NextResponse.json(
        { error: "unsupported_response_type" },
        { status: 400 },
      );
    }

    if (!clientId || !redirectUri || !codeChallenge) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    if (codeChallengeMethod && codeChallengeMethod !== "S256") {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const registration = await ClientRegistration.findOne({ clientId });

    if (!registration) {
      return NextResponse.json(
        { error: "unauthorized_client" },
        { status: 400 },
      );
    }

    if (!registration.redirectUris.includes(redirectUri)) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const session = await getServerSession();

    if (!session?.user?.email) {
      const params = new URLSearchParams(searchParams);
      const callbackUrl = `/api/mcp/authorize?${params.toString()}`;
      const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
      const signInUrl = new URL("/api/auth/signin", baseUrl);
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(signInUrl);
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "access_denied" }, { status: 403 });
    }
    const userId = user._id.toString();

    const requestedScopes = scope
      ? scope
          .split(" ")
          .filter((s) => (ALLOWED_SCOPES as readonly string[]).includes(s))
      : ["mcp:areas:read", "mcp:notes:read", "mcp:achievements:read"];

    const consentToken = crypto.randomBytes(32).toString("hex");

    await ConsentChallenge.create({
      token: consentToken,
      userId,
      clientId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod: codeChallengeMethod ?? "S256",
      scope: requestedScopes,
      state: state ?? undefined,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const postUrl = new URL("/api/mcp/authorize", request.url);

    const denyUrl = new URL(redirectUri);
    denyUrl.searchParams.set("error", "access_denied");
    if (state) denyUrl.searchParams.set("state", state);

    return new NextResponse(
      renderConsentPage({
        clientName: registration.clientName ?? "MCP Client",
        scopes: requestedScopes,
        postUrl: postUrl.toString(),
        consentToken,
        denyUrl: denyUrl.toString(),
      }),
      { headers: { "Content-Type": "text/html" } },
    );
  } catch (err) {
    console.error("[MCP_AUTHORIZE_ERROR]", err);
    return NextResponse.json(
      { error: "server_error", error_description: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await request.formData();
    const consentToken = formData.get("consent_token");

    if (typeof consentToken !== "string" || !consentToken) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const challenge = await ConsentChallenge.findOneAndDelete({
      token: consentToken,
      expiresAt: { $gt: new Date() },
    });

    if (!challenge) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "access_denied" }, { status: 403 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user || user._id.toString() !== challenge.userId) {
      return NextResponse.json({ error: "access_denied" }, { status: 403 });
    }

    const code = crypto.randomBytes(32).toString("hex");

    await AuthCode.create({
      code,
      userId: challenge.userId,
      clientId: challenge.clientId,
      redirectUri: challenge.redirectUri,
      codeChallenge: challenge.codeChallenge,
      codeChallengeMethod: challenge.codeChallengeMethod,
      scope: challenge.scope,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    const redirectUrl = new URL(challenge.redirectUri);
    redirectUrl.searchParams.set("code", code);
    if (challenge.state) redirectUrl.searchParams.set("state", challenge.state);

    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("[MCP_AUTHORIZE_ERROR]", err);
    return NextResponse.json(
      { error: "server_error", error_description: "Internal server error" },
      { status: 500 },
    );
  }
}
