import { NextRequest, NextResponse } from "next/server";
import { statsToday } from "@/lib/daily-stats";

export async function POST(request: NextRequest) {
  try {
    const { areaId, achieved } = await request.json();
    const response = await statsToday(areaId, achieved);

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: (error as Error).message,
    });
  }
}
