"use client";

import type { ReactNode } from "react";

interface KanbanColumnProps {
  title: string;
  id: string;
  headerAction?: ReactNode;
  onDblClick?: () => void;
  children: ReactNode;
}

export default function KanbanColumn({ title, id, headerAction, onDblClick, children }: KanbanColumnProps) {
  return (
    <div className="kanban-column" id={id}>
      <div className="kanban-column-header">
        <span className="kanban-column-title" onDoubleClick={onDblClick}>
          {title}
        </span>
        {headerAction}
      </div>
      <div className="kanban-tasks">
        {children}
      </div>
    </div>
  );
}
