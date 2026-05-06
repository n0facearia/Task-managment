import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "./components/Toast";
import HalftoneBackground from "./components/HalftoneBackground";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
        />
      </head>
      <body suppressHydrationWarning>
        <HalftoneBackground />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
