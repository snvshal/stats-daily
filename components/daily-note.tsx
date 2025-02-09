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
      <div className="flex h-[calc(100vh-64px)]">
        <div className="flex w-96 flex-col overflow-hidden border-r max-md:hidden">
          <ScrollArea className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-col gap-4">
              <DailyNoteCards notes={notes} />
            </div>
          </ScrollArea>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-8">
          {note ? (
            <div className="rounded-lg bg-card p-6 shadow-sm">
              <div
                className="prose prose-sm dark:prose-invert max-w-none whitespace-pre"
                dangerouslySetInnerHTML={{ __html: note.content }}
              />
            </div>
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-lg border bg-card">
              <div className="text-center">
                <p className="text-muted-foreground">No note for this date</p>
                {isToday && (
                  <Link href="/notes/today">
                    <Button variant="outline" className="mt-4">
                      Create a note
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </TitleHeader>
  );
}

export function InValidDate() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
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
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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

  return (
    <>
      {notes.map((note) => (
        <Card
          key={note._id as string}
          className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-lg"
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
          <CardHeader className="border-b text-xl font-bold">
            <CardTitle className="text-base text-primary">
              {format(note.createdAt as Date, "MMMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div
              className="line-clamp-3 text-sm"
              dangerouslySetInnerHTML={{
                __html: replaceAnchorWithSpan(note.content),
              }}
            />
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
      {children}
    </div>
  );
}
