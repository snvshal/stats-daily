import { NextResponse } from "next/server";
import { ApiKey } from "@/models/api-key.model";
import connectToDatabase from "@/lib/db/mongodb";
import { currentUser } from "@/lib/db/stats";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  await connectToDatabase();
  const user = await currentUser();
  if (!user) return NextResponse.json({}, { status: 401 });

  await ApiKey.updateOne(
    { _id: params.id, userId: user.id },
    { revoked: true },
  );

  return NextResponse.json({ success: true });
}
