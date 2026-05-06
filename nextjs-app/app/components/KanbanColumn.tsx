"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface KanbanColumnProps {
  title: string;
  id: string;
  headerAction?: ReactNode;
  onDblClick?: () => void;
  children: ReactNode;
}

export default function KanbanColumn({ title, id, headerAction, onDblClick, children }: KanbanColumnProps) {
  return (
    <motion.div
      className="kanban-column"
      id={id}
      style={{ flex: "0 0 280px", position: "relative", zIndex: 0 }}
      whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0, 0, 0, 0.4)", zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="kanban-column-header">
        <span className="kanban-column-title" onDoubleClick={onDblClick}>
          {title}
        </span>
        {headerAction}
      </div>
      <div className="kanban-tasks">
        <AnimatePresence mode="popLayout">
          {children}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
