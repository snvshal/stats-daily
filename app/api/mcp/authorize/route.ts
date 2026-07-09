import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/db/mongodb";
import { AuthCode } from "@/models/auth-code.model";
import { ClientRegistration } from "@/models/client-registration.model";
import { ConsentChallenge } from "@/models/consent-challenge.model";
import { User } from "@/models/user.model";
import { ALLOWED_SCOPES } from "@/lib/route/constants";

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
      `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Authorize Application</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;max-width:480px;margin:40px auto;padding:0 16px;color:#1a1a1a}
  h1{font-size:1.4rem;margin-bottom:4px}
  .client{color:#666;font-size:.9rem;margin-bottom:24px}
  ul{padding-left:20px;margin-bottom:24px;line-height:1.6}
  .actions{display:flex;gap:12px}
  .btn{flex:1;padding:10px 0;border-radius:8px;border:none;font-size:1rem;cursor:pointer;text-align:center;text-decoration:none;display:inline-block}
  .btn-primary{background:#0066cc;color:#fff}
  .btn-primary:hover{background:#0052a3}
  .btn-secondary{background:#e5e5e5;color:#333}
  .btn-secondary:hover{background:#ccc}
</style>
</head>
<body>
  <h1>Authorize access</h1>
  <p class="client">${escapeHtml(registration.clientName ?? "MCP Client")} wants to:</p>
  <ul>${requestedScopes.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
  <form method="post" action="${escapeHtml(postUrl.toString())}" style="display:flex;gap:12px">
    <input type="hidden" name="consent_token" value="${consentToken}">
    <a href="${escapeHtml(denyUrl.toString())}" class="btn btn-secondary">Deny</a>
    <button type="submit" class="btn btn-primary">Approve</button>
  </form>
</body>
</html>`,
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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
