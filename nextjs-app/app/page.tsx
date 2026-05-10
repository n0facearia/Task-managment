"use client";

import { useCallback, useEffect, useState } from "react";
import { TaskProvider } from "./context/TaskContext";
import TaskContainer from "./components/TaskContainer";
import AuthSplash from "./components/AuthSplash";
import TutorialOverlay from "./components/TutorialOverlay";
import { useTutorial } from "./context/TutorialContext";
import { useTasks } from "./context/TaskContext";
import * as api from "./lib/api";

function TutorialStarter({ isAuthenticated }: { isAuthenticated: boolean }) {
  const { startTutorial } = useTutorial();

  useEffect(() => {
    if (!isAuthenticated) return;

    const isNewUser = localStorage.getItem("isNewUser") === "true";
    const tutorialCompleted = localStorage.getItem("tutorialCompleted") === "true";

    if (isNewUser && !tutorialCompleted) {
      const timer = setTimeout(() => {
        startTutorial();
        localStorage.removeItem("isNewUser");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, startTutorial]);

  return null;
}

export default function HomePage() {
  const { skipTutorial } = useTutorial();
  const { clearTasks, retry } = useTasks();
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
    retry();
  }, [retry]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("isNewUser");
    clearTasks();
    setIsAuthenticated(false);
    skipTutorial();
  }, [skipTutorial, clearTasks]);

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

  return (
    <>
      <TutorialOverlay isLoggedIn={isAuthenticated} />
      <TutorialStarter isAuthenticated={isAuthenticated} />
      {!isAuthenticated ? (
        <AuthSplash onAuthComplete={handleAuthComplete} />
      ) : (
        <TaskContainer onLogout={handleLogout} />
      )}
    </>
  );
}
