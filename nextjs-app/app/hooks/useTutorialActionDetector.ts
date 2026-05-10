import { useEffect, useRef } from "react";
import { useTutorial } from "../context/TutorialContext";
import { useTasks } from "../context/TaskContext";

const DRAG_STATUS_MAP: Record<number, string> = {
  10: "inProgress",
  11: "completed",
};

export function useTutorialActionDetector() {
  const { isTutorialActive, currentStepData, currentStep, nextStep } = useTutorial();
  const { tasks } = useTasks();
  const prevTaskStatusesRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!isTutorialActive || !currentStepData) return;

    const { action, actionTarget } = currentStepData;

    if (action === "none") return;

    const selector = actionTarget ?? currentStepData.target;

    if (action === "click") {
      const handleInteraction = (target: HTMLElement) => {
        if (!selector) return;

        const els = document.querySelectorAll(selector);
        for (let i = 0; i < els.length; i++) {
          const el = els[i];
          if (el === target || el.contains(target)) {
            nextStep();
            return;
          }
        }
      };

      const handleClick = (e: MouseEvent) => {
        handleInteraction(e.target as HTMLElement);
      };

      const handleTouchEnd = (e: TouchEvent) => {
        const touch = e.changedTouches[0];
        if (!touch) return;
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (el) {
          handleInteraction(el as HTMLElement);
        }
      };

      document.addEventListener("click", handleClick, true);
      document.addEventListener("touchend", handleTouchEnd, true);
      return () => {
        document.removeEventListener("click", handleClick, true);
        document.removeEventListener("touchend", handleTouchEnd, true);
      };
    }

    if (action === "drag") {
      const expectedStatus = DRAG_STATUS_MAP[currentStep] ?? null;
      if (!expectedStatus) return;

      const prevMap = prevTaskStatusesRef.current;

      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const prevStatus = prevMap.get(task.id);
        if (prevStatus && prevStatus !== task.status && task.status === expectedStatus) {
          nextStep();
          break;
        }
      }

      const newMap = new Map<string, string>();
      for (let i = 0; i < tasks.length; i++) {
        newMap.set(tasks[i].id, tasks[i].status);
      }
      prevTaskStatusesRef.current = newMap;
      return;
    }

    if (action === "type") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== "Enter") return;
        const target = e.target as HTMLElement;
        if (!selector) return;

        if (target.matches(selector)) {
          const value = (target as HTMLInputElement | HTMLTextAreaElement).value;
          if (value.trim().length > 0) {
            nextStep();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown, true);
      return () => document.removeEventListener("keydown", handleKeyDown, true);
    }

    if (action === "wait") {
      const timeout = setTimeout(() => {
        nextStep();
      }, 2500);
      return () => clearTimeout(timeout);
    }
  }, [isTutorialActive, currentStepData, currentStep, nextStep, tasks]);
}
