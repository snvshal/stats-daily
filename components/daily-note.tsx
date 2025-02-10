"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, PencilIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { TNote } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";

export function DailyNote({
  note,
  notes,
  parsedDate,
}: {
  note: TNote;
  notes: TNote[];
  parsedDate: Date;
}) {
  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, [router]);

  const formattedDate = format(parsedDate, "MMMM d, yyyy");
  const isToday =
    format(new Date(), "yyyy-MM-dd") === format(parsedDate, "yyyy-MM-dd");

  const isNoteContentEmpty =
    note && note.content.replace(/<[^>]*>/g, "").trim().length === 0;

  return (
    <TitleHeader
      page={formattedDate}
      actionItem={
        <Link href="/notes/today">
          <Button size="icon" variant="outline">
            {isToday ? (
              note ? (
                <PencilIcon className="size-4" />
              ) : (
                <PlusIcon className="size-4" />
              )
            ) : (
              <p className="text-lg font-medium">T</p>
            )}
          </Button>
        </Link>
      }
    >
      <div className="relative flex">
        <div className="sticky top-0 flex h-[calc(100vh-64px)] w-96 flex-col overflow-hidden border-r max-md:hidden">
          <ScrollArea className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <DailyNoteCards notes={notes} />
            </div>
          </ScrollArea>
        </div>
        <div className="flex-1">
          <div className="rounded-lg bg-card px-6 pb-12 pt-6 shadow-sm max-md:px-12 max-sm:px-6 lg:px-12">
            {note ? (
              isNoteContentEmpty ? (
                <p className="italic text-muted-foreground">Empty</p>
              ) : (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
              )
            ) : (
              <div>
                <p className="italic text-muted-foreground">
                  No note found for {formattedDate}
                </p>
                {isToday && (
                  <Link href="/notes/today">
                    <Button variant="outline" className="mt-4">
                      Create a note
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </TitleHeader>
  );
}

export function InValidDate() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-2xl font-bold">Invalid Date</p>
        <p className="mt-2 text-muted-foreground">Please select a valid date</p>
        <Link href="/notes/today">
          <Button className="mt-4">
            <PlusIcon className="mr-2 h-4 w-4" />
            Create Note
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function DailyNotes({ notes }: { notes: TNote[] }) {
  return (
    <TitleHeader
      page="Notes"
      actionItem={
        <Link href="/notes/today">
          <Button size="icon" variant="outline">
            <p className="text-lg font-medium">T</p>
          </Button>
        </Link>
      }
    >
      <div className="container mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <DailyNoteCards notes={notes} />
        </div>
      </div>
    </TitleHeader>
  );
}

export function DailyNoteCards({ notes }: { notes: TNote[] }) {
  const router = useRouter();

  const readNote = (note: TNote) => {
    const formattedDate = new Date(note.createdAt as Date)
      ?.toISOString()
      .split("T")[0];
    router.push(`/notes/${formattedDate}`);
  };

  const replaceAnchorWithSpan = (html: string): string => {
    return html.replace(/<a\b[^>]*>(.*?)<\/a>/g, "<span>$1</span>");
  };

  const isNoteContentEmpty = (content: string) =>
    content && content.replace(/<[^>]*>/g, "").trim().length === 0;

  return (
    <>
      {notes.map((note) => (
        <Card
          key={note._id as string}
          className="group relative h-[200px] cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
          onClick={() => readNote(note)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              readNote(note);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Read note from ${format(note.createdAt as Date, "MMMM d, yyyy")}`}
        >
          <div className="absolute inset-0 z-10 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/10" />
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base text-primary">
              {format(note.createdAt as Date, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isNoteContentEmpty(note.content) ? (
              <p className="italic text-muted-foreground">Empty</p>
            ) : (
              <div
                className="line-clamp-3 text-sm"
                dangerouslySetInnerHTML={{
                  __html: replaceAnchorWithSpan(note.content),
                }}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function TitleHeader({
  page,
  children,
  actionItem,
}: {
  page: string;
  children: React.ReactNode;
  actionItem?: JSX.Element;
}) {
  const router = useRouter();
  return (
    <div>
      <header className="flex-between sticky top-0 z-40 h-16 border-b bg-background px-4 lg:px-6">
        <div className="flex-start gap-4">
          <button onClick={() => router.back()}>
            <ArrowLeftIcon className="size-6" />
          </button>
          <p className="text-lg font-semibold">{page}</p>
        </div>
        <div>{actionItem}</div>
      </header>
      <ScrollArea className="relative flex w-full justify-center overflow-auto">
        <div className="mx-auto box-border max-w-6xl flex-1">{children}</div>
      </ScrollArea>
    </div>
  );
}
