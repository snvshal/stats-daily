import { NextRequest } from "next/server";
import { dailyStats } from "@/lib/daily-stats";
import connectToDatabase from "@/lib/db/mongodb";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    await connectToDatabase();
    await dailyStats();
    return Response.json({
      success: true,
      message: "Cron job executed successfully",
    });
  } catch (error) {
    console.error("Error running daily stats job:", error);
    return Response.json({
      success: false,
      message: "Cron job not executed successfully",
    });
  }
}
