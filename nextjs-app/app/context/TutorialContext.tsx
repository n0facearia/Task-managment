"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { TUTORIAL_STEPS, type TutorialStep } from "../data/tutorialSteps";
import * as api from "../lib/api";
import { useTasks } from "./TaskContext";

interface TutorialContextValue {
  isTutorialActive: boolean;
  currentStep: number;
  tutorialCompleted: boolean;
  currentStepData: TutorialStep | null;
  totalSteps: number;
  demoTaskId: string | null;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  goToStep: (step: number) => void;
  checkIfNewUser: () => boolean;
}

const TutorialContext = createContext<TutorialContextValue>({
  isTutorialActive: false,
  currentStep: 0,
  tutorialCompleted: true,
  currentStepData: null,
  totalSteps: TUTORIAL_STEPS.length,
  demoTaskId: null,
  startTutorial: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTutorial: () => {},
  completeTutorial: () => {},
  goToStep: () => {},
  checkIfNewUser: () => false,
});

export function useTutorial() {
  return useContext(TutorialContext);
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { setHideTasks, retry } = useTasks();
  const [demoTaskId, setDemoTaskId] = useState<string | null>(null);
  const [isTutorialActive, setIsTutorialActive] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tutorialActive") === "true";
    }
    return false;
  });
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("tutorialCurrentStep");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });
  const [tutorialCompleted, setTutorialCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tutorialCompleted") === "true";
    }
    return true;
  });

  const totalSteps = TUTORIAL_STEPS.length;
  const currentStepData = isTutorialActive ? TUTORIAL_STEPS[currentStep] ?? null : null;

  useEffect(() => {
    if (isTutorialActive) {
      localStorage.setItem("tutorialActive", "true");
      localStorage.setItem("tutorialCurrentStep", currentStep.toString());
    } else {
      localStorage.removeItem("tutorialActive");
      localStorage.removeItem("tutorialCurrentStep");
    }
  }, [isTutorialActive, currentStep]);

  const startTutorial = useCallback(() => {
    setCurrentStep(0);
    setTutorialCompleted(false);
    setIsTutorialActive(true);
    setHideTasks(true);
    localStorage.setItem("tutorialActive", "true");
    localStorage.setItem("tutorialCurrentStep", "0");
    localStorage.removeItem("tutorialCompleted");

    setTimeout(async () => {
      try {
        const saved = await api.createTask({
          title: "",
          description: "",
          status: "active",
          category: "",
        });
        setDemoTaskId(String(saved.id));
        await retry();
      } catch (err) {
        console.error("Failed to create tutorial demo task:", err);
      }
    }, 800);
  }, [setHideTasks, retry]);

  const nextStep = useCallback(() => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, TUTORIAL_STEPS.length - 1)));
  }, []);

  const finishTutorial = useCallback(async () => {
    setIsTutorialActive(false);
    setTutorialCompleted(true);
    localStorage.setItem("tutorialCompleted", "true");
    localStorage.removeItem("isNewUser");
    localStorage.removeItem("tutorialActive");
    localStorage.removeItem("tutorialCurrentStep");

    if (demoTaskId) {
      try {
        await api.deleteTask(demoTaskId);
      } catch (err) {
        console.error("Could not delete demo task:", err);
      }
    }

    setHideTasks(false);

    const pending = localStorage.getItem("pendingSuggestedTasks");
    if (pending) {
      try {
        const suggestions = JSON.parse(pending);
        for (const task of suggestions) {
          await api.createTask(task);
        }
        localStorage.removeItem("pendingSuggestedTasks");
      } catch (err) {
        console.error("Could not add suggested tasks:", err);
      }
    }

    await retry();
  }, [demoTaskId, setHideTasks, retry]);

  const skipTutorial = useCallback(() => {
    finishTutorial();
  }, [finishTutorial]);

  const completeTutorial = useCallback(() => {
    finishTutorial();
  }, [finishTutorial]);

  const checkIfNewUser = useCallback(() => {
    if (typeof window === "undefined") return false;
    const completed = localStorage.getItem("tutorialCompleted");
    return completed !== "true";
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        isTutorialActive,
        currentStep,
        tutorialCompleted,
        currentStepData,
        totalSteps,
        demoTaskId,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        completeTutorial,
        goToStep,
        checkIfNewUser,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}
