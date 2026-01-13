"use client";

import { Input } from "@/components/ui/input";
import {
  deleteAchievement,
  saveAchievement,
  updateAchievementNote,
} from "@/app/actions";
import {
  CheckIcon,
  LinkIcon,
  Loader2Icon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import IconButton from "@/components/ui/icon-button";
import { TAchievement, TAchievementTask } from "@/lib/types";
import { months, week } from "@/lib/constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, usePathname, useRouter } from "next/navigation";
import { TitleHeader } from "@/components/daily-note";
import { InputRequiredAlert } from "@/components/areas-comps/task-items";
import { TooltipComponent } from "@/components/ui/tooltip";

import {
  format,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  getDay,
  addDays,
  isAfter,
} from "date-fns";
import { cn, handleKeyDownEnter } from "@/lib/utils";

export default function AchievementForm({ id }: { id: string }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [emptyInputAlert, setEmptyInputAlert] = useState(false);

  const submitAchievement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input) {
      setEmptyInputAlert(true);
      return null;
    }

    setLoading(true);
    await saveAchievement(id, input);
    setInput("");
    setLoading(false);
  };

  return (
    <form
      onSubmit={submitAchievement}
      className="flex-start h-16 w-full gap-4 border-b p-4"
    >
      <Input
        name="achievement"
        value={input}
        onChange={(e) => {
          setEmptyInputAlert(false);
          setInput(e.target.value);
        }}
        className="h-9"
        labelClasses="flex-1"
        disabled={loading}
      />
      {emptyInputAlert && <InputRequiredAlert />}
      <Button
        variant={loading ? "ghost" : "default"}
        size="icon"
        type="submit"
        className="h-9 w-9 rounded-lg"
        disabled={loading}
      >
        {loading ? (
          <span className="animate-spin">
            <Loader2Icon size={16} />
          </span>
        ) : (
          <CheckIcon size={16} />
        )}
      </Button>
    </form>
  );
}

export function AchievementNote({
  achievement,
}: {
  achievement: TAchievement;
}) {
  const { _id: id, note } = achievement;

  const tRef = useRef<HTMLTextAreaElement>(null);

  const [inputNote, setInputNote] = useState(false);
  const [noteState, setNoteState] = useState(note as string);
  const [noteInput, setNoteInput] = useState(noteState);

  useEffect(() => {
    const textarea = tRef.current;
    if (inputNote && textarea) {
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [inputNote]);

  const handleNoteChange = async () => {
    setInputNote(false);
    setNoteState(noteInput);

    await updateAchievementNote(id as string, noteInput);
  };

  const handleInputNoteClose = () => {
    setInputNote(false);
    setNoteInput(noteState);
  };

  return (
    <>
      <div className="flex-between h-16 w-full p-4">
        <p className="font-bold">Note</p>
        {inputNote ? (
          <span className="flex gap-2">
            <IconButton
              onClick={handleNoteChange}
              aria-label="Save Edited Note"
            >
              <CheckIcon size={15} />
            </IconButton>
            <IconButton
              onClick={handleInputNoteClose}
              aria-label="Close Editing Note"
            >
              <XIcon size={15} />
            </IconButton>
          </span>
        ) : (
          <IconButton
            onClick={() => setInputNote(true)}
            aria-label="Edit note of the area"
          >
            <PencilIcon size={15} />
          </IconButton>
        )}
      </div>
      {inputNote ? (
        <div className="h-[calc(100%-4rem)] px-4 pb-4">
          <textarea
            ref={tRef}
            name="note"
            value={noteInput}
            className="bbn max-h-full w-full resize-none rounded-md bg-transparent p-2 max-sm:resize-y sm:h-full"
            onChange={(e) => setNoteInput(e.target.value)}
            rows={10}
            role="textbox"
            aria-label="Edit Note Textarea"
          />
        </div>
      ) : (
        <ScrollArea className="h-[calc(100%-4rem)] w-full overflow-auto overflow-x-hidden text-ellipsis px-4 pb-4">
          <p className="whitespace-pre-wrap">
            {noteState || (
              <span className="italic text-muted-foreground">empty</span>
            )}
          </p>
        </ScrollArea>
      )}
    </>
  );
}

export function AchievementNavButton() {
  const { date } = useParams();
  const pathname = usePathname();

  const links = [
    { label: "Note", href: `/achievements/${date}/note` },
    { label: "Graph", href: "/achievements/graph" },
    { label: "Today", href: "/achievements/today" },
  ];

  const filteredLinks = links.filter((link) => !(pathname === link.href));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="md:hidden" asChild>
        <Button size="icon" variant="outline">
          <LinkIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {filteredLinks.map((link) => (
          <DropdownMenuItem
            key={link.href}
            className={cn(
              "max-sm:h-10",
              (link.label === "Graph" || link.label === "Today") && "sm:hidden",
            )}
          >
            <Link href={link.href} className="w-full">
              {link.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AchievementComponent({
  children,
  achievementCount,
}: {
  children: React.ReactNode;
  achievementCount: number[];
}) {
  const { date } = useParams();
  const pathname = usePathname();

  let formattedDate = "";

  if (date) {
    if (date === "today") {
      formattedDate = format(new Date(), "MMM do");
    } else if (date === "graph") {
      formattedDate = "Graph";
    } else {
      const parsedDate = new Date(date as string);
      formattedDate = !isNaN(parsedDate.getTime())
        ? format(parsedDate, "MMM do")
        : "";
    }
  }

  const pageTitle = formattedDate
    ? `Achievements (${formattedDate})`
    : "Achievements";

  return (
    <TitleHeader page={pageTitle} actionItem={<AchievementNavButton />}>
      <div className="flex h-[calc(100dvh-4rem)] gap-4 p-4 max-sm:justify-center">
        <div
          className={cn(
            "flex flex-1 rounded-lg border",
            date === "graph" &&
              pathname !== "/achievements/graph/note" &&
              "max-sm:hidden",
          )}
        >
          {children}
        </div>
        <div
          className={cn(
            "rounded-lg sm:border",
            (date !== "graph" || pathname === "/achievements/graph/note") &&
              "max-sm:hidden",
          )}
        >
          <AchievementGraph achievementCount={achievementCount} />
        </div>
      </div>
    </TitleHeader>
  );
}

export function AchievementPageComponent({
  achievement,
}: {
  achievement: TAchievement;
}) {
  return (
    <>
      <div className="flex-1">
        <AchievementForm id={achievement._id as string} />
        <Tasks achievement={achievement} />
      </div>
      <div className="h-full w-2/5 border-l max-md:hidden">
        <AchievementNote achievement={achievement} />
      </div>
    </>
  );
}

export function Tasks({ achievement }: { achievement: TAchievement }) {
  const [achievements, setAchievements] = useState<TAchievementTask[]>(
    (achievement?.achievements ?? []) as TAchievementTask[],
  );

  const handleDelete = async (taskId: string) => {
    setAchievements((prev) => prev.filter((task) => task._id !== taskId));

    try {
      await deleteAchievement(achievement._id as string, taskId);
    } catch (error) {
      setAchievements((achievement?.achievements ?? []) as TAchievementTask[]);
      console.error("Failed to delete achievement:", error);
    }
  };

  return (
    <ScrollArea className="h-[calc(100dvh-10rem)] overflow-auto">
      {!achievements.length ? (
        <div className="flex-center h-full w-full pt-20">
          <p className="italic text-muted-foreground">empty</p>
        </div>
      ) : (
        <div className="p-4">
          {[...achievements].reverse()?.map((task, index) => (
            <div
              key={index}
              className="mb-2 box-border flex h-full gap-2 rounded-lg border p-2"
            >
              <div>
                <span className="flex-center bbn h-8 w-8 rounded-lg">
                  {index + 1}
                </span>
              </div>
              <div className="flex-1">
                <span>{task.text}</span>
                <button
                  onClick={() => handleDelete(task._id as string)}
                  className="float-right pl-2 pt-2 leading-3"
                >
                  <TrashIcon
                    size={15}
                    className="leading-3 text-muted-foreground hover:text-red-500"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  );
}

function AchievementGraph({
  achievementCount,
}: {
  achievementCount: number[];
}) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => setCurrentDate(new Date()), []);

  const daysInYear = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfYear(currentDate as Date),
        end: endOfYear(currentDate as Date),
      }),
    [currentDate],
  );

  const emptyCells = useMemo(
    () => Array.from({ length: getDay(daysInYear[0]) }),
    [daysInYear],
  );

  const getContributionColor = (
    count: number,
    date: Date,
    currentDate: Date,
  ) => {
    if (isAfter(date, currentDate)) {
      return "bg-foreground/5";
    }

    const levels = {
      0: "bg-foreground/10",
      1: "bg-foreground/25",
      3: "bg-foreground/50",
      5: "bg-foreground/70",
      10: "bg-foreground/85",
      max: "bg-foreground",
    };

    for (const [level, color] of Object.entries(levels)) {
      if (count <= Number(level)) {
        return color;
      }
    }

    return levels.max;
  };

  return (
    <ScrollArea className="w-full p-4 max-sm:py-10 sm:h-[calc(100dvh-6rem)] lg:px-8">
      <div className="flex justify-center gap-4">
        <div className="mt-10 flex flex-col justify-around">
          {months.map((month) => (
            <div key={month} className="text-sm">
              {month}
            </div>
          ))}
        </div>
        <div className="relative">
          <div className="flex-around mb-4">
            {week.map((day) => (
              <div key={day} className="text-sm">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-flow-row grid-cols-7 gap-1.5">
            {emptyCells.map((_, index) => (
              <div key={`empty-${index}`} className="h-4 w-4 bg-transparent" />
            ))}
            {achievementCount.map((count: number, index: number) => {
              const date = addDays(startOfYear(currentDate as Date), index);
              const formattedDate = format(date, "yyyy-MM-dd");
              return (
                <TooltipComponent
                  key={index}
                  content={
                    isAfter(date, currentDate as Date)
                      ? `Not yet available`
                      : `${count} achievements on ${format(date, "MMM do")}`
                  }
                >
                  <div
                    role="button"
                    tabIndex={1}
                    onKeyDown={(e) =>
                      handleKeyDownEnter(e, () =>
                        router.push(`/achievements/${formattedDate}`),
                      )
                    }
                    onClick={() =>
                      router.push(`/achievements/${formattedDate}`)
                    }
                    className={cn(
                      "h-4 w-4 rounded",
                      getContributionColor(count, date, currentDate),
                    )}
                  />
                </TooltipComponent>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export function UnavailableAchievementPage({ queryDate }: { queryDate: Date }) {
  return (
    <div className="flex-center w-full flex-col p-4">
      <p className="mb-4 text-pretty text-center text-lg">
        Achievements for {format(queryDate, "MMMM do, yyyy")} are not available.
      </p>
      <Button>
        <Link href="/achievements/today">Go to Today's Achievements</Link>
      </Button>
    </div>
  );
}
