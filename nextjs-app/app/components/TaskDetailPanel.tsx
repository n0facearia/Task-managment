"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Task, EditingDraft } from "../context/TaskContext";
import { CATEGORY_COLORS } from "../constants";

interface TaskDetailPanelProps {
  detailTask: Task | null;
  editingDraft: EditingDraft | null;
  onUpdateTask: (id: string, patch: EditingDraft) => void;
  onClose: () => void;
}

export default function TaskDetailPanel({ detailTask, editingDraft, onUpdateTask, onClose }: TaskDetailPanelProps) {
  const [title, setTitle] = useState(editingDraft?.title ?? "");
  const [description, setDescription] = useState(editingDraft?.description ?? "");
  const [category, setCategory] = useState(editingDraft?.category ?? "");

  useEffect(() => {
    if (editingDraft) {
      setTitle(editingDraft.title);
      setDescription(editingDraft.description);
      setCategory(editingDraft.category);
    }
  }, [editingDraft]);

  if (!detailTask || !editingDraft) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="task-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: "flex" }}
      >
        <motion.div
          id="task-detail-panel"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
        >
          <h2 id="task-detail-heading">Edit Task</h2>
          <div className="task-detail-field">
            <label htmlFor="task-detail-title">Title</label>
            <input
              id="task-detail-title"
              type="text"
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="task-detail-field">
            <label htmlFor="task-detail-description">Description</label>
            <textarea
              id="task-detail-description"
              placeholder="Add a description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="task-detail-field">
            <label>Category</label>
            <div id="task-detail-categories">
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <button
                  key={cat}
                  className={`category-option ${category === cat ? "selected" : ""}`}
                  onClick={() => setCategory(category === cat ? "" : cat)}
                >
                  <span
                    className="category-dot"
                    style={{ background: color }}
                  />
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div id="task-detail-actions">
            <button id="task-detail-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              id="task-detail-done"
              onClick={() => {
                onUpdateTask(detailTask.id, {
                  id: detailTask.id,
                  title: title.trim() || detailTask.title,
                  description,
                  category,
                });
                onClose();
              }}
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
