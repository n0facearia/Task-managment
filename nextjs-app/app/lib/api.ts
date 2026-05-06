import type { TaskStatus } from "../context/TaskContext";

const API_BASE = "http://localhost:3001";

interface ServerTask {
  id: string | number;
  title: string;
  description: string;
  status: string;
  user_id: string | number;
  username: string;
  category: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user_id: string | number;
  username: string;
}

function storeToken(token: string): void {
  localStorage.setItem("authToken", token);
}

function getToken(): string | null {
  return localStorage.getItem("authToken");
}

function clearToken(): void {
  localStorage.removeItem("authToken");
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function fetchApi(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (res.status === 401) {
    clearToken();
    window.location.href = "/";
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `API error (${res.status})`);
  }
  return res;
}

// ── AUTH ───────────────────────────────────────────

export async function signup(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 400) {
    const data = await res.json();
    throw new Error(data.error || "Signup failed");
  }
  if (!res.ok) {
    throw new Error(`Signup failed (${res.status})`);
  }

  const data = await res.json();
  storeToken(data.token);
  return data;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (res.status === 401 || res.status === 400) {
    const data = await res.json();
    throw new Error(data.error || "Login failed");
  }
  if (!res.ok) {
    throw new Error(`Login failed (${res.status})`);
  }

  const data = await res.json();
  storeToken(data.token);
  return data;
}

export function logout(): void {
  clearToken();
}

// ── TASKS ──────────────────────────────────────────

export async function fetchTasks(): Promise<ServerTask[]> {
  const res = await fetchApi(`${API_BASE}/tasks`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function createTask(payload: {
  title: string;
  description: string;
  status: string;
  category: string;
}): Promise<ServerTask> {
  const res = await fetchApi(`${API_BASE}/tasks`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateTask(
  id: string,
  payload: { title?: string; description?: string; status?: TaskStatus; category?: string },
): Promise<ServerTask> {
  const res = await fetchApi(`${API_BASE}/tasks/` + encodeURIComponent(id), {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function deleteTask(id: string): Promise<void> {
  await fetchApi(`${API_BASE}/tasks/` + encodeURIComponent(id), {
    method: "DELETE",
    headers: authHeaders(),
  });
}
