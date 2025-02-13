import { TAchievement } from "@/lib/types";
import { getAchievement, getYearlyAchievementCount } from "@/app/actions";

import { ps } from "@/lib/utils";
import { AchievementComponent } from "@/components/acmt";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Keep track of your daily achievements and tasks in a minimalistic way.",
};

export default async function Achievements() {
  const achievement = await getAchievement();
  const achievementCount = await getYearlyAchievementCount();

  return (
    <AchievementComponent
      achievement={ps(achievement as TAchievement)}
      achievementCount={ps(achievementCount)}
    />
  );
}
