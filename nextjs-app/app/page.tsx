"use client";

import { useCallback, useEffect, useState } from "react";
import { TaskProvider } from "./context/TaskContext";
import TaskContainer from "./components/TaskContainer";
import AuthSplash from "./components/AuthSplash";
import * as api from "./lib/api";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    api.fetchTasks()
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        api.logout();
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
