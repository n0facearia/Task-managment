import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "./components/Toast";
import { TaskProvider } from "./context/TaskContext";
import { TutorialProvider } from "./context/TutorialContext";
import HalftoneBackground from "./components/HalftoneBackground";
import ThemeProvider from "./components/ThemeProvider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body suppressHydrationWarning>
        <TaskProvider>
          <TutorialProvider>
            <ThemeProvider>
              <HalftoneBackground />
              <ToastProvider>{children}</ToastProvider>
            </ThemeProvider>
          </TutorialProvider>
        </TaskProvider>
      </body>
    </html>
  );
}
