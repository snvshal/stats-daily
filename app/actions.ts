"use server";

import connectToDatabase from "@/lib/db/mongodb";
import { currentUser } from "@/lib/db/stats";
import { TAchievement, TUser } from "@/lib/types";
import { Achievement } from "@/models/acmt.model";
import {
  addDays,
  differenceInDays,
  endOfYear,
  parseISO,
  startOfDay,
  startOfYear,
} from "date-fns";
import { Types } from "mongoose";
import { revalidatePath } from "next/cache";

export const getAchievement = async (date?: string) => {
  try {
    await connectToDatabase();
    const user: TUser = await currentUser();
    const userId = user._id?.toString() as string;

    let queryDate = new Date();

    // If a specific date is provided (not a special keyword), parse and validate it
    if (date && !["today", "graph", "note"].includes(date)) {
      const parsedDate = parseISO(date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format. Please use yyyy-mm-dd");
      }
      queryDate = parsedDate;
    }

    // Normalize to start of the day for consistency
    queryDate = startOfDay(queryDate);

    // Find achievement for the specified date
    let achievement: TAchievement | null = await Achievement.findOne({
      userId,
      createdAt: {
        $gte: queryDate,
        $lt: addDays(queryDate, 1), // Next day boundary
      },
    });

    // If no achievement found, create one (only for today or special cases)
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    if (
      !achievement &&
      (!date ||
        ["today", "graph", "note"].includes(date) ||
        queryDate.toISOString().split("T")[0] === todayStr)
    ) {
      achievement = await Achievement.create({
        userId,
        achievements: [],
        createdAt: queryDate,
      });
    }

    return achievement;
  } catch (error) {
    console.error("Achievement error:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to fetch or create achievement",
    );
  }
};

export const saveAchievement = async (id: string, text: string) => {
  try {
    await connectToDatabase();
    const user: TUser = await currentUser();
    const userId = user._id?.toString() as string;

    let achievement: TAchievement | undefined | null =
      await Achievement.findById(id);

    if (!achievement) {
      achievement = await Achievement.create({
        userId,
        achievements: [{ text }],
      });
    } else {
      achievement.achievements.push({ text });
      await achievement.save();
    }

    revalidatePath("/achievements");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const deleteAchievement = async (id: string, taskId: string) => {
  try {
    await connectToDatabase();

    const result = await Achievement.updateOne(
      { _id: new Types.ObjectId(id) },
      { $pull: { achievements: { _id: new Types.ObjectId(taskId) } } },
    );

    if (result.modifiedCount === 0) {
      return { success: false };
    }

    revalidatePath("/achievements");

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const updateAchievementNote = async (id: string, note: string) => {
  try {
    await connectToDatabase();
    const user: TUser = await currentUser();
    const userId = user._id?.toString() as string;

    let achievement: TAchievement | undefined | null =
      await Achievement.findById(id);

    if (!achievement) {
      achievement = await Achievement.create({
        userId,
        note,
      });
    } else {
      achievement.note = note;
      await achievement.save();
    }

    revalidatePath("/achievements");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const getYearlyAchievementCount = async (): Promise<number[]> => {
  try {
    await connectToDatabase();
    const user: TUser = await currentUser();
    const userId = user._id?.toString() as string;

    const startDate = startOfYear(new Date()); // Jan 1st of the current year
    const endDate = endOfYear(new Date()); // Dec 31st of the current year
    const totalDays = differenceInDays(endDate, startDate) + 1;

    // Initialize array with zeros for all days of the year
    const dailyCounts = new Array(totalDays).fill(0);

    const achievementsByDay = await Achievement.aggregate([
      {
        $match: {
          userId,
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: { $size: "$achievements" } }, // Count total achievements per day
        },
      },
    ]);

    // Fill the array based on aggregated data
    achievementsByDay.forEach((item) => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day);
      const dayIndex = differenceInDays(date, startDate);
      dailyCounts[dayIndex] = item.count;
    });

    return dailyCounts;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch yearly achievement data");
  }
};
