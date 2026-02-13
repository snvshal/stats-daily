import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import {
  areaZodSchema,
  areaNameZodSchema,
  noteZodSchema,
  taskZodSchema,
} from "@/lib/route/zod-schema";
import { z } from "zod";
import {
  isValidObjectId,
  checkForDuplicateArea,
  updateArea,
  updateTask,
  updateNote,
  addNewTask,
  findTaskById,
  deleteTaskByTaskId,
  deleteAreaById,
  createNewTask,
} from "@/lib/route/task-utils";
import {
  invalidIdResponse,
  noAreaFoundResponse,
  incompleteDataResponse,
  duplicateAreaResponse,
  newAreaCreatedResponse,
  taskUpdatedResponse,
  noteUpdatedResponse,
  newIncompleteTasksResponse,
  errorResponse,
  areaDeletionResponse,
  invalidStatsResponse,
  areaRenamedResponse,
  zodErrorResponse,
} from "@/lib/route/response";

// POST REQUEST HANDLER
export async function POST(request: NextRequest) {
  await connectToDatabase();

  try {
    const data = await request.json();

    // Validate data using Zod
    areaZodSchema.parse(data);

    // Check for existing area
    const duplicateArea = await checkForDuplicateArea(data.area);
    if (duplicateArea) return duplicateAreaResponse(data.area);

    // Create a new area
    const newArea = await createNewTask(data);
    return newAreaCreatedResponse(newArea);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) return zodErrorResponse(error);
    return invalidStatsResponse();
  }
}

// PATCH REQUEST HANDLER
export async function PATCH(request: NextRequest) {
  await connectToDatabase();

  try {
    const { areaId, taskId, task, note, areaName } = await request.json();

    if (!isValidObjectId(areaId)) return invalidIdResponse();
    if (taskId && !isValidObjectId(taskId)) return invalidIdResponse();

    const item = await findTaskById(areaId);
    if (!item) return noAreaFoundResponse();

    // Update area name by ID
    if (areaName) {
      areaNameZodSchema.parse(areaName);

      const duplicateArea = await checkForDuplicateArea(areaName);
      if (duplicateArea) return duplicateAreaResponse(areaName);

      await updateArea(areaId, areaName);
      return areaRenamedResponse(areaId, areaName);
    }

    // Update task by ID
    if (task && taskId) {
      taskZodSchema.parse(task);
      await updateTask(areaId, taskId, task);
      return taskUpdatedResponse(areaId);
    }

    // Update note by ID
    if (typeof note === "string") {
      noteZodSchema.parse(note);
      await updateNote(areaId, note);
      return noteUpdatedResponse(areaId);
    }

    // Add new task to the area by ID
    if (task && !taskId) {
      taskZodSchema.parse(task);
      const newTasks = await addNewTask(areaId, task);
      return newIncompleteTasksResponse(newTasks);
    }

    return incompleteDataResponse(areaId);
  } catch (error) {
    console.error(error);

    if (error instanceof z.ZodError) return zodErrorResponse(error);
    return errorResponse();
  }
}

// DELETE REQUEST HANDLER
export async function DELETE(request: NextRequest) {
  await connectToDatabase();

  try {
    const { areaId, taskId } = await request.json();

    // Validate ObjectId
    if (!isValidObjectId(areaId)) return invalidIdResponse();
    if (taskId && !isValidObjectId(taskId)) return invalidIdResponse();

    // Find the task by ID
    const item = await findTaskById(areaId);
    if (!item) return noAreaFoundResponse();

    if (taskId) {
      // Delete specific task from the tasks array
      await deleteTaskByTaskId(areaId, taskId);
      return NextResponse.json({ status: 204 });
    }

    // Delete the area
    const area = await deleteAreaById(areaId);
    return areaDeletionResponse(area);
  } catch (error) {
    console.error(error);
    return errorResponse();
  }
}
