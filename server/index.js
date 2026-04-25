const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, "database.sqlite");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// ── DATABASE SETUP ─────────────────────────────────

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'active',
    username TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT ''
  );
`);

try {
  db.exec(`ALTER TABLE tasks ADD COLUMN category TEXT NOT NULL DEFAULT ''`);
} catch (e) {
  // Column already exists, safe to ignore
}

// ── HELPER ─────────────────────────────────────────

function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

// ── USERS ──────────────────────────────────────────

app.get("/users", (req, res) => {
  const users = db.prepare("SELECT * FROM users").all();
  res.json(users);
});

app.post("/users", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const existing = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);
  if (existing) {
    return res.status(409).json({ error: "Username already taken" });
  }

  const id = generateId();
  db.prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)").run(
    id,
    username,
    password,
  );

  res.status(201).json({ id, username, password });
});

// ── TASKS ──────────────────────────────────────────

app.get("/tasks", (req, res) => {
  const { username } = req.query;

  const tasks = username
    ? db.prepare("SELECT * FROM tasks WHERE username = ?").all(username)
    : db.prepare("SELECT * FROM tasks").all();

  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const { title, description, status, username, category } = req.body;

  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const id = generateId();
  const taskTitle = title || "";
  const taskDescription = description || "";
  const taskStatus = status || "active";
  const taskCategory = category || "";

  db.prepare(
    "INSERT INTO tasks (id, title, description, status, username, category) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(id, taskTitle, taskDescription, taskStatus, username, taskCategory);

  res.status(201).json({
    id,
    title: taskTitle,
    description: taskDescription,
    status: taskStatus,
    username,
    category: taskCategory,
  });
});

app.put("/tasks/:id", (req, res) => {
  const { id } = req.params;

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Task not found" });
  }

  const title = req.body.title !== undefined ? req.body.title : existing.title;
  const description =
    req.body.description !== undefined
      ? req.body.description
      : existing.description;
  const status =
    req.body.status !== undefined ? req.body.status : existing.status;
  const username =
    req.body.username !== undefined ? req.body.username : existing.username;
  const category =
    req.body.category !== undefined
      ? req.body.category
      : existing.category || "";

  db.prepare(
    "UPDATE tasks SET title = ?, description = ?, status = ?, username = ?, category = ? WHERE id = ?",
  ).run(title, description, status, username, category, id);

  res.json({ id, title, description, status, username, category });
});

app.delete("/tasks/:id", (req, res) => {
  const { id } = req.params;

  const existing = db.prepare("SELECT id FROM tasks WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "Task not found" });
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

  res.status(200).json({ message: "Task deleted" });
});

// ── START ──────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
