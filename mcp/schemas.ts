import { z } from "zod-v4/v4";

export const taskSchema = z.object({
  id: z.string(),
  task: z.string(),
  achieved: z.number(),
  completed: z.boolean(),
});

export type TaskOutput = z.infer<typeof taskSchema>;

export const areaSchema = z.object({
  id: z.string(),
  area: z.string(),
  note: z.string().optional(),
  tasks: z.array(taskSchema),
});

export type AreaOutput = z.infer<typeof areaSchema>;

export const areaListItemSchema = z.object({
  id: z.string(),
  area: z.string(),
});

export type AreaListItemOutput = z.infer<typeof areaListItemSchema>;

export const noteSchema = z.object({
  id: z.string(),
  content: z.string(),
});

export type NoteOutput = z.infer<typeof noteSchema>;

export const achievementItemSchema = z.object({
  id: z.string(),
  text: z.string(),
});

export const achievementSchema = z.object({
  id: z.string(),
  achievements: z.array(achievementItemSchema),
  note: z.string().optional(),
});

export type AchievementOutput = z.infer<typeof achievementSchema>;

export const mutationResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  id: z.string().optional(),
});

export type MutationResult = z.infer<typeof mutationResultSchema>;
