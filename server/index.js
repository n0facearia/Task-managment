const express = require("express");
const cors = require("cors");
const path = require("path");
const Database = require("better-sqlite3");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "task_app_secret_2026_n0face";

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, "database.sqlite");

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// ── JWT HELPERS ─────────────────────────────────────

function generateToken(username, user_id) {
  return jwt.sign({ username, user_id }, JWT_SECRET, { expiresIn: "24h" });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

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

try {
  db.exec(`ALTER TABLE tasks ADD COLUMN user_id TEXT`);
  db.exec(`UPDATE tasks SET user_id = (SELECT id FROM users WHERE users.username = tasks.username) WHERE user_id IS NULL`);
} catch (e) {
  // Column already exists, safe to ignore
}

// ── HELPER ─────────────────────────────────────────

function generateId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 7);
}

// ── AUTH ───────────────────────────────────────────

app.post("/auth/signup", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existing = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const id = generateId();
    db.prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)").run(
      id,
      username,
      password,
    );

    const token = generateToken(username, id);

    return res.status(201).json({
      success: true,
      token,
      user_id: id,
      username,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post("/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = generateToken(user.username, user.id);

    return res.status(200).json({
      success: true,
      token,
      user_id: user.id,
      username: user.username,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// ── TASKS ──────────────────────────────────────────

app.get("/tasks", authenticateToken, (req, res) => {
  try {
    const tasks = db
      .prepare("SELECT * FROM tasks WHERE user_id = ?")
      .all(req.user.user_id);
    res.json(tasks);
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/tasks", authenticateToken, (req, res) => {
  try {
    const { title, description, status, category } = req.body;
    const userId = req.user.user_id;
    const username = req.user.username;

    const id = generateId();
    const taskTitle = title || "";
    const taskDescription = description || "";
    const taskStatus = status || "active";
    const taskCategory = category || "";

    db.prepare(
      "INSERT INTO tasks (id, title, description, status, user_id, username, category) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).run(id, taskTitle, taskDescription, taskStatus, userId, username, taskCategory);

    res.status(201).json({
      id,
      title: taskTitle,
      description: taskDescription,
      status: taskStatus,
      user_id: userId,
      username,
      category: taskCategory,
    });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/tasks/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const existing = db
      .prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?")
      .get(id, userId);
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    const title = req.body.title !== undefined ? req.body.title : existing.title;
    const description =
      req.body.description !== undefined ? req.body.description : existing.description;
    const status =
      req.body.status !== undefined ? req.body.status : existing.status;
    const category =
      req.body.category !== undefined ? req.body.category : existing.category || "";

    db.prepare(
      "UPDATE tasks SET title = ?, description = ?, status = ?, category = ? WHERE id = ?"
    ).run(title, description, status, category, id);

    res.json({ id, title, description, status, user_id: userId, category });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/tasks/:id", authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;

    const existing = db
      .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
      .get(id, userId);
    if (!existing) {
      return res.status(404).json({ error: "Task not found" });
    }

    db.prepare("DELETE FROM tasks WHERE id = ?").run(id);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── START ──────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
