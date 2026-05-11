"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTutorial } from "../context/TutorialContext";
import { useTasks } from "../context/TaskContext";
import TutorialTooltip from "./TutorialTooltip";
import TutorialAnimation from "./TutorialAnimation";
import { useTutorialActionDetector } from "../hooks/useTutorialActionDetector";

interface SpotlightRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

const OVERLAY_Z = 9999;

interface TutorialOverlayProps {
  isLoggedIn: boolean;
}

export default function TutorialOverlay({ isLoggedIn }: TutorialOverlayProps) {
  const { isTutorialActive, currentStepData, currentStep, totalSteps, skipTutorial, nextStep, prevStep, demoTaskId } = useTutorial();
  const { setTaskStatus } = useTasks();
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isTutorialActive) {
      setIsReady(false);
      return;
    }
    const timer = setTimeout(() => setIsReady(true), 300);
    return () => clearTimeout(timer);
  }, [isTutorialActive]);

  useTutorialActionDetector();

  const resetTaskRef = useRef(false);

  useEffect(() => {
    if (!isTutorialActive || !currentStepData) return;
    if (currentStepData.title !== "Resetting Task") {
      resetTaskRef.current = false;
      return;
    }
    if (resetTaskRef.current) return;
    resetTaskRef.current = true;

    if (demoTaskId) {
      setTaskStatus(demoTaskId, "active");
    }
  }, [isTutorialActive, currentStepData, demoTaskId, setTaskStatus]);

  useEffect(() => {
    if (!isTutorialActive || !currentStepData || !currentStepData.target) {
      setSpotlight(null);
      return;
    }

    const targetSelector = currentStepData.target;

    const updateSpotlight = () => {
      const el = document.querySelector(targetSelector);
      if (!el) {
        setSpotlight(null);
        return;
      }
      const rect = el.getBoundingClientRect();
      if (!rect.width && !rect.height) {
        setSpotlight(null);
        return;
      }
      setSpotlight({
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      });
    };

    const rafId = requestAnimationFrame(() => updateSpotlight());

    window.addEventListener("resize", updateSpotlight);
    const observer = new MutationObserver(updateSpotlight);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateSpotlight);
      observer.disconnect();
    };
  }, [isTutorialActive, currentStepData]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && currentStepData?.blockOtherInteractions) {
      return;
    }
  };

  if (!isLoggedIn || !isTutorialActive || !currentStepData || !isReady) return null;

  const stepNumber = currentStep + 1;

  return (
    <div ref={overlayRef} className="tutorial-overlay" onClick={handleOverlayClick} style={{ pointerEvents: 'none' }}>
      {spotlight && currentStepData?.blockOtherInteractions && (
        <>
          <div
            className="tutorial-block-panel tutorial-block-top"
            style={{ zIndex: OVERLAY_Z + 1, height: spotlight.top }}
          />
          <div
            className="tutorial-block-panel tutorial-block-bottom"
            style={{ zIndex: OVERLAY_Z + 1, top: spotlight.bottom }}
          />
          <div
            className="tutorial-block-panel tutorial-block-left"
            style={{ zIndex: OVERLAY_Z + 1, top: spotlight.top, height: spotlight.height, width: spotlight.left }}
          />
          <div
            className="tutorial-block-panel tutorial-block-right"
            style={{ zIndex: OVERLAY_Z + 1, top: spotlight.top, height: spotlight.height, left: spotlight.right }}
          />
        </>
      )}

      {spotlight && (
        <div
          className="tutorial-spotlight"
          style={{
            zIndex: OVERLAY_Z + 1,
            top: spotlight.top - 4,
            left: spotlight.left - 4,
            width: spotlight.width + 8,
            height: spotlight.height + 8,
          }}
        >
          {currentStepData.animationType !== "none" && (
            <TutorialAnimation
              type={currentStepData.animationType}
              target={currentStepData.target}
              fromTarget={currentStepData.action === "drag" && currentStepData.target ? `${currentStepData.target} .task` : undefined}
              dragTo={currentStepData.dragTo}
              loop={currentStepData.animationLoop}
            />
          )}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          className="tutorial-tooltip-wrapper"
          style={{
            zIndex: OVERLAY_Z + 2,
            top: 16,
            right: 16,
            left: "auto",
            bottom: "auto",
            transform: "none",
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <TutorialTooltip
            title={currentStepData.title}
            description={currentStepData.description}
            position={currentStepData.tooltipPosition}
            stepNumber={stepNumber}
            totalSteps={totalSteps}
            onSkip={skipTutorial}
            onNext={nextStep}
            onBack={prevStep}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === totalSteps - 1}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
