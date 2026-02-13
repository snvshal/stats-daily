import mongoose from "mongoose";
import { Area } from "@/models/task.model";
import { TArea, TTask, StatsWithoutDocument, TUser } from "../types";
import { st } from "../utils";
import { currentUser } from "../db/stats";

// Utility function to create a new task
export async function createNewTask(data: StatsWithoutDocument) {
  return await Area.create(data);
}

// Utility function to check if an ID is a valid MongoDB ObjectId
export function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Utility function to check if an area already exists in the database
export async function checkForDuplicateArea(area: string): Promise<boolean> {
  const { _id: userId }: TUser = await currentUser();
  const existingArea = await Area.findOne({
    userId,
    area: { $regex: new RegExp(area, "i") },
  });
  return !!existingArea;
}

// Utility function to update the area field of a Task document
export async function updateArea(id: string, area: string) {
  return await Area.findByIdAndUpdate(id, { $set: { area } }, { new: true });
}

// Utility function to update a specific task within a Task document
export async function updateTask(id: string, taskId: string, task: TTask) {
  return await Area.findByIdAndUpdate(
    id,
    {
      $set: {
        "tasks.$[elem].task": task.task,
        "tasks.$[elem].achieved": task.achieved,
        "tasks.$[elem].completed": task.completed,
        "tasks.$[elem].updatedAt": new Date(),
      },
    },
    {
      new: true,
      arrayFilters: [{ "elem._id": taskId }],
      runValidators: true,
    },
  );
}

// Utility function to update the note field of a Task document
export async function updateNote(id: string, note: string) {
  return await Area.findByIdAndUpdate(id, { $set: { note } }, { new: true });
}

// Utility function to add a new task to the tasks array in a Task document
export async function addNewTask(id: string, task: TTask) {
  const newTasks: TArea | null = await Area.findByIdAndUpdate(
    id,
    { $push: { tasks: task } },
    { new: true },
  );

  return newTasks?.tasks.filter((task) => task.completed === false).sort(st);
}

// Utility function to find a task by ID
export async function findTaskById(id: string) {
  return await Area.findById(id);
}

// Utility function to delete a task by taskId
export async function deleteTaskByTaskId(id: string, taskId: string) {
  return await Area.findByIdAndUpdate(
    id,
    { $pull: { tasks: { _id: taskId } } },
    { new: true },
  );
}

// Utility function to delete an area by ID
export async function deleteAreaById(id: string) {
  return await Area.findByIdAndDelete(id);
}
