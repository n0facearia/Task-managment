"use client";

interface TutorialTooltipProps {
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right";
  stepNumber: number;
  totalSteps: number;
  onSkip: () => void;
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export default function TutorialTooltip({
  title,
  description,
  stepNumber,
  totalSteps,
  onSkip,
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: TutorialTooltipProps) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        left: "auto",
        bottom: "auto",
        transform: "none",
        width: 300,
        zIndex: 10002,
        pointerEvents: "auto",
        background: "#2a2a2a",
        border: "1px solid #3a3a3a",
        borderRadius: 12,
        padding: 16,
        boxShadow: "0 12px 32px rgba(0,0,0,0.5)",
        color: "#e6e6e6",
      }}
    >
      <div style={{ fontSize: 11, color: "#888", marginBottom: 8, textAlign: "right" }}>
        Step {stepNumber} of {totalSteps}
      </div>
      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#f0f0f0" }}>{title}</h3>
      <p style={{ margin: "0 0 14px", fontSize: 13, lineHeight: 1.5, color: "#aaa" }}>{description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {!isFirstStep && (
            <button
              type="button"
              onClick={onBack}
              style={{
                background: "transparent",
                border: "1px solid #444",
                borderRadius: 6,
                padding: "6px 14px",
                fontSize: 13,
                color: "#888",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            onClick={onSkip}
            style={{
              background: "none",
              border: "none",
              borderRadius: 6,
              padding: "6px 10px",
              fontSize: 12,
              color: "#888",
              cursor: "pointer",
            }}
          >
            Skip
          </button>
        </div>
        <button
          type="button"
          onClick={onNext}
          style={{
            background: "#3b82f6",
            border: "none",
            borderRadius: 6,
            padding: "6px 16px",
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          {isLastStep ? "Finish ✓" : "Next →"}
        </button>
      </div>
    </div>
  );
}
