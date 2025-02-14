import { getYearlyAchievementCount } from "@/app/actions";
import { AchievementComponent } from "@/components/acmt";
import { ps } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Keep track of your daily achievements and tasks in a minimalistic way.",
};

export default async function AchievementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const achievementCount = await getYearlyAchievementCount();

  return (
    <AchievementComponent achievementCount={ps(achievementCount)}>
      {children}
    </AchievementComponent>
  );
}
