"use client";

import { useCareerStore } from "@/stores/careerStore";
import { STAGE_ORDER, STAGE_LABELS } from "@/lib/utils";

export default function StageIndicator() {
  const currentStage = useCareerStore((s) => s.currentStage);
  const stageProgress = useCareerStore((s) => s.stageProgress);

  const currentIdx = STAGE_ORDER.indexOf(currentStage);

  return (
    <div className="stage-bar">
      {STAGE_ORDER.map((stage, i) => {
        const progress = stageProgress[stage];
        const isActive = progress === "active" || progress === "complete";
        const isCompleted = progress === "complete";

        return (
          <div key={stage} className="stage-item-row" style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {i > 0 && (
              <span className="stage-arrow" style={{ color: isActive ? "#1677ff" : "#e8e8e8" }}>
                ▸
              </span>
            )}
            <div
              className={`stage-item ${progress === "active" ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              style={{
                opacity: currentIdx >= i ? 1 : 0.4,
              }}
            >
              <span className="stage-dot" />
              <span className="stage-item-label">{STAGE_LABELS[stage]}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
