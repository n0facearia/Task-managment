"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface TutorialAnimationProps {
  type: "pulse" | "drag-demo" | "click-demo" | "type-demo" | "none";
  target: string | null;
  fromTarget?: string | null;
  dragTo?: string | null;
  loop: boolean;
}

interface ElementPos {
  top: number;
  left: number;
  width: number;
  height: number;
}

function useElementPosition(selector: string | null): ElementPos | null {
  const [pos, setPos] = useState<ElementPos | null>(null);

  useEffect(() => {
    if (!selector) {
      setPos(null);
      return;
    }

    const timer = setTimeout(() => {
      const el = document.querySelector(selector);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }, 120);

    return () => clearTimeout(timer);
  }, [selector]);

  return pos;
}

export default function TutorialAnimation({ type, target, fromTarget, dragTo, loop }: TutorialAnimationProps) {
  const targetPos = useElementPosition(type !== "none" ? target : null);
  const fromPos = useElementPosition(type === "drag-demo" ? (fromTarget ?? target) : null);
  const toPos = useElementPosition(type === "drag-demo" ? dragTo ?? null : null);

  if (type === "none" || !targetPos) return null;

  return (
    <AnimatePresence mode="wait">
      {type === "pulse" && (
        <motion.div
          key="pulse"
          style={{
            position: "fixed",
            pointerEvents: "none",
            zIndex: 10001,
            top: targetPos.top - 8,
            left: targetPos.left - 8,
            width: targetPos.width + 16,
            height: targetPos.height + 16,
            border: "3px solid var(--theme-color)",
            borderRadius: 12,
          }}
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.7, 0, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: loop ? Infinity : 0,
            ease: "easeInOut",
          }}
        />
      )}

      {type === "click-demo" && (
        <motion.div
          key="click"
          style={{
            position: "fixed",
            pointerEvents: "none",
            zIndex: 10001,
            top: targetPos.top + targetPos.height / 2 - 12,
            left: targetPos.left + targetPos.width / 2 - 12,
          }}
          initial={{ scale: 1 }}
          animate={{
            scale: [1, 0.85, 1],
          }}
          transition={{
            duration: 0.4,
            repeat: loop ? Infinity : 0,
            repeatDelay: 1.2,
            ease: "easeInOut",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "white",
              boxShadow: "0 0 6px rgba(0,0,0,0.4)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      )}

      {type === "type-demo" && (
        <motion.span
          key="type"
          style={{
            position: "fixed",
            pointerEvents: "none",
            zIndex: 10001,
            top: targetPos.top + 4,
            left: targetPos.left + targetPos.width + 4,
            fontWeight: "bold",
            fontSize: 16,
            color: "var(--theme-color)",
          }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{
            duration: 0.8,
            repeat: loop ? Infinity : 0,
            ease: "linear",
          }}
        >
          |
        </motion.span>
      )}

      {type === "drag-demo" && fromPos && toPos && (
        <motion.div
          key="drag"
          style={{
            position: "fixed",
            pointerEvents: "none",
            zIndex: 10001,
            top: fromPos.top + fromPos.height / 2 - 12,
            left: fromPos.left + fromPos.width / 2 - 12,
          }}
          animate={{
            top: [
              fromPos.top + fromPos.height / 2 - 12,
              toPos.top + toPos.height / 2 - 12,
              toPos.top + toPos.height / 2 - 12,
              fromPos.top + fromPos.height / 2 - 12,
            ],
            left: [
              fromPos.left + fromPos.width / 2 - 12,
              toPos.left + toPos.width / 2 - 12,
              toPos.left + toPos.width / 2 - 12,
              fromPos.left + fromPos.width / 2 - 12,
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: loop ? Infinity : 0,
            ease: "easeInOut",
            times: [0, 0.45, 0.55, 1],
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "white",
              boxShadow: "0 0 6px rgba(0,0,0,0.4)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
