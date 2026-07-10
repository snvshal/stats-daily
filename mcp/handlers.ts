import mongoose from "mongoose";
import { Area } from "@/models/task.model";
import { Note } from "@/models/note.model";
import { Achievement } from "@/models/acmt.model";
import type { TAchievementTask } from "@/lib/types";
import connectToDatabase from "@/lib/db/mongodb";

const SCOPE_AREAS_READ = "mcp:areas:read";
const SCOPE_AREAS_WRITE = "mcp:areas:write";
const SCOPE_NOTES_READ = "mcp:notes:read";
const SCOPE_NOTES_WRITE = "mcp:notes:write";
const SCOPE_ACHIEVEMENTS_READ = "mcp:achievements:read";
const SCOPE_ACHIEVEMENTS_WRITE = "mcp:achievements:write";

const SCOPE_DENIED = {
  content: [{ type: "text" as const, text: "Insufficient scope" }],
  isError: true,
};

function check(scopes: string[] | null, required: string): boolean {
  return scopes === null || scopes.includes(required);
}

function scoped<
  T extends (
    ...args: never[]
  ) => Promise<{ content: unknown[]; isError?: boolean }>,
>(fn: T, scopes: string[] | null, required: string): T {
  return (async (...args: Parameters<T>) => {
    if (!check(scopes, required)) return SCOPE_DENIED;
    return fn(...args);
  }) as T;
}

export function createHandlers(userId: string, scopes: string[] | null) {
  async function listAreas() {
    await connectToDatabase();
    const areas = await Area.find({ userId })
      .select("area note tasks updatedAt")
      .lean();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(areas) }],
    };
  }

  async function getArea(areaId: string) {
    await connectToDatabase();
    const area = await Area.findOne({ _id: areaId, userId }).lean();
    if (!area)
      return {
        content: [{ type: "text" as const, text: "Area not found" }],
        isError: true,
      };
    return { content: [{ type: "text" as const, text: JSON.stringify(area) }] };
  }

  async function createArea(area: string, note?: string) {
    await connectToDatabase();
    const doc = await Area.create({ userId, area, note });
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(doc.toObject()) },
      ],
    };
  }

  async function updateAreaName(areaId: string, name: string) {
    await connectToDatabase();
    const doc = await Area.findOneAndUpdate(
      { _id: areaId, userId },
      { area: name },
      { new: true },
    ).lean();
    if (!doc)
      return {
        content: [{ type: "text" as const, text: "Area not found" }],
        isError: true,
      };
    return { content: [{ type: "text" as const, text: JSON.stringify(doc) }] };
  }

  async function updateAreaNote(areaId: string, note: string) {
    await connectToDatabase();
    const doc = await Area.findOneAndUpdate(
      { _id: areaId, userId },
      { note },
      { new: true },
    ).lean();
    if (!doc)
      return {
        content: [{ type: "text" as const, text: "Area not found" }],
        isError: true,
      };
    return { content: [{ type: "text" as const, text: JSON.stringify(doc) }] };
  }

  async function updateTask(
    areaId: string,
    taskId: string,
    data: { task?: string; achieved?: number; completed?: boolean },
  ) {
    await connectToDatabase();
    const update: Record<string, unknown> = {};
    if (data.task !== undefined) update["tasks.$[elem].task"] = data.task;
    if (data.achieved !== undefined)
      update["tasks.$[elem].achieved"] = data.achieved;
    if (data.completed !== undefined)
      update["tasks.$[elem].completed"] = data.completed;
    update["tasks.$[elem].updatedAt"] = new Date();

    const doc = await Area.findOneAndUpdate(
      { _id: areaId, userId },
      { $set: update },
      {
        new: true,
        arrayFilters: [{ "elem._id": new mongoose.Types.ObjectId(taskId) }],
      },
    ).lean();
    if (!doc)
      return {
        content: [{ type: "text" as const, text: "Task not found" }],
        isError: true,
      };
    return { content: [{ type: "text" as const, text: JSON.stringify(doc) }] };
  }

  async function addTask(areaId: string, task: string) {
    await connectToDatabase();
    const doc = await Area.findOneAndUpdate(
      { _id: areaId, userId },
      { $push: { tasks: { task, achieved: 0, completed: false } } },
      { new: true },
    ).lean();
    if (!doc)
      return {
        content: [{ type: "text" as const, text: "Area not found" }],
        isError: true,
      };
    return { content: [{ type: "text" as const, text: JSON.stringify(doc) }] };
  }

  async function deleteTask(areaId: string, taskId: string) {
    await connectToDatabase();
    const doc = await Area.findOneAndUpdate(
      { _id: areaId, userId },
      { $pull: { tasks: { _id: new mongoose.Types.ObjectId(taskId) } } },
      { new: true },
    ).lean();
    if (!doc)
      return {
        content: [{ type: "text" as const, text: "Area or task not found" }],
        isError: true,
      };
    return { content: [{ type: "text" as const, text: JSON.stringify(doc) }] };
  }

  async function deleteArea(areaId: string) {
    await connectToDatabase();
    const doc = await Area.findOneAndDelete({ _id: areaId, userId }).lean();
    if (!doc)
      return {
        content: [{ type: "text" as const, text: "Area not found" }],
        isError: true,
      };
    return { content: [{ type: "text" as const, text: JSON.stringify(doc) }] };
  }

  async function getNote(date?: string) {
    await connectToDatabase();
    const query: Record<string, unknown> = { userId };
    if (date) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      const end = new Date(d.getTime() + 86400000);
      query.createdAt = { $gte: d, $lte: end };
    }
    const notes = await Note.find(query).sort({ createdAt: -1 }).lean();
    return {
      content: [{ type: "text" as const, text: JSON.stringify(notes) }],
    };
  }

  async function saveNote(content: string) {
    await connectToDatabase();
    const doc = await Note.create({ userId, content });
    return {
      content: [
        { type: "text" as const, text: JSON.stringify(doc.toObject()) },
      ],
    };
  }

  async function getAchievements(date?: string) {
    await connectToDatabase();
    const query: Record<string, unknown> = { userId };
    if (date) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      const end = new Date(d.getTime() + 86400000);
      query.createdAt = { $gte: d, $lte: end };
    }
    const data = await Achievement.find(query).sort({ createdAt: -1 }).lean();
    return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
  }

  async function saveAchievement(text: string, note?: string) {
    await connectToDatabase();
    const now = new Date();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 86400000);

    let doc = await Achievement.findOne({
      userId,
      createdAt: { $gte: start, $lte: end },
    });

    if (!doc) {
      doc = await Achievement.create({
        userId,
        achievements: [{ text }],
        note,
      });
    } else {
      doc.achievements.push({ text } as TAchievementTask);
      if (note) doc.note = note;
      await doc.save();
    }

    return { content: [{ type: "text" as const, text: "Achievement saved" }] };
  }

  return {
    listAreas: scoped(listAreas, scopes, SCOPE_AREAS_READ),
    getArea: scoped(getArea, scopes, SCOPE_AREAS_READ),
    createArea: scoped(createArea, scopes, SCOPE_AREAS_WRITE),
    updateAreaName: scoped(updateAreaName, scopes, SCOPE_AREAS_WRITE),
    updateAreaNote: scoped(updateAreaNote, scopes, SCOPE_AREAS_WRITE),
    updateTask: scoped(updateTask, scopes, SCOPE_AREAS_WRITE),
    addTask: scoped(addTask, scopes, SCOPE_AREAS_WRITE),
    deleteTask: scoped(deleteTask, scopes, SCOPE_AREAS_WRITE),
    deleteArea: scoped(deleteArea, scopes, SCOPE_AREAS_WRITE),
    getNote: scoped(getNote, scopes, SCOPE_NOTES_READ),
    saveNote: scoped(saveNote, scopes, SCOPE_NOTES_WRITE),
    getAchievements: scoped(getAchievements, scopes, SCOPE_ACHIEVEMENTS_READ),
    saveAchievement: scoped(saveAchievement, scopes, SCOPE_ACHIEVEMENTS_WRITE),
  };
}
