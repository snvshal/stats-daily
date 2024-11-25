"use client";

import { HeaderProps, TStats, MainContentProps } from "@/lib/types";
import { useEffect, useState } from "react";
import { PageFooter, SDIconWithTitle } from "@/components/home-page";
import { InfoIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { RadarChartComponent } from "./radar-chart";

export function StatsComponent({ data }: { data: TStats[] }) {
  const [selectedValue, setSelectedValue] = useState<string>("1");
  const [stats, setStats] = useState<TStats[]>(data);

  useEffect(() => {
    const count = parseInt(selectedValue, 10);
    setStats(data.slice(0, count));
  }, [selectedValue, data]);

  if (!stats.length) {
    return (
      <>
        <ChartHeader
          statsLength={false}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
        />
        <NoStatsFound />
        <PageFooter />
      </>
    );
  }

  return (
    <>
      <ChartHeader
        statsLength={true}
        selectedValue={selectedValue}
        setSelectedValue={setSelectedValue}
      />
      <ChartMainContent stats={stats} selectedValue={selectedValue} />
      <PageFooter />
    </>
  );
}

// Chart Collection Component Header
export function ChartHeader({
  statsLength,
  selectedValue,
  setSelectedValue,
}: HeaderProps) {
  return (
    <header className="flex-between sticky top-0 z-40 h-16 border-b bg-background px-4 lg:px-6">
      <SDIconWithTitle />
      <Select
        value={selectedValue}
        onValueChange={setSelectedValue}
        name="select-timeline"
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Select Timeline" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Timelines</SelectLabel>
            <SelectItem value="60">Last 2 months</SelectItem>
            <SelectItem value="30">Last month</SelectItem>
            <SelectItem value="21">Last 21 days</SelectItem>
            <SelectItem value="15">Last 15 days</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="3">Last 3 days</SelectItem>
            <SelectItem value="1">Yesterday</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </header>
  );
}

// Chart Collection Component Main Content
export function ChartMainContent({ stats, selectedValue }: MainContentProps) {
  return (
    <main className="p-8">
      <RadarChartComponent stats={stats} days={selectedValue} />
    </main>
  );
}

export function NoStatsFound() {
  return (
    <div className="flex-center h-[calc(100dvh-8rem)] flex-col">
      <div className="flex items-center space-x-2">
        <InfoIcon size={24} aria-hidden="true" />
        <h1 className="text-xl font-semibold">No Stats Found!</h1>
      </div>
      <p className="mt-2 text-muted-foreground">
        Please wait at least a day to get started!
      </p>
    </div>
  );
}
