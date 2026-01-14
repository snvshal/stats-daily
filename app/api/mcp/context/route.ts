import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { Area } from "@/models/task.model";
import { trackApiUsage } from "@/lib/route/track-usage";
import { authenticate } from "@/lib/route/authenticate";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const key = await authenticate(req, "mcp:areas:read");
    if (!key) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = key.userId;

    const areas = await Area.find({ userId })
      .select("area note tasks updatedAt")
      .lean();

    await trackApiUsage({
      apiKeyId: key.id,
      userId,
      resource: "api.mcp.context.read",
    });

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
