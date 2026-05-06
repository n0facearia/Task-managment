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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <motion.div
        className="kanban-column-header"
        whileHover={{ backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        <span className="kanban-column-title" onDoubleClick={onDblClick}>
          {title}
        </span>
        {headerAction}
      </motion.div>
      <motion.div
        className="kanban-tasks"
        whileDrag={{ backgroundColor: "rgba(30,136,229,0.05)" }}
      >
        <AnimatePresence mode="popLayout">
          {children}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
