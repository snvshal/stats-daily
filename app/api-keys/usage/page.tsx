"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { LoaderIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { TitleHeader } from "@/components/daily-note";

type ApiUsage = {
  id: string;
  resource: string;
  date: string;
  count: number;
};

export default function ApiKeyUsagePage() {
  const [data, setData] = useState<ApiUsage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/api-usage");
      if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    })();
  }, []);

  /* -------- Aggregations -------- */

  const dailyUsage = useMemo(() => {
    const map = new Map<string, number>();

    data.forEach((d) => {
      const day = format(new Date(d.date), "yyyy-MM-dd");
      map.set(day, (map.get(day) ?? 0) + d.count);
    });

    return Array.from(map.entries())
      .map(([date, count]) => ({
        date,
        displayDate: format(new Date(date), "MMM dd"),
        count,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const resourceUsage = useMemo(() => {
    const map = new Map<string, number>();

    data.forEach((d) => {
      map.set(d.resource, (map.get(d.resource) ?? 0) + d.count);
    });

    return Array.from(map.entries())
      .map(([resource, count]) => ({
        resource:
          resource
            .split(".")
            .slice(-2)
            .map((rp) => rp.charAt(0).toUpperCase() + rp.slice(1))
            .join(" ") || resource,
        fullResource: resource,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  const totalRequests = useMemo(() => {
    return data.reduce((sum, d) => sum + d.count, 0);
  }, [data]);

  const averageDaily = useMemo(() => {
    if (dailyUsage.length === 0) return 0;
    return Math.round(totalRequests / dailyUsage.length);
  }, [totalRequests, dailyUsage.length]);

  // Chart configurations
  const dailyChartConfig = {
    count: {
      label: "Requests",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  const resourceChartConfig = {
    count: {
      label: "Requests",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  if (loading) {
    return (
      <TitleHeader page="API Usage">
        <div className="flex-center h-[calc(100dvh-4rem)]">
          <LoaderIcon className="animate-spin" />
        </div>
      </TitleHeader>
    );
  }

  return (
    <TitleHeader page="API Usage">
      <div className="space-y-4 p-4 md:p-6">
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your API usage and performance metrics
        </p>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRequests.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                All time requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Average Daily
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {averageDaily.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Requests per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resourceUsage.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">
                Unique resources used
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Daily usage chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Requests</CardTitle>
            <CardDescription>API requests over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={dailyChartConfig} className="h-[300px]">
              <AreaChart
                data={dailyUsage}
                margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="count"
                  type="monotone"
                  fill="var(--color-count)"
                  fillOpacity={0.4}
                  stroke="var(--color-count)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Resource usage chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Resources</CardTitle>
            <CardDescription>
              Most frequently used API resources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={resourceChartConfig} className="h-[300px]">
              <BarChart
                data={resourceUsage}
                margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                layout="vertical"
              >
                <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <YAxis
                  type="category"
                  dataKey="resource"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={100}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </TitleHeader>
  );
}
