"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as api from "../lib/api";
import { CATEGORY_COLORS } from "../constants";

export type TaskStatus = "active" | "inProgress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category: string;
}

export interface EditingDraft {
  id: string;
  title: string;
  description: string;
  category: string;
}

interface TaskContextValue {
  tasks: Task[];
  inProgressTasks: Task[];
  completedTasks: Task[];
  activeCategory: string;
  themeColor: string;
  detailTask: Task | null;
  editingDraft: EditingDraft | null;
  loading: boolean;
  error: string | null;
  addTask: (title: string) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  updateTask: (id: string, patch: EditingDraft) => void;
  setActiveCategory: (cat: string | null) => void;
  openTaskDetail: (task: Task) => void;
  closeTaskDetail: () => void;
  retry: () => void;
  clearTasks: () => void;
  hideTasks: boolean;
  setHideTasks: (value: boolean) => void;
}

const TaskContext = createContext<TaskContextValue>({
  tasks: [],
  inProgressTasks: [],
  completedTasks: [],
  activeCategory: "",
  themeColor: "#1e88e5",
  detailTask: null,
  editingDraft: null,
  loading: true,
  error: null,
  addTask: () => {},
  deleteTask: () => {},
  setTaskStatus: () => {},
  updateTask: () => {},
  setActiveCategory: () => {},
  openTaskDetail: () => {},
  closeTaskDetail: () => {},
  retry: () => {},
  clearTasks: () => {},
  hideTasks: false,
  setHideTasks: () => {},
});

export function useTasks() {
  return useContext(TaskContext);
}

const DEFAULT_THEME = "#1e88e5";

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [themeColor, setThemeColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeColor") || DEFAULT_THEME;
    }
    return DEFAULT_THEME;
  });
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [editingDraft, setEditingDraft] = useState<EditingDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hideTasks, setHideTasks] = useState(false);

  useEffect(() => {
    console.log("TASKS_STATE_CHANGED:", tasks.map(t => t.title));
  }, [tasks]);

  const inProgressTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === "inProgress")
        .filter((t) =>
          activeCategory
            ? t.category.toLowerCase() === activeCategory.toLowerCase()
            : true,
        ),
    [tasks, activeCategory],
  );

  const completedTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === "completed")
        .filter((t) =>
          activeCategory
            ? t.category.toLowerCase() === activeCategory.toLowerCase()
            : true,
        ),
    [tasks, activeCategory],
  );

  const loadTasks = useCallback(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    api.fetchTasks()
      .then((serverTasks) => {
        const mapped = serverTasks.map((t) => ({
          id: String(t.id),
          title: t.title || "",
          description: t.description || "",
          status: (t.status || "active") as TaskStatus,
          category: t.category || "",
        }));
        console.log("STATE_RESET loadTasks:", mapped);
        setTasks(mapped);
      })
      .catch((err) => {
        if (err.message === "Session expired") {
          setTasks([]);
        } else {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    console.log("USE_EFFECT loadTasks triggered");
    loadTasks();
  }, [loadTasks]);

  const addTask = useCallback((title: string) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const activeCount = tasks.filter((t) => t.status === "active").length;
    if (activeCount >= 20) return;

    const newCategory = activeCategory || "";
    const tempId = "temp-" + crypto.randomUUID();
    const temp: Task = {
      id: tempId,
      title,
      description: "",
      status: "active",
      category: newCategory,
    };
    setTasks((prev) => {
      console.log("SET_TASKS addTask (optimistic):", prev.length, "->", prev.length + 1, "tasks");
      return [temp, ...prev];
    });

    api.createTask({
      title,
      description: "",
      status: "active",
      category: newCategory,
    })
      .then((saved) => {
        console.log("SET_TASKS addTask (server swap):", saved.id);
        setTasks((prev) =>
          prev.map((t) => (t.id === tempId ? { ...t, id: String(saved.id) } : t)),
        );
      })
      .catch(() => {
        console.log("SET_TASKS addTask (rollback):", tempId);
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
      });
  }, [tasks, activeCategory]);

  const deleteTask = useCallback((id: string) => {
    if (!id.startsWith("temp-")) {
      api.deleteTask(id).catch(() => {});
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t)),
    );
    if (!id.startsWith("temp-")) {
      api.updateTask(id, { status }).catch(() => {});
    }
  }, []);

  const updateTask = useCallback((id: string, patch: EditingDraft) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, title: patch.title, description: patch.description, category: patch.category }
          : t,
      ),
    );
    if (!id.startsWith("temp-")) {
      api.updateTask(id, {
        title: patch.title,
        description: patch.description,
        category: patch.category,
      }).catch(() => {});
    }
  }, []);

  const setActiveCategoryWithTheme = useCallback((cat: string | null) => {
    setActiveCategory(cat ?? "");
    const color = cat ? CATEGORY_COLORS[cat] || DEFAULT_THEME : DEFAULT_THEME;
    setThemeColor(color);
    localStorage.setItem("themeColor", color);
  }, []);

  const openTaskDetail = useCallback((task: Task) => {
    setDetailTask(task);
    setEditingDraft({
      id: task.id,
      title: task.title,
      description: task.description,
      category: task.category,
    });
  }, []);

  const closeTaskDetail = useCallback(() => {
    setDetailTask(null);
    setEditingDraft(null);
  }, []);

  const clearTasks = useCallback(() => {
    setTasks([]);
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        inProgressTasks,
        completedTasks,
        activeCategory,
        themeColor,
        detailTask,
        editingDraft,
        loading,
        error,
        retry: loadTasks,
        addTask,
        deleteTask,
        setTaskStatus,
        updateTask,
        setActiveCategory: setActiveCategoryWithTheme,
        openTaskDetail,
        closeTaskDetail,
        clearTasks,
        hideTasks,
        setHideTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}