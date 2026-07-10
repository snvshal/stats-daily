import mongoose from "mongoose";
import { Area } from "@/models/task.model";
import { Note } from "@/models/note.model";
import { Achievement } from "@/models/acmt.model";
import type { TAchievementTask } from "@/lib/types";
import connectToDatabase from "@/lib/db/mongodb";
import type { TaskOutput, AreaOutput, NoteOutput, AchievementOutput, MutationResult, AreaListItemOutput } from "@/mcp/schemas";

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

function toTaskOutput(t: Record<string, unknown>): TaskOutput {
  return {
    id: (t._id as { toString(): string }).toString(),
    task: t.task as string,
    achieved: t.achieved as number,
    completed: t.completed as boolean,
  };
}

function toAreaOutput(d: Record<string, unknown>): AreaOutput {
  return {
    id: (d._id as { toString(): string }).toString(),
    area: d.area as string,
    note: d.note as string | undefined,
    tasks: ((d.tasks ?? []) as Record<string, unknown>[]).map(toTaskOutput),
  };
}

function toNoteOutput(n: Record<string, unknown>): NoteOutput {
  return {
    id: (n._id as { toString(): string }).toString(),
    content: n.content as string,
  };
}

function toAchievementOutput(a: Record<string, unknown>): AchievementOutput {
  return {
    id: (a._id as { toString(): string }).toString(),
    achievements: ((a.achievements ?? []) as Record<string, unknown>[]).map(
      (ai) => ({
        id: (ai._id as { toString(): string }).toString(),
        text: ai.text as string,
      }),
    ),
    note: a.note as string | undefined,
  };
}

type ToolResult<T> = {
  content: { type: "text"; text: string }[];
  structuredContent?: T;
  isError?: boolean;
};

export function createHandlers(userId: string, scopes: string[] | null) {
  async function listAreas(): Promise<ToolResult<AreaListItemOutput[]>> {
    await connectToDatabase();
    const docs = await Area.find({ userId })
      .select("area")
      .lean() as Record<string, unknown>[];
    const output: AreaListItemOutput[] = docs.map((d) => ({
      id: (d._id as { toString(): string }).toString(),
      area: d.area as string,
    }));
    return {
      content: [{ type: "text" as const, text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }

  async function getArea(areaId: string): Promise<ToolResult<AreaOutput>> {
    await connectToDatabase();
    const doc = await Area.findOne({ _id: areaId, userId })
      .lean() as Record<string, unknown> | null;
    if (!doc)
      return {
        content: [{ type: "text" as const, text: "Area not found" }],
        isError: true,
      };
    const output = toAreaOutput(doc);
    return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output };
  }

  async function createArea(area: string, note?: string): Promise<ToolResult<MutationResult>> {
    await connectToDatabase();
    const doc = await Area.create({ userId, area, note });
    const output: MutationResult = { success: true, message: "Area created", id: doc._id.toString() };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }

  async function updateAreaName(areaId: string, name: string): Promise<ToolResult<MutationResult>> {
    await connectToDatabase();
    const doc = await Area.findOneAndUpdate(
      { _id: areaId, userId },
      { area: name },
      { new: true },
    ).select("_id");
    if (!doc) {
      const output: MutationResult = { success: false, message: "Area not found" };
      return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output, isError: true };
    }
    const output: MutationResult = { success: true, message: "Area name updated", id: doc._id.toString() };
    return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output };
  }

  async function updateAreaNote(areaId: string, note: string): Promise<ToolResult<MutationResult>> {
    await connectToDatabase();
    const doc = await Area.findOneAndUpdate(
      { _id: areaId, userId },
      { note },
      { new: true },
    ).select("_id");
    if (!doc) {
      const output: MutationResult = { success: false, message: "Area not found" };
      return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output, isError: true };
    }
    const output: MutationResult = { success: true, message: "Area note updated", id: doc._id.toString() };
    return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output };
  }

  async function updateTask(
    areaId: string,
    taskId: string,
    data: { task?: string; achieved?: number; completed?: boolean },
  ): Promise<ToolResult<MutationResult>> {
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
    ).select("_id");
    if (!doc) {
      const output: MutationResult = { success: false, message: "Task not found" };
      return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output, isError: true };
    }
    const output: MutationResult = { success: true, message: "Task updated", id: taskId };
    return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output };
  }

  async function addTask(areaId: string, task: string): Promise<ToolResult<MutationResult>> {
    await connectToDatabase();
    const doc = await Area.findOneAndUpdate(
      { _id: areaId, userId },
      { $push: { tasks: { task, achieved: 0, completed: false } } },
      { new: true },
    ).select("tasks");
    if (!doc) {
      const output: MutationResult = { success: false, message: "Area not found" };
      return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output, isError: true };
    }
    const tasks = (doc.tasks ?? []) as { _id: { toString(): string } }[];
    const taskId = tasks[tasks.length - 1]._id.toString();
    const output: MutationResult = { success: true, message: "Task added", id: taskId };
    return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output };
  }

  async function getNote(date?: string): Promise<ToolResult<NoteOutput[]>> {
    await connectToDatabase();
    const query: Record<string, unknown> = { userId };
    if (date) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      const end = new Date(d.getTime() + 86400000);
      query.createdAt = { $gte: d, $lte: end };
    }
    const docs = await Note.find(query).sort({ createdAt: -1 })
      .lean() as Record<string, unknown>[];
    const output = docs.map(toNoteOutput);
    return {
      content: [{ type: "text" as const, text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }

  async function saveNote(content: string): Promise<ToolResult<MutationResult>> {
    await connectToDatabase();
    const now = new Date();
    const start = new Date(now);
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 86400000);

    let doc = await Note.findOne({
      userId,
      createdAt: { $gte: start, $lte: end },
    });

    if (doc) {
      doc.content = content;
      await doc.save();
    } else {
      doc = await Note.create({ userId, content });
    }

    const output: MutationResult = { success: true, message: "Note saved", id: doc._id.toString() };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }

  async function updateNote(id: string, content: string): Promise<ToolResult<MutationResult>> {
    await connectToDatabase();
    const doc = await Note.findOne({ _id: id, userId });
    if (!doc) {
      const output: MutationResult = { success: false, message: "Note not found" };
      return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output, isError: true };
    }
    doc.content = doc.content + "\n\n" + content;
    await doc.save();
    const output: MutationResult = { success: true, message: "Note updated", id: doc._id.toString() };
    return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output };
  }

  async function getAchievements(date?: string): Promise<ToolResult<AchievementOutput[]>> {
    await connectToDatabase();
    const query: Record<string, unknown> = { userId };
    if (date) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      const end = new Date(d.getTime() + 86400000);
      query.createdAt = { $gte: d, $lte: end };
    }
    const docs = await Achievement.find(query).sort({ createdAt: -1 })
      .lean() as Record<string, unknown>[];
    const output = docs.map(toAchievementOutput);
    return { content: [{ type: "text" as const, text: JSON.stringify(output) }], structuredContent: output };
  }

  async function saveAchievement(text: string, note?: string): Promise<ToolResult<MutationResult>> {
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
      if (note) doc.note = doc.note ? doc.note + "\n\n" + note : note;
      await doc.save();
    }

    const output: MutationResult = { success: true, message: "Achievement saved", id: doc._id.toString() };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(output) }],
      structuredContent: output,
    };
  }

  return {
    listAreas: scoped(listAreas, scopes, SCOPE_AREAS_READ),
    getArea: scoped(getArea, scopes, SCOPE_AREAS_READ),
    createArea: scoped(createArea, scopes, SCOPE_AREAS_WRITE),
    updateAreaName: scoped(updateAreaName, scopes, SCOPE_AREAS_WRITE),
    updateAreaNote: scoped(updateAreaNote, scopes, SCOPE_AREAS_WRITE),
    updateTask: scoped(updateTask, scopes, SCOPE_AREAS_WRITE),
    addTask: scoped(addTask, scopes, SCOPE_AREAS_WRITE),
    getNote: scoped(getNote, scopes, SCOPE_NOTES_READ),
    saveNote: scoped(saveNote, scopes, SCOPE_NOTES_WRITE),
    updateNote: scoped(updateNote, scopes, SCOPE_NOTES_WRITE),
    getAchievements: scoped(getAchievements, scopes, SCOPE_ACHIEVEMENTS_READ),
    saveAchievement: scoped(saveAchievement, scopes, SCOPE_ACHIEVEMENTS_WRITE),
  };
}
