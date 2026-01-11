import { NextResponse } from "next/server";
import { ApiKey } from "@/models/api-key.model";
import { hashApiKey } from "@/lib/api-key";
import connectToDatabase from "@/lib/db/mongodb";
import { Area } from "@/models/task.model";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const auth = req.headers.get("authorization");
    const apiKey = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 401 });
    }

    const keyHash = hashApiKey(apiKey);

    const key = await ApiKey.findOne({
      keyHash,
      revoked: false,
      scopes: { $in: ["mcp:read"] },
      $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
    });

    if (!key) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 403 });
    }

    const userId = key.userId;

    const areas = await Area.find({ userId })
      .select("area note tasks updatedAt")
      .lean();

    return NextResponse.json({
      user: userId,
      context: areas,
    });
  } catch (error) {
    console.error("[MCP_CONTEXT_ERROR]", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
