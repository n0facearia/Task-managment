const API_BASE = '/api';

export async function getTasks(username: string) {
  const query = new URLSearchParams({ username });
  const res = await fetch(`${API_BASE}/tasks?${query}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch tasks: ${res.status}`);
  }
  return res.json();
}

export async function createTask(data: {
  title: string;
  description: string;
  status: string;
  username: string;
  category?: string;
}) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to create task: ${res.status}`);
  }
  return res.json();
}

export async function updateTask(taskId: string, data: {
  title?: string;
  description?: string;
  status?: string;
  category?: string;
}) {
  const res = await fetch(`${API_BASE}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to update task: ${res.status}`);
  }
  return res.ok;
}

export async function deleteTask(taskId: string) {
  const res = await fetch(`${API_BASE}/tasks/${encodeURIComponent(taskId)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete task: ${res.status}`);
  }
  return res.ok;
}

export async function getUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }
  return res.json();
}

export async function createUser(data: { username: string; password: string }) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(`Failed to create user: ${res.status}`);
  }
  return res.json();
}
