import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { Achievement } from "@/models/acmt.model";
import { authenticate } from "@/lib/route/authenticate";
import { trackApiUsage } from "@/lib/route/track-usage";

export async function GET(req: Request) {
  try {
    await connectToDatabase();

    const key = await authenticate(req, "mcp:achievements:read");

    if (!key) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await trackApiUsage({
      apiKeyId: key.id,
      userId: key.userId,
      resource: "api.mcp.achievements.read",
    });

    const data = await Achievement.findOne({ userId: key.userId }).select(
      "achievements note createdAt",
    );

    if (!data) {
      return NextResponse.json(
        { error: "Achievements not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("GET achievements error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const key = await authenticate(req, "mcp:achievements:write");
    if (!key) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { text, note } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    await trackApiUsage({
      apiKeyId: key.id,
      userId: key.userId,
      resource: "api.mcp.achievements.write",
    });

    let doc = await Achievement.findOne({ userId: key.userId });

    if (!doc) {
      doc = new Achievement({
        userId: key.userId,
        achievements: [{ text }],
        note: note?.trim() || undefined,
      });
    } else {
      doc.achievements.push({ text: `[MCP] ${text}` });

      if (note?.trim()) {
        doc.note = doc.note
          ? `${doc.note}\n\n[MCP]\n----\n${note.trim()}\n----`
          : `[MCP]\n----\n${note.trim()}\n----`;
      }
    }

    await doc.save();

    return NextResponse.json({
      success: true,
      message: `${note?.trim() ? "Achievement and note" : "Achievement"} saved successfully.`,
    });
  } catch (err) {
    console.error("POST achievements error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
