import type { TaskStatus } from "../context/TaskContext";

interface ServerTask {
  id: string | number;
  title: string;
  description: string;
  status: string;
  username: string;
  category: string;
}

interface ServerUser {
  id: string | number;
  username: string;
  password: string;
}

async function fetchApi(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`API error (${res.status})`);
  return res;
}

export async function fetchUsers(): Promise<ServerUser[]> {
  const res = await fetchApi("/api/users");
  return res.json();
}

export async function createUser(payload: {
  username: string;
  password: string;
}): Promise<ServerUser> {
  const res = await fetchApi("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function fetchTasks(username: string): Promise<ServerTask[]> {
  const res = await fetchApi("/api/tasks?username=" + encodeURIComponent(username));
  return res.json();
}

export async function createTask(payload: {
  title: string;
  description: string;
  status: string;
  username: string;
}): Promise<ServerTask> {
  const res = await fetchApi("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateTask(
  id: string,
  payload: { title?: string; description?: string; status?: TaskStatus; category?: string },
): Promise<ServerTask> {
  const res = await fetchApi("/api/tasks/" + encodeURIComponent(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  await fetchApi("/api/tasks/" + encodeURIComponent(id), { method: "DELETE" });
}
