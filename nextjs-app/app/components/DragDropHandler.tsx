"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Task, TaskStatus } from "../context/TaskContext";

interface DragDropHandlerProps {
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  children: React.ReactNode;
}

const COLUMN_STATUS_MAP: Record<string, TaskStatus> = {
  "todo-column": "active",
  "doing-column": "inProgress",
  "done-column": "completed",
};

export default function DragDropHandler({ tasks, onStatusChange, children }: DragDropHandlerProps) {
  const draggedTaskIdRef = useRef<string | null>(null);
  const inProgressRef = useRef<Set<string>>(new Set());

  const handleDragStart = useCallback((e: DragEvent) => {
    const taskEl = (e.target as HTMLElement).closest("[data-task-id]");
    if (!taskEl) return;
    const taskId = (taskEl as HTMLElement).dataset.taskId;
    if (!taskId) return;
    draggedTaskIdRef.current = taskId;
    (e.dataTransfer as DataTransfer).effectAllowed = "move";
    (taskEl as HTMLElement).style.opacity = "0.4";
  }, []);

  const handleDragEnd = useCallback((e: DragEvent) => {
    const taskEl = (e.target as HTMLElement).closest("[data-task-id]");
    if (taskEl) {
      (taskEl as HTMLElement).style.opacity = "1";
    }
    draggedTaskIdRef.current = null;
    document.querySelectorAll(".kanban-column").forEach((col) => {
      col.classList.remove("drag-over");
    });
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    const column = (e.target as HTMLElement).closest(".kanban-column");
    if (column) {
      column.classList.add("drag-over");
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    const column = (e.target as HTMLElement).closest(".kanban-column") as HTMLElement | null;
    if (!column) return;
    const related = e.relatedTarget as Node | null;
    if (!column.contains(related)) {
      column.classList.remove("drag-over");
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      const column = (e.target as HTMLElement).closest(".kanban-column") as HTMLElement | null;
      if (!column) return;
      column.classList.remove("drag-over");

      const taskId = draggedTaskIdRef.current;
      if (!taskId) return;

      if (inProgressRef.current.has(taskId)) return;

      const columnId = column.id;
      const newStatus = COLUMN_STATUS_MAP[columnId];
      if (!newStatus) return;

      inProgressRef.current.add(taskId);

      if (newStatus === "active") {
        const activeCount = tasks.filter((t) => t.status === "active").length;
        if (activeCount >= 20) {
          inProgressRef.current.delete(taskId);
          return;
        }
      }

      onStatusChange(taskId, newStatus);

      setTimeout(() => {
        inProgressRef.current.delete(taskId);
      }, 500);
    },
    [tasks, onStatusChange],
  );

  useEffect(() => {
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop]);

  return <>{children}</>;
}
