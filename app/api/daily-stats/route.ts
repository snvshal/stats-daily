import { NextResponse } from "next/server";
import { dailyStats } from "@/lib/daily-stats";
import connectToDatabase from "@/lib/db/mongodb";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  try {
    await connectToDatabase();
    await dailyStats();
    return NextResponse.json({
      success: true,
      message: "Cron job executed successfully",
    });
  } catch (error) {
    console.error("Error running daily stats job:", error);
    return NextResponse.json({
      success: false,
      message: "Cron job not executed successfully",
    });
  }
}
