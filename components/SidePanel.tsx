"use client";

import { useState } from "react";
import { useCareerStore } from "@/stores/careerStore";
import type { Application as AppType } from "@/stores/careerStore";
import { STAGE_ORDER, STAGE_LABELS } from "@/lib/utils";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SidePanel({ open, onClose }: SidePanelProps) {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      {open && (
        <div className="sidebar-panel">
          <div className="sidebar-header">
            <h3>求职工作台</h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "#666",
                padding: "4px 8px",
              }}
            >
              ✕
            </button>
          </div>
          <div className="sidebar-body">
            <ProgressSection />
            <DirectionSection />
            <ResumeSection />
            <InterviewReviewSection />
            <ApplicationSection />
            <MoodSection />
            <DataSection />
          </div>
        </div>
      )}
    </>
  );
}

/* ===== 求职进度 ===== */
function ProgressSection() {
  const stageProgress = useCareerStore((s) => s.stageProgress);

  const completedCount = STAGE_ORDER.filter((s) => stageProgress[s] === "complete").length;
  const activeCount = STAGE_ORDER.filter((s) => stageProgress[s] === "active").length;
  const total = STAGE_ORDER.length;

  return (
    <div className="sidebar-section">
      <h4>📊 求职进度</h4>
      <div style={{ marginBottom: 12 }}>
        <div
          style={{
            height: 8,
            borderRadius: 4,
            background: "#f0f0f0",
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(completedCount / total) * 100}%`,
              background: "linear-gradient(90deg, #52c41a, #1677ff)",
              borderRadius: 4,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 12, color: "#888" }}>
          {completedCount}/{total} 阶段完成
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {STAGE_ORDER.map((stage) => {
          const progress = stageProgress[stage];
          const isComplete = progress === "complete";
          const isActive = progress === "active";

          return (
            <div
              key={stage}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: isComplete ? "#52c41a" : isActive ? "#1677ff" : "#bbb",
              }}
            >
              <span>{isComplete ? "✅" : isActive ? "🔄" : "⏳"}</span>
              <span>{STAGE_LABELS[stage]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ===== 意向岗位 ===== */
function DirectionSection() {
  const exploration = useCareerStore((s) => s.exploration);
  const jobMatch = useCareerStore((s) => s.jobMatch);

  const hasDirections = exploration.directions && exploration.directions.length > 0;
  const hasJobMatch = jobMatch.targetPosition || jobMatch.jdText;

  if (!hasDirections && !hasJobMatch) {
    return (
      <div className="sidebar-section">
        <h4>🎯 意向岗位</h4>
        <div className="empty-state">在对话中探索方向后自动展示</div>
      </div>
    );
  }

  return (
    <div className="sidebar-section">
      <h4>🎯 意向岗位</h4>
      {hasDirections && (
        <div style={{ marginBottom: 8 }}>
          {exploration.directions.map((dir, i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: i === exploration.selectedDirection ? "#e6f4ff" : "#fafafa",
                border: i === exploration.selectedDirection ? "1px solid #91caff" : "1px solid #f0f0f0",
                marginBottom: 6,
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4 }}>{dir.title}</div>
              <div style={{ color: "#666", fontSize: 12 }}>{dir.matchReason}</div>
            </div>
          ))}
        </div>
      )}
      {hasJobMatch && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: "#fff7e6",
            border: "1px solid #ffd591",
            fontSize: 13,
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{jobMatch.targetPosition}</div>
          {jobMatch.gapAnalysis && (
            <div style={{ color: "#666", fontSize: 12 }}>{jobMatch.gapAnalysis}</div>
          )}
        </div>
      )}
    </div>
  );
}

/* ===== 简历迭代记录 ===== */
function ResumeSection() {
  const resumeHistory = useCareerStore((s) => s.resumeHistory);

  return (
    <div className="sidebar-section">
      <h4>📝 简历迭代记录</h4>
      {resumeHistory.length === 0 ? (
        <div className="empty-state">
          上传简历后，AI 会给出修改建议
          <div style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>
            每次修改建议会自动保存为版本记录
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...resumeHistory].reverse().map((v) => (
            <div
              key={v.id}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "#fafafa",
                border: "1px solid #f0f0f0",
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4, color: "#1677ff" }}>
                v{v.version}
              </div>
              <div style={{ color: "#888", fontSize: 11, marginBottom: 4 }}>
                {v.date}
              </div>
              <div style={{ color: "#666", fontSize: 12, whiteSpace: "pre-wrap" }}>
                {v.suggestions.length > 100 ? v.suggestions.slice(0, 100) + "…" : v.suggestions}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== 模拟面试记录 ===== */
function InterviewReviewSection() {
  const interview = useCareerStore((s) => s.interview);
  const review = useCareerStore((s) => s.review);

  const typeLabel: Record<string, string> = {
    individual: "单面",
    group: "群面",
    case: "Case",
    technical: "技术面",
  };

  return (
    <div className="sidebar-section">
      <h4>🎤 模拟面试记录</h4>
      {interview.history.length === 0 && !review.analysis ? (
        <div className="empty-state">进行模拟面试后，记录和复盘建议会展示在这里</div>
      ) : (
        <>
          {interview.history.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>面试记录</div>
              {interview.history.map((round, i) => (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: "#fafafa",
                    border: "1px solid #f0f0f0",
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    第 {round.round} 轮 · {typeLabel[round.type] || round.type}
                  </div>
                  <div style={{ color: "#666", fontSize: 12, whiteSpace: "pre-wrap" }}>
                    {round.feedback.length > 120
                      ? round.feedback.slice(0, 120) + "…"
                      : round.feedback}
                  </div>
                </div>
              ))}
            </div>
          )}
          {review.analysis && (
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "#f6ffed",
                border: "1px solid #b7eb8f",
                fontSize: 13,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 4, color: "#52c41a" }}>
                复盘总结
              </div>
              <div style={{ color: "#666", fontSize: 12 }}>{review.analysis}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ===== 投递追踪 ===== */
function ApplicationSection() {
  const applications = useCareerStore((s) => s.applications);
  const addApplication = useCareerStore((s) => s.addApplication);
  const updateApplication = useCareerStore((s) => s.updateApplication);
  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");

  const handleAdd = () => {
    if (!company.trim() || !position.trim()) return;
    addApplication({
      id: generateId(),
      company: company.trim(),
      position: position.trim(),
      status: "preparing",
      date: new Date().toISOString().slice(0, 10),
    });
    setCompany("");
    setPosition("");
    setShowForm(false);
  };

  const statusLabels: Record<string, string> = {
    preparing: "准备中",
    submitted: "已投递",
    interview: "面试中",
    offer: "Offer",
    rejected: "未通过",
  };

  const statusColors: Record<string, string> = {
    preparing: "#d9d9d9",
    submitted: "#1677ff",
    interview: "#faad14",
    offer: "#52c41a",
    rejected: "#ff4d4f",
  };

  const nextStatus: Record<string, string> = {
    preparing: "submitted",
    submitted: "interview",
    interview: "offer",
    offer: "rejected",
    rejected: "preparing",
  };

  return (
    <div className="sidebar-section">
      <h4>📋 投递追踪</h4>
      {applications.length === 0 && !showForm && (
        <div className="empty-state">暂无投递记录</div>
      )}

      {/* Timeline view */}
      {applications.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          {applications.map((app, i) => (
            <div
              key={app.id}
              style={{
                display: "flex",
                gap: 12,
                marginBottom: 12,
                position: "relative",
              }}
            >
              {/* Timeline line */}
              {i < applications.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: 8,
                    top: 24,
                    bottom: -12,
                    width: 2,
                    background: "#f0f0f0",
                  }}
                />
              )}
              {/* Dot */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  border: `3px solid ${statusColors[app.status]}`,
                  background: "#fff",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              />
              {/* Content */}
              <div style={{ flex: 1, fontSize: 13 }}>
                <div style={{ fontWeight: 600 }}>{app.company}</div>
                <div style={{ color: "#666", marginBottom: 4 }}>{app.position}</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      background:
                        app.status === "offer"
                          ? "#f6ffed"
                          : app.status === "rejected"
                          ? "#fff2f0"
                          : app.status === "interview"
                          ? "#fffbe6"
                          : app.status === "submitted"
                          ? "#e6f4ff"
                          : "#fafafa",
                      color: statusColors[app.status],
                    }}
                  >
                    {statusLabels[app.status]}
                  </span>
                  <span style={{ fontSize: 11, color: "#bbb" }}>{app.date}</span>
                </div>
                <button
                  onClick={() =>
                    updateApplication(app.id, { status: nextStatus[app.status] as AppType["status"] })
                  }
                  style={{
                    marginTop: 4,
                    background: "none",
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                    padding: "2px 8px",
                    fontSize: 11,
                    cursor: "pointer",
                    color: "#666",
                  }}
                >
                  推进
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            placeholder="公司名称"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              fontSize: 13,
              outline: "none",
            }}
          />
          <input
            placeholder="岗位名称"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            style={{
              padding: "8px 12px",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              fontSize: 13,
              outline: "none",
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleAdd}
              style={{
                flex: 1,
                padding: "6px 12px",
                background: "#1677ff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              保存
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                padding: "6px 12px",
                background: "none",
                border: "1px solid #d9d9d9",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
                color: "#666",
              }}
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: "100%",
            marginTop: 8,
            padding: "8px",
            background: "none",
            border: "1px dashed #d9d9d9",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            color: "#888",
          }}
        >
          + 添加投递
        </button>
      )}
    </div>
  );
}

/* ===== 心情记录 ===== */
function MoodSection() {
  const moodEntries = useCareerStore((s) => s.moodEntries);
  const addMoodEntry = useCareerStore((s) => s.addMoodEntry);
  const [showMood, setShowMood] = useState(false);
  const [selectedMood, setSelectedMood] = useState(3);

  const today = new Date().toISOString().slice(0, 10);
  const todayEntry = moodEntries.find((e) => e.date === today);

  const handleMoodSave = () => {
    addMoodEntry({ date: today, mood: selectedMood });
    setShowMood(false);
  };

  const moodEmojis = ["😢", "😟", "😐", "🙂", "😄"];
  const moodLabels = ["很差", "不太好", "一般", "不错", "很棒"];

  const recentMoods = moodEntries.slice(-7);

  return (
    <div className="sidebar-section">
      <h4>💭 心情记录</h4>
      {todayEntry ? (
        <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
          今天的心情：{moodEmojis[todayEntry.mood - 1]} {moodLabels[todayEntry.mood - 1]}
        </div>
      ) : showMood ? (
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              marginBottom: 8,
            }}
          >
            {moodEmojis.map((emoji, i) => (
              <button
                key={i}
                onClick={() => setSelectedMood(i + 1)}
                style={{
                  fontSize: 24,
                  padding: "4px 8px",
                  background: selectedMood === i + 1 ? "#e6f4ff" : "none",
                  border: selectedMood === i + 1 ? "2px solid #1677ff" : "2px solid transparent",
                  borderRadius: 8,
                  cursor: "pointer",
                  opacity: selectedMood === i + 1 ? 1 : 0.5,
                  transition: "all 0.2s",
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
          <button
            onClick={handleMoodSave}
            style={{
              width: "100%",
              padding: "6px",
              background: "#1677ff",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            记录
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowMood(true)}
          style={{
            width: "100%",
            marginBottom: 8,
            padding: "8px",
            background: "none",
            border: "1px dashed #d9d9d9",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            color: "#888",
          }}
        >
          📝 记录今天的心情
        </button>
      )}
      {recentMoods.length > 0 && (
        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
          {recentMoods.map((entry, i) => (
            <div
              key={i}
              title={`${entry.date}: ${moodLabels[entry.mood - 1]}`}
              style={{
                fontSize: 16,
                opacity: 0.6 + entry.mood * 0.1,
              }}
            >
              {moodEmojis[entry.mood - 1]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== 数据管理 ===== */
function DataSection() {
  const exportData = useCareerStore((s) => s.exportData);
  const importData = useCareerStore((s) => s.importData);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-agent-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    importData(importText);
    setShowImport(false);
    setImportText("");
  };

  return (
    <div className="sidebar-section">
      <h4>⚙️ 数据管理</h4>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handleExport}
          style={{
            flex: 1,
            padding: "8px",
            background: "#1677ff",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          导出数据
        </button>
        <button
          onClick={() => setShowImport(!showImport)}
          style={{
            flex: 1,
            padding: "8px",
            background: "none",
            border: "1px solid #d9d9d9",
            borderRadius: 6,
            fontSize: 13,
            cursor: "pointer",
            color: "#666",
          }}
        >
          导入数据
        </button>
      </div>
      {showImport && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
          <textarea
            placeholder="粘贴之前导出的 JSON 数据..."
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={4}
            style={{
              padding: 8,
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              fontSize: 12,
              outline: "none",
              fontFamily: "monospace",
              resize: "vertical",
            }}
          />
          <button
            onClick={handleImport}
            style={{
              padding: "6px",
              background: "#52c41a",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            恢复数据
          </button>
        </div>
      )}
    </div>
  );
}
