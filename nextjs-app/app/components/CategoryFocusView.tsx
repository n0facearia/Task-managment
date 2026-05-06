"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CATEGORY_COLORS } from "../constants";
import type { Task } from "../context/TaskContext";

interface CategoryFocusViewProps {
  category: string | null;
  tasks: Task[];
  onClose: () => void;
}

const STATUS_DISPLAY: Record<string, string> = {
  active: "Todo",
  inProgress: "Doing",
  completed: "Done",
};

export default function CategoryFocusView({ category, tasks, onClose }: CategoryFocusViewProps) {
  if (!category) return null;

  const color = CATEGORY_COLORS[category] || "#888";

  return (
    <AnimatePresence>
      <motion.div
        id="category-focus-overlay"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          id="category-focus-panel"
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <div id="category-focus-header">
            <div id="category-focus-title-row">
              <span id="category-focus-dot" style={{ background: color }} />
              <h2 id="category-focus-title">{category}</h2>
            </div>
            <button id="category-focus-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div id="category-focus-task-count">
            {tasks.length === 1 ? "1 task" : `${tasks.length} tasks`}
          </div>
          <div id="category-focus-list">
            {tasks.length === 0 ? (
              <div className="focus-empty-state">No tasks in this category</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="focus-task-card">
                  <div className="focus-task-title">{task.title || "Untitled"}</div>
                  {task.description && task.description.trim() && (
                    <div className="focus-task-description">{task.description}</div>
                  )}
                  <div className="focus-task-status">
                    {STATUS_DISPLAY[task.status] || task.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
