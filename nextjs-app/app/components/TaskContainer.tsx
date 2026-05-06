"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import KanbanColumn from "./KanbanColumn";
import Sidebar from "./Sidebar";
import TaskItem from "./TaskItem";
import TaskDetailPanel from "./TaskDetailPanel";
import CategoryFocusView from "./CategoryFocusView";
import ColumnFocusView from "./ColumnFocusView";
import DragDropHandler from "./DragDropHandler";
import { useTasks, type TaskStatus } from "../context/TaskContext";
import { CATEGORY_COLORS } from "../constants";
import { useToast } from "./Toast";

const columnVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

interface TaskContainerProps {
  onLogout?: () => void;
}

export default function TaskContainer({ onLogout }: TaskContainerProps) {
  const {
    tasks,
    inProgressTasks,
    completedTasks,
    activeCategory,
    detailTask,
    editingDraft,
    loading,
    error,
    retry,
    addTask,
    deleteTask,
    setTaskStatus,
    updateTask,
    setActiveCategory,
    openTaskDetail,
    closeTaskDetail,
  } = useTasks();

  const [categoryFocus, setCategoryFocus] = useState<string | null>(null);
  const [columnFocus, setColumnFocus] = useState<TaskStatus | null>(null);
  const toast = useToast();

  const handleTaskUpdate = useCallback((id: string, title: string, description: string) => {
    updateTask(id, { id, title, description, category: tasks.find((t) => t.id === id)?.category || "" });
  }, [updateTask, tasks]);

  const handleQuickCreate = useCallback(() => {
    const activeCount = tasks.filter((t) => t.status === "active").length;
    if (activeCount >= 20) {
      toast.showToast("You've reached the maximum of 20 tasks");
      return;
    }
    addTask("");
  }, [tasks, addTask, toast]);

  function handleLogout() {
    localStorage.removeItem("taskapp_user");
    if (onLogout) {
      onLogout();
    } else {
      window.dispatchEvent(new Event("auth-logout"));
    }
  }

  const activeTasks = tasks.filter((t) => t.status === "active");

  const filteredInProgressTasks = activeCategory
    ? inProgressTasks.filter(
        (t) => t.category.toLowerCase() === activeCategory.toLowerCase(),
      )
    : inProgressTasks;

  const filteredCompletedTasks = activeCategory
    ? completedTasks.filter(
        (t) => t.category.toLowerCase() === activeCategory.toLowerCase(),
      )
    : completedTasks;

  const filteredActiveTasks = activeCategory
    ? activeTasks.filter(
        (t) => t.category.toLowerCase() === activeCategory.toLowerCase(),
      )
    : activeTasks;

  const columnTasks = useCallback(
    (status: TaskStatus) => {
      const base = tasks.filter((t) => t.status === status);
      if (!activeCategory) return base;
      return base.filter((t) => t.category.toLowerCase() === activeCategory.toLowerCase());
    },
    [tasks, activeCategory],
  );

  const handleColumnDblClick = useCallback((status: TaskStatus) => {
    setColumnFocus(status);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (categoryFocus) setCategoryFocus(null);
        else if (columnFocus) setColumnFocus(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [categoryFocus, columnFocus]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: "flex" }}>
        <Header onLogout={handleLogout} />
        <div className="loading-state">
          <motion.div className="loading-spinner" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ display: "flex" }}>
        <Header onLogout={handleLogout} />
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button className="retry-button" onClick={retry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DragDropHandler tasks={tasks} onStatusChange={setTaskStatus}>
      <div className="page-container" style={{ display: "flex" }}>
        <Header onLogout={handleLogout} />
        <motion.div className="kanban-board" variants={columnVariants} initial="hidden" animate="visible">
          <KanbanColumn
            title="Todo"
            id="todo-column"
            headerAction={
              <button
                id="create-task"
                type="button"
                className="inline-flex items-center justify-center px-3 py-1.5 border-none rounded-lg bg-[var(--accent-color)] text-[#1c1c1c] text-[13px] font-medium transition-colors duration-200 hover:bg-[#42a5f5]"
                onClick={handleQuickCreate}
              >
                + New Task
              </button>
            }
            onDblClick={() => handleColumnDblClick("active")}
          >
            {filteredActiveTasks.length === 0 && (
              <p className="kanban-empty">No tasks yet</p>
            )}
            {filteredActiveTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={deleteTask}
                onStatusChange={setTaskStatus}
                onOpenDetail={openTaskDetail}
                onUpdate={handleTaskUpdate}
              />
            ))}
          </KanbanColumn>
          <KanbanColumn
            title="Doing"
            id="doing-column"
            onDblClick={() => handleColumnDblClick("inProgress")}
          >
            {filteredInProgressTasks.length === 0 && (
              <p className="kanban-empty">No tasks in progress</p>
            )}
            {filteredInProgressTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={deleteTask}
                onStatusChange={setTaskStatus}
                onOpenDetail={openTaskDetail}
                onUpdate={handleTaskUpdate}
              />
            ))}
          </KanbanColumn>
          <KanbanColumn
            title="Done"
            id="done-column"
            onDblClick={() => handleColumnDblClick("completed")}
          >
            {filteredCompletedTasks.length === 0 && (
              <p className="kanban-empty">No completed tasks</p>
            )}
            {filteredCompletedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDelete={deleteTask}
                onStatusChange={setTaskStatus}
                onOpenDetail={openTaskDetail}
                onUpdate={handleTaskUpdate}
              />
            ))}
          </KanbanColumn>
        </motion.div>
        <Sidebar
          tasks={tasks}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onCategoryDblClick={setCategoryFocus}
        />
        <TaskDetailPanel
          detailTask={detailTask}
          editingDraft={editingDraft}
          onUpdateTask={updateTask}
          onClose={closeTaskDetail}
        />
        <CategoryFocusView
          category={categoryFocus}
          tasks={tasks.filter(
            (t) => t.category.toLowerCase() === categoryFocus?.toLowerCase(),
          )}
          onClose={() => setCategoryFocus(null)}
        />
        <ColumnFocusView
          status={columnFocus}
          tasks={columnFocus ? columnTasks(columnFocus) : []}
          onClose={() => setColumnFocus(null)}
        />
      </div>
    </DragDropHandler>
  );
}
