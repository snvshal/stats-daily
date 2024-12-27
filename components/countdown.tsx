"use client";

import React, { useEffect, useState } from "react";
import {
  format,
  isBefore,
  eachDayOfInterval,
  startOfYear,
  endOfYear,
  isSameDay,
  getDaysInMonth,
} from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TooltipComponent } from "./ui/tooltip";
import Cookies from "js-cookie";

const TimeBox = ({
  value,
  unit,
  max,
}: {
  value: number;
  unit: string;
  max: number;
}) => {
  const percentage = 100 - (value / max) * 100;

  return (
    <div className="group relative overflow-hidden border border-green-500/30 bg-black p-4">
      <div className="absolute inset-0 bg-green-500/5"></div>
      <div className="relative z-10">
        <div className="text-3xl font-bold tabular-nums tracking-wider">
          {value.toString().padStart(2, "0")}
        </div>
        <div className="mt-1 text-xs uppercase tracking-wider opacity-50">
          {unit}
        </div>
      </div>
      <div className="absolute inset-0 border border-green-500/30">
        <div
          className="absolute left-0 top-0 h-full bg-green-500/20 transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

const CyberCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [targetDate, setTargetDate] = useState<Date | null>(null);
  const [completedMessage, setCompletedMessage] = useState(false);
  const [daysInCurrentMonth, setDaysInCurrentMonth] = useState(30);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const defaultTargetDate = new Date(currentYear + 1, 0, 1);
    const savedTargetDate = Cookies.get("targetDate")
      ? new Date(Cookies.get("targetDate")!)
      : defaultTargetDate;

    if (!targetDate || targetDate.getTime() !== savedTargetDate.getTime()) {
      setTargetDate(savedTargetDate);
    }

    if (targetDate) {
      setDaysInCurrentMonth(getDaysInMonth(targetDate));
    }

    const timer = setInterval(() => {
      if (!targetDate) return;

      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setCompletedMessage(true);
        return;
      }

      setCompletedMessage(false);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const handleSetTargetDate = (date: Date) => {
    if (date && (!targetDate || targetDate.getTime() !== date.getTime())) {
      const parsedDate = new Date(date);
      setTargetDate(parsedDate);
      Cookies.set("targetDate", parsedDate.toISOString(), { expires: 365 });
    }
  };

  const daysInYear = eachDayOfInterval({
    start: startOfYear(new Date()),
    end: endOfYear(new Date()),
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black p-4 font-mono text-green-500">
      <div className="relative w-full max-w-4xl p-8">
        <div className="absolute inset-0 border border-green-500/30">
          <div className="absolute -left-2 -top-2 h-4 w-4 border-l border-t border-green-500"></div>
          <div className="absolute -right-2 -top-2 h-4 w-4 border-r border-t border-green-500"></div>
          <div className="absolute -bottom-2 -left-2 h-4 w-4 border-b border-l border-green-500"></div>
          <div className="absolute -bottom-2 -right-2 h-4 w-4 border-b border-r border-green-500"></div>
        </div>

        {completedMessage ? (
          <div className="relative text-center">
            <div className="mb-4 animate-pulse text-4xl">MISSION COMPLETE</div>
            <div className="text-2xl">{format(targetDate as Date, "PPP")}</div>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="text-sm uppercase tracking-widest opacity-50">
                TARGET DATE
              </div>
              <div className="mt-2 text-2xl font-bold tracking-wider">
                {targetDate ? format(targetDate, "PPP") : "AWAITING INPUT"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <TimeBox
                value={timeLeft.days}
                unit="days"
                max={daysInCurrentMonth}
              />
              <TimeBox value={timeLeft.hours} unit="hours" max={24} />
              <TimeBox value={timeLeft.minutes} unit="minutes" max={60} />
              <TimeBox value={timeLeft.seconds} unit="seconds" max={60} />
            </div>

            <div className="mt-8 w-full">
              <ScrollArea className="border border-green-500/30 bg-black/50 p-4">
                <div className="grid grid-cols-[repeat(54,_1fr)] gap-1">
                  {daysInYear.map((day) => (
                    <TooltipComponent
                      key={day.toISOString()}
                      content={format(day, "PPP")}
                      className="rounded-none bg-green-800/20 text-green-500"
                    >
                      <div
                        className={cn(
                          "h-3 w-3",
                          isSameDay(day, targetDate as Date)
                            ? "animate-pulse bg-green-500"
                            : isBefore(day, new Date())
                              ? "bg-green-500/20 hover:bg-green-500/30"
                              : "bg-green-500/10 hover:bg-green-500/30",
                        )}
                      />
                    </TooltipComponent>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
              </ScrollArea>
            </div>
          </>
        )}

        <DatePicker date={targetDate} onSelect={handleSetTargetDate} />
      </div>
    </div>
  );
};

const DatePicker = ({
  date,
  onSelect,
}: {
  date: Date | null;
  onSelect: (date: Date) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 rounded-none border border-green-500/30 bg-black hover:bg-green-500/20"
        >
          <CalendarIcon className="h-4 w-4 text-green-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="rounded-none border border-green-500/30 bg-black/95 p-0 font-mono">
        <Calendar
          mode="single"
          selected={date as Date}
          onSelect={(e) => {
            onSelect(e as Date);
            setOpen(false);
          }}
          initialFocus
          disabled={(date) => isBefore(date, new Date())}
          classNames={{
            months: "space-y-4 font-mono",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center gap-1",
            caption_label: "text-sm font-medium text-green-500",
            nav: "flex items-center gap-1",
            nav_button:
              "h-7 w-7 bg-black hover:bg-green-500/20 text-green-500 flex items-center justify-center border border-green-500/30 rounded-none transition-colors",
            table: "w-full border-collapse",
            head_row: "flex",
            head_cell:
              "text-green-500/50 w-9 font-normal text-[0.8rem] uppercase tracking-wider",
            row: "flex w-full mt-2",
            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-green-500/10",
            day: "h-9 w-9 p-0 font-normal rounded-none transition-colors text-green-500 hover:bg-green-500/30 hover:text-green-400 focus:bg-green-500/50 focus:text-green-400 aria-selected:opacity-100",
            day_range_end: "day-range-end",
            day_selected:
              "[&:not([disabled])]:bg-green-500 [&:not([disabled])]:text-black hover:bg-green-600 hover:!text-black focus:bg-green-600 focus:!text-black",
            day_today: "bg-green-500/20 text-green-400 font-bold",
            day_outside: "text-green-500/50 opacity-50",
            day_disabled:
              "text-green-500/50 opacity-50 hover:bg-transparent cursor-not-allowed",
            day_range_middle: "aria-selected:bg-green-500/20",
            day_hidden: "invisible",
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

export default CyberCountdown;
