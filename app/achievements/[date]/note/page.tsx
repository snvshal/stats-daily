import { getAchievement } from "@/app/actions";
import { AchievementNote, UnavailableAchievementPage } from "@/components/acmt";
import { ps } from "@/lib/utils";
import { format, isAfter, startOfDay } from "date-fns";
import { notFound } from "next/navigation";

export default async function AchievementNotePage({
  params,
}: {
  params: { date: string };
}) {
  let { date } = params;

  if (["today"].includes(date)) {
    date = format(new Date(), "yyyy-MM-dd");
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) notFound();

  const queryDate = startOfDay(parsedDate);

  if (isAfter(queryDate, startOfDay(new Date()))) {
    return <UnavailableAchievementPage queryDate={queryDate} />;
  }

  const achievement = await getAchievement(date);

  if (!achievement) return <UnavailableAchievementPage queryDate={queryDate} />;

  return (
    <div className="h-[calc(100dvh-6rem)] w-full">
      <AchievementNote achievement={ps(achievement)} />
    </div>
  );
}
