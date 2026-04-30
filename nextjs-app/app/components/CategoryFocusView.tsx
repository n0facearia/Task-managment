"use client";

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
    <div id="category-focus-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div id="category-focus-panel">
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
      </div>
    </div>
  );
}
