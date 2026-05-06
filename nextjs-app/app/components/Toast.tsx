"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface ToastMessage {
  id: number;
  text: string;
}

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

let toastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const showToast = useCallback((message: string) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, text: message }]);
    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timersRef.current.delete(id);
    }, 3000);
    timersRef.current.set(id, timer);
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        <div id="toast-container">
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              className="toast"
              initial={{ opacity: 0, x: 40, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            >
              <div className="toast-message">{toast.text}</div>
              <div className="toast-bar-track">
                <div className="toast-bar" />
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
