export async function deleteArea(areaId: string) {
  try {
    const response = await fetch("/api/stats/task", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ areaId }),
    });

    if (!response.ok) throw new Error("Failed to delete task");
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function deleteTask(areaId: string, taskId: string) {
  try {
    const response = await fetch("/api/stats/task", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ areaId, taskId }),
    });

    if (!response.ok) throw new Error("Failed to delete task");
  } catch (error) {
    console.error("Error:", error);
  }
}
