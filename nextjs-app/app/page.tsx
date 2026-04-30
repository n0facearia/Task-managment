"use client";

import { useCallback, useEffect, useState } from "react";
import { TaskProvider } from "./context/TaskContext";
import TaskContainer from "./components/TaskContainer";
import AuthSplash from "./components/AuthSplash";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("taskapp_user");
    if (storedUser) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleAuthComplete = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  if (isLoading) {
    return (
      <div id="splash">
        <div className="auth-panel" id="landing-panel">
          <div className="splash-logo"></div>
          <div className="splash-title">Task App</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AuthSplash onAuthComplete={handleAuthComplete} />
      </>
    );
  }

  return (
    <TaskProvider>
      <TaskContainer onLogout={handleLogout} />
    </TaskProvider>
  );
}
