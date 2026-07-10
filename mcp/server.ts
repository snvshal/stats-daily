import { z } from "zod-v4/v4";
import { McpServer } from "@modelcontextprotocol/server";
import { createHandlers } from "./handlers";
import type { McpRequestContext } from "@modelcontextprotocol/server";
import { areaSchema, areaListItemSchema, noteSchema, achievementSchema, mutationResultSchema } from "./schemas";

function getUserId(ctx: McpRequestContext): string | null {
  return (
    ((ctx.authInfo?.extra as Record<string, unknown> | undefined)?.userId as
      string | null) ?? null
  );
}

function getScopes(ctx: McpRequestContext): string[] | null {
  return ctx.authInfo?.scopes ?? null;
}

export function createFactory() {
  return (ctx: McpRequestContext): McpServer => {
    const userId = getUserId(ctx);
    const scopes = getScopes(ctx);
    const h = createHandlers(userId ?? "", scopes);

    const server = new McpServer(
      { name: "stats-daily", version: "1.0.0" },
      { capabilities: { tools: {} } },
    );

    server.registerTool(
      "list_areas",
      {
        description: "List all areas/topics for the user",
        outputSchema: z.array(areaListItemSchema),
      },
      async () => h.listAreas(),
    );

    server.registerTool(
      "get_area",
      {
        description: "Get a specific area by ID",
        inputSchema: z.object({ areaId: z.string() }),
        outputSchema: areaSchema,
      },
      async (args) => h.getArea(args.areaId),
    );

    server.registerTool(
      "create_area",
      {
        description: "Create a new area/topic",
        inputSchema: z.object({ area: z.string(), note: z.string().optional() }),
        outputSchema: mutationResultSchema,
      },
      async (args) => h.createArea(args.area, args.note),
    );

    server.registerTool(
      "update_area_name",
      {
        description: "Rename an area",
        inputSchema: z.object({ areaId: z.string(), name: z.string() }),
        outputSchema: mutationResultSchema,
      },
      async (args) => h.updateAreaName(args.areaId, args.name),
    );

    server.registerTool(
      "update_area_note",
      {
        description: "Update the note for an area",
        inputSchema: z.object({ areaId: z.string(), note: z.string() }),
        outputSchema: mutationResultSchema,
      },
      async (args) => h.updateAreaNote(args.areaId, args.note),
    );

    server.registerTool(
      "update_task",
      {
        description: "Update a task within an area",
        inputSchema: z.object({
          areaId: z.string(),
          taskId: z.string(),
          task: z.string().optional(),
          achieved: z.number().optional(),
          completed: z.boolean().optional(),
        }),
        outputSchema: mutationResultSchema,
      },
      async (args) =>
        h.updateTask(args.areaId, args.taskId, {
          task: args.task,
          achieved: args.achieved,
          completed: args.completed,
        }),
    );

    server.registerTool(
      "add_task",
      {
        description: "Add a new task to an area",
        inputSchema: z.object({ areaId: z.string(), task: z.string() }),
        outputSchema: mutationResultSchema,
      },
      async (args) => h.addTask(args.areaId, args.task),
    );

    server.registerTool(
      "get_note",
      {
        description: "Get daily notes, optionally filtered by date",
        inputSchema: z.object({ date: z.string().optional() }),
        outputSchema: z.array(noteSchema),
      },
      async (args) => h.getNote(args.date),
    );

    server.registerTool(
      "save_note",
      {
        description: "Save a daily note (supports HTML content) — replaces any existing note for today",
        inputSchema: z.object({ content: z.string() }),
        outputSchema: mutationResultSchema,
      },
      async (args) => h.saveNote(args.content),
    );

    server.registerTool(
      "update_note",
      {
        description: "Append content to an existing note by ID (supports HTML content)",
        inputSchema: z.object({ id: z.string(), content: z.string() }),
        outputSchema: mutationResultSchema,
      },
      async (args) => h.updateNote(args.id, args.content),
    );

    server.registerTool(
      "get_achievements",
      {
        description: "Get achievements, optionally filtered by date",
        inputSchema: z.object({ date: z.string().optional() }),
        outputSchema: z.array(achievementSchema),
      },
      async (args) => h.getAchievements(args.date),
    );

    server.registerTool(
      "save_achievement",
      {
        description: "Save a new achievement for today",
        inputSchema: z.object({ text: z.string(), note: z.string().optional() }),
        outputSchema: mutationResultSchema,
      },
      async (args) => h.saveAchievement(args.text, args.note),
    );

    return server;
  };
}
