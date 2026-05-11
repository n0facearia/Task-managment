import type { ReactNode } from "react";
import "./globals.css";
import dynamic from "next/dynamic";
import { ToastProvider } from "./components/Toast";
import { TaskProvider } from "./context/TaskContext";
import { TutorialProvider } from "./context/TutorialContext";
import ThemeProvider from "./components/ThemeProvider";

const HalftoneBackground = dynamic(() => import("./components/HalftoneBackground"), {
  ssr: false,
});

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
