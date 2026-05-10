"use client";

import { useTasks } from "../context/TaskContext";
import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { themeColor } = useTasks();

  useEffect(() => {
    document.documentElement.style.setProperty("--theme-color", themeColor);
    document.documentElement.style.setProperty("--accent-color", themeColor);
  }, [themeColor]);

  return <>{children}</>;
}
