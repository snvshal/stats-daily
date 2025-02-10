import { NextResponse } from "next/server";
// import { dailyStats } from "@/lib/daily-stats";
// import connectToDatabase from "@/lib/db/mongodb";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", {
      status: 401,
    });
  }

  try {
    console.log("Cron job running...");
    // await connectToDatabase();
    // await dailyStats();
    return NextResponse.json(
      { message: "Daily stats job completed successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error running daily stats job:", error);
    return NextResponse.json(
      { error: "Failed to run daily stats job" },
      { status: 500 },
    );
  }
}
