import { NextResponse } from "next/server";
import { ApiKey } from "@/models/api-key.model";
import { generateApiKey, hashApiKey } from "@/lib/api-key";
import connectToDatabase from "@/lib/db/mongodb";
import { currentUser } from "@/lib/db/stats";

export async function GET() {
  try {
    await connectToDatabase();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await ApiKey.find({ userId: user.id })
      .sort({ updatedAt: -1 })
      .select("-keyHash");

    return NextResponse.json(keys);
  } catch (error) {
    console.error("Get API key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, scopes = ["mcp:read"] } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const exists = await ApiKey.findOne({
      userId: user.id,
      name,
      revoked: false,
      scopes: { $in: scopes },
    });

    if (exists) {
      return NextResponse.json(
        { error: "API key name already exists" },
        { status: 409 },
      );
    }

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);

    await ApiKey.create({
      userId: user.id,
      name,
      scopes,
      keyHash,
    });

    return NextResponse.json({ apiKey: rawKey });
  } catch (error) {
    console.error("Post API key error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
