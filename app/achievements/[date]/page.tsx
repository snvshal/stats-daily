import { TAchievement } from "@/lib/types";
import { getAchievement, getYearlyAchievementCount } from "@/app/actions";
import { ps } from "@/lib/utils";
import {
  AchievementComponent,
  AchievementPageComponent,
  UnavailableAchievementPage,
} from "@/components/acmt";
import { format, isAfter, parseISO, startOfDay } from "date-fns";
import { notFound } from "next/navigation";

export default async function Achievements({
  params,
}: {
  params: { date: string };
}) {
  let { date } = params;

  if (["today", "graph"].includes(date)) {
    date = format(new Date(), "yyyy-MM-dd");
  }

  const parsedDate = parseISO(date);
  if (isNaN(parsedDate.getTime())) notFound();

  const queryDate = startOfDay(parsedDate);

  if (isAfter(queryDate, startOfDay(new Date()))) {
    return <UnavailableAchievementPage />;
  }

  const achievement = await getAchievement(date);

  if (!achievement) return <UnavailableAchievementPage />;

  return (
    <AchievementPageComponent achievement={ps(achievement as TAchievement)} />
  );
}
