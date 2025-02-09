import EditorComponent from "@/components/text-editor/index";
import { isValid } from "date-fns";
import { ps } from "@/lib/utils";
import { DailyNote, InValidDate } from "@/components/daily-note";
import { getDailyNote, getDailyNotes } from "@/lib/daily-note";
import { TNote } from "@/lib/types";
import { Metadata } from "next";

export const generateMetadata = async ({
  params,
}: {
  params: { date: string };
}): Promise<Metadata> => {
  const { date } = params;

  return { title: `Note (${date})` };
};

export default async function DailyNotePage({
  params,
}: {
  params: { date: string };
}) {
  const { date } = params;

  // Handle "today" route with proper user check
  if (date === "today") {
    const parsedDate = new Date();
    const todayNote = await getDailyNote(parsedDate);

    return (
      <EditorComponent
        noteId={todayNote?._id?.toString() || null}
        content={todayNote?.content || "<p>Start typing here...</p>"}
      />
    );
  }

  // Parse and validate the date
  const parsedDate = new Date(date);
  if (!isValid(parsedDate)) return <InValidDate />;

  const note = await getDailyNote(parsedDate);
  const notes = await getDailyNotes();

  return (
    <DailyNote
      parsedDate={parsedDate}
      note={ps(note as TNote)}
      notes={ps(notes as TNote[])}
    />
  );
}
