import { Area } from "@/models/task.model";
import connectToDatabase from "./db/mongodb";
import { Stats } from "@/models/stats.model";
import { TArea, TStats, TaskStats } from "./types";
import { currentUser } from "./db/stats";

export const statsToday = async (
  areaId: string,
  achieved: number,
): Promise<{ success: boolean }> => {
  try {
    await connectToDatabase();

    const { _id: userId } = await currentUser();
    const area: TArea | null = await Area.findById(areaId);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Stats.findOne({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const taskStats = {
      area: area?.area,
      total: area?.tasks.length,
      achieved,
      completed: area?.tasks.filter((t) => t.completed).length,
    } as TaskStats;

    // inside your existing statsToday function, replace the "existing" branch with this:

    if (existing) {
      const stats: TStats | null = await Stats.findById(existing._id);
      if (!stats) return { success: false };

      const newTaskStat: TaskStats = {
        area: area?.area ?? "Unknown",
        total: area?.tasks.length ?? 0,
        completed: area?.tasks.filter((t) => t.completed).length ?? 0,
        achieved, // you can also compute achieved here if you prefer
      };

      // find existing area entry index
      const idx = stats.taskStats.findIndex(
        (ts) => ts.area === newTaskStat.area,
      );

      if (idx >= 0) {
        // replace the old entry with the latest snapshot
        stats.taskStats[idx] = { ...stats.taskStats[idx], ...newTaskStat };
      } else {
        stats.taskStats.push(newTaskStat);
      }

      await stats.save();
      return { success: true };
    }

    await Stats.create({ userId, taskStats });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
};

export const statsdaily = async (count: number): Promise<TStats[]> => {
  try {
    await connectToDatabase();
    // await Stats.deleteMany();
    const { _id: userId } = await currentUser();
    const stats = await Stats.find({ userId })
      .sort({ createdAt: -1 })
      .limit(count);
    const taskStats = await taskStatsArray(stats);
    console.log("1: ", stats[0].taskStats, "2: ", taskStats[0].taskStats);
    return taskStats;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const taskStatsArray = async (stats: TStats[]): Promise<TStats[]> => {
  if (!stats || stats.length === 0) return [];
  const plainStats = stats.map((s) => s.toObject());

  const result = plainStats.map((s) => {
    // Map<area, TaskStats>
    const map = new Map<string, TaskStats>();

    // iterate in order (older → newer). We'll keep the latest snapshot for each area
    for (const ts of s.taskStats ?? []) {
      const areaKey = ts.area ?? "Unknown";

      const existing = map.get(areaKey);
      if (!existing) {
        map.set(areaKey, { ...ts }); // first occurrence
      } else {
        // update to the "latest" / best snapshot:
        // - prefer the entry with higher completed (progress),
        // - prefer higher total (in case tasks were added),
        // - we then recompute achieved below.
        const maxTotal = Math.max(existing.total ?? 0, ts.total ?? 0);
        const maxCompleted = Math.max(
          existing.completed ?? 0,
          ts.completed ?? 0,
        );

        map.set(areaKey, {
          area: areaKey,
          note: ts.note ?? existing.note,
          total: maxTotal,
          completed: maxCompleted,
          achieved:
            maxTotal > 0 ? Math.round((maxCompleted / maxTotal) * 100) : 0,
        });
      }
    }

    // if some entries were only set once, make sure achieved is consistent
    const grouped = Array.from(map.values()).map((v) => ({
      ...v,
      achieved: v.total > 0 ? Math.round((v.completed / v.total) * 100) : 0,
    }));

    return {
      _id: s._id,
      userId: s.userId,
      taskStats: grouped,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    } as TStats;
  });

  return result;
};
