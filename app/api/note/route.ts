import connectToDatabase from "@/lib/db/mongodb";
import { currentUser } from "@/lib/db/stats";
import { Note } from "@/models/note.model";
import { endOfDay, startOfDay } from "date-fns";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { noteId, content } = body;

    // if (content.replace(/<[^>]*>/g, "").trim().length === 0) {
    //   return NextResponse.json(
    //     { message: "Title and content are required." },
    //     { status: 400 },
    //   );
    // }

    await connectToDatabase();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { message: "User not authenticated." },
        { status: 401 },
      );
    }

    let note;
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    if (noteId) {
      note = await Note.findOneAndUpdate(
        { _id: noteId, userId: user._id },
        { content },
        { new: true },
      );

      if (!note) {
        return NextResponse.json(
          { message: "Note not found or unauthorized." },
          { status: 404 },
        );
      }
    } else {
      const existingNote = await Note.findOne({
        userId: user._id,
        createdAt: {
          $gte: dayStart,
          $lte: dayEnd,
        },
      });

      if (existingNote) {
        note = await Note.findByIdAndUpdate(
          existingNote._id,
          { content },
          { new: true },
        );
      } else {
        note = await Note.create({
          userId: user._id,
          content,
        });
      }
    }

    return NextResponse.json(
      { message: "Note saved successfully!", noteId: note._id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving note:", error);
    return NextResponse.json(
      { message: "Error saving note.", error },
      { status: 500 },
    );
  }
}
