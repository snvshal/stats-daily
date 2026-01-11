import { NextResponse } from "next/server";
import { ApiKey } from "@/models/api-key.model";
import { generateApiKey, hashApiKey } from "@/lib/api-key";
import connectToDatabase from "@/lib/db/mongodb";
import { currentUser } from "@/lib/db/stats";

export async function GET() {
  try {
    await connectToDatabase();
    const user = await currentUser();
    if (!user) return NextResponse.json([], { status: 401 });

    const keys = await ApiKey.find({ userId: user.id }).select("-keyHash");

    return NextResponse.json(keys);
  } catch (error) {
    console.error("Get API key Error:", error);

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
    if (!user) return NextResponse.json({}, { status: 401 });

    const { name, scopes = [] } = await req.json();

    const exists = await ApiKey.findOne({
      userId: user.id,
      name,
      revoked: false,
      scopes: "mcp:read",
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
    console.error("Post API key Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
