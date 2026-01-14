import connectToDatabase from "@/lib/db/mongodb";
import { currentUser } from "@/lib/db/stats";
import { ALLOWED_SCOPES } from "@/lib/route/constants";
import { ApiKey } from "@/models/api-key.model";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  try {
    await connectToDatabase();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { apiKeyId, scopes } = await req.json();

    if (!apiKeyId || !Array.isArray(scopes)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const invalid = scopes.filter((s) => !ALLOWED_SCOPES.includes(s));
    if (invalid.length) {
      return NextResponse.json(
        { error: "Invalid scopes", invalid },
        { status: 400 },
      );
    }

    const key = await ApiKey.findOneAndUpdate(
      {
        _id: apiKeyId,
        userId: user.id,
        revoked: false,
      },
      { scopes },
      { new: true },
    );

    if (!key) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, scopes: key.scopes });
  } catch (error) {
    console.error("Update API key permissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
