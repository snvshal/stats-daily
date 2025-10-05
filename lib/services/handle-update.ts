import { OmitDocument, TTask } from "../types";

export async function updateTask(areaId: string, task: TTask) {
  try {
    const response = await fetch("/api/stats/task", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ areaId, taskId: task._id, task }),
    });

    if (!response.ok) throw new Error("Failed to update task");
  } catch (error) {
    console.error(error);
  }
}

export async function updateStats(areaId: string, achieved: number) {
  try {
    const response = await fetch("/api/daily-stats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ areaId, achieved }),
    });

    if (!response.ok) throw new Error("Failed to update stats");
  } catch (error) {
    console.error(error);
  }
}

export async function updateNote(areaId: string, note: string) {
  try {
    const response = await fetch("/api/stats/task", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ areaId, note }),
    });

    if (!response.ok) throw new Error("Failed to update note");
  } catch (error) {
    console.error(error);
  }
}

export async function createNewTask(areaId: string, task: OmitDocument<TTask>) {
  try {
    const response = await fetch("/api/stats/task", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ areaId, task }),
    });

    if (!response.ok) throw new Error("Failed to add new task");

    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

export async function updateAreaName(areaId: string, areaName: string) {
  try {
    const response = await fetch("/api/stats/task", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ areaId, areaName }),
    });

    const jsonResponse = await response.json();
    if (jsonResponse.duplicate) return jsonResponse;

    if (!response.ok) throw new Error("Failed to update area");

    return jsonResponse;
  } catch (error) {
    console.error(error);
  }
}
