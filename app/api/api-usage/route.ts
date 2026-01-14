import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import { currentUser } from "@/lib/db/stats";
import { ApiUsage } from "@/models/api-usage.model";

export async function GET() {
  try {
    await connectToDatabase();

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const usage = await ApiUsage.find({ userId: user.id })
      .sort({ date: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Get API usage error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
