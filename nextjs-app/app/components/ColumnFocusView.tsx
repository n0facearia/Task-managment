"use client";

import { CATEGORY_COLORS } from "../constants";
import type { Task } from "../context/TaskContext";

interface ColumnFocusViewProps {
  status: string | null;
  tasks: Task[];
  onClose: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  active: "Todo",
  inProgress: "Doing",
  completed: "Done",
};

export default function ColumnFocusView({ status, tasks, onClose }: ColumnFocusViewProps) {
  if (!status) return null;

  const label = STATUS_LABELS[status] || status;

  return (
    <div id="column-focus-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div id="column-focus-panel">
        <div id="column-focus-header">
          <h2 id="column-focus-title">{label}</h2>
          <div id="column-focus-header-right">
            <span id="column-focus-count">
              {tasks.length === 1 ? "1 task" : `${tasks.length} tasks`}
            </span>
            <button id="column-focus-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>
        <div id="column-focus-list">
          {tasks.length === 0 ? (
            <div className="column-focus-empty">No tasks in this column</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="column-focus-card">
                <div className="column-focus-card-title">{task.title || "Untitled"}</div>
                {task.description && task.description.trim() && (
                  <div className="column-focus-card-description">{task.description}</div>
                )}
                {task.category && CATEGORY_COLORS[task.category] && (
                  <div className="column-focus-card-footer">
                    <span
                      className="column-focus-card-category"
                      style={{ background: CATEGORY_COLORS[task.category] }}
                    />
                    <span className="column-focus-card-category-label">{task.category}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
