"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type { Task, TaskStatus } from "../context/TaskContext";
import { CATEGORY_COLORS } from "../constants";

interface TaskItemProps {
  task: Task;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onUpdate: (id: string, title: string, description: string) => void;
  onOpenDetail: (task: Task) => void;
}

export default function TaskItem({ task, onDelete, onStatusChange, onUpdate, onOpenDetail }: TaskItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(!task.title);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const [descDraft, setDescDraft] = useState(task.description);
  const [titleError, setTitleError] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditingTitle) {
      titleInputRef.current?.focus();
      setTitleError(false);
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription) descInputRef.current?.focus();
  }, [isEditingDescription]);

  const saveTitle = useCallback(() => {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setTitleError(true);
      return;
    }
    setTitleError(false);
    if (trimmed !== task.title) {
      onUpdate(task.id, trimmed, task.description);
    }
    setIsEditingTitle(false);
  }, [titleDraft, task.id, task.title, task.description, onUpdate]);

  const saveDescription = useCallback(() => {
    const trimmed = descDraft.trim();
    if (trimmed !== task.description) {
      onUpdate(task.id, task.title, trimmed);
    } else {
      setDescDraft(task.description);
    }
    setIsEditingDescription(false);
  }, [descDraft, task.id, task.title, task.description, onUpdate]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveTitle();
    if (e.key === "Escape") {
      setTitleDraft(task.title);
      setIsEditingTitle(false);
    }
  }, [saveTitle, task.title]);

  const handleDescKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setDescDraft(task.description);
      setIsEditingDescription(false);
    }
  }, [task.description]);

  const showBack = task.status === "inProgress" || task.status === "completed";
  const showNext = task.status === "active" || task.status === "inProgress";
  const categoryColor = CATEGORY_COLORS[task.category];

  return (
    <div
      className="task"
      draggable
      data-task-id={task.id}
    >
      {isEditingTitle ? (
        <input
          ref={titleInputRef}
          className={`task-title-edit ${titleError ? 'error' : ''}`}
          value={titleDraft}
          onChange={(e) => {
            setTitleDraft(e.target.value);
            setTitleError(false);
          }}
          onBlur={saveTitle}
          onKeyDown={handleTitleKeyDown}
          placeholder={titleError ? "Title is required" : "Enter task title"}
        />
      ) : (
        <div onDoubleClick={() => setIsEditingTitle(true)}>{task.title || "Untitled task"}</div>
      )}
      {isEditingDescription ? (
        <textarea
          ref={descInputRef}
          className="task-description-edit"
          value={descDraft}
          onChange={(e) => setDescDraft(e.target.value)}
          onBlur={saveDescription}
          onKeyDown={handleDescKeyDown}
        />
      ) : (
        <div className="task-description" onDoubleClick={() => setIsEditingDescription(true)}>
          {task.description.trim() || "Add a description..."}
        </div>
      )}
      <div className="task-bottom-row">
        <div>
          {categoryColor ? (
            <span
              className="task-category-dot"
              style={{ background: categoryColor, cursor: "pointer" }}
              onClick={() => onOpenDetail(task)}
            />
          ) : (
            <button
              className="task-set-category-btn"
              onClick={() => onOpenDetail(task)}
            >
              Set category
            </button>
          )}
        </div>
        <div className="task-buttons">
          <div className="task-buttons-left">
            {showBack && (
              <button
                className="btn-back"
                onClick={() => {
                  if (task.status === "inProgress") {
                    onStatusChange(task.id, "active");
                  } else if (task.status === "completed") {
                    onStatusChange(task.id, "inProgress");
                  }
                }}
              >
                ← Back
              </button>
            )}
          </div>
          <div className="task-buttons-right">
            {showNext && (
              <button
                className="btn-next"
                onClick={() => {
                  if (task.status === "active") {
                    onStatusChange(task.id, "inProgress");
                  } else if (task.status === "inProgress") {
                    onStatusChange(task.id, "completed");
                  }
                }}
              >
                Next →
              </button>
            )}
            <button
              className="cross-button"
              aria-label="Delete task"
              onClick={() => onDelete(task.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
