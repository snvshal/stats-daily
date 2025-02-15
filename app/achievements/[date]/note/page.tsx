import { getAchievement } from "@/app/actions";
import { AchievementNote, UnavailableAchievementPage } from "@/components/acmt";
import { format, isAfter, parseISO, startOfDay } from "date-fns";
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

  const parsedDate = parseISO(date);
  if (isNaN(parsedDate.getTime())) notFound();

  const queryDate = startOfDay(parsedDate);

  if (isAfter(queryDate, startOfDay(new Date()))) {
    return <UnavailableAchievementPage />;
  }
  const achievement = await getAchievement(date);

  if (!achievement) return <UnavailableAchievementPage />;

  return (
    <div className="h-[calc(100dvh-4rem)] w-full p-4">
      <AchievementNote
        id={achievement?._id as string}
        note={achievement?.note as string}
      />
    </div>
  );
}
