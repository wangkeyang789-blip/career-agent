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
            <ProfileSection />
            <ProgressSection />
            <ApplicationSection />
            <InterviewSection />
            <MoodSection />
            <DataSection />
          </div>
        </div>
      )}
    </>
  );
}

function ProfileSection() {
  const profile = useCareerStore((s) => s.profile);
  const hasData = Object.keys(profile).length > 0;

  return (
    <div className="sidebar-section">
      <h4>👤 个人档案</h4>
      {!hasData ? (
        <div className="empty-state">开始对话后自动收集</div>
      ) : (
        <div style={{ fontSize: 13, lineHeight: 1.8 }}>
          {profile.education && (
            <div>
              <span style={{ color: "#888" }}>学历：</span>
              {profile.education}
            </div>
          )}
          {profile.major && (
            <div>
              <span style={{ color: "#888" }}>专业：</span>
              {profile.major}
            </div>
          )}
          {profile.grade && (
            <div>
              <span style={{ color: "#888" }}>年级：</span>
              {profile.grade}
            </div>
          )}
          {profile.cityPreference && (
            <div>
              <span style={{ color: "#888" }}>目标城市：</span>
              {profile.cityPreference}
            </div>
          )}
          {profile.personality && (
            <div>
              <span style={{ color: "#888" }}>性格特点：</span>
              {profile.personality}
            </div>
          )}
          {profile.values && profile.values.length > 0 && (
            <div>
              <span style={{ color: "#888" }}>职业价值观：</span>
              {profile.values.join("、")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
              width: `${((completedCount + (activeCount > 0 ? 0 : 0)) / total) * 100}%`,
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
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {applications.map((app) => (
          <div
            key={app.id}
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              background: "#fafafa",
              border: "1px solid #f0f0f0",
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{app.company}</div>
            <div style={{ color: "#666", marginBottom: 6 }}>{app.position}</div>
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
                      : "#e6f4ff",
                  color:
                    app.status === "offer"
                      ? "#52c41a"
                      : app.status === "rejected"
                      ? "#ff4d4f"
                      : "#1677ff",
                }}
              >
                {statusLabels[app.status]}
              </span>
              <button
                onClick={() =>
                  updateApplication(app.id, { status: nextStatus[app.status] as AppType["status"] })
                }
                style={{
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

function InterviewSection() {
  const interview = useCareerStore((s) => s.interview);
  const currentStage = useCareerStore((s) => s.currentStage);
  const sendMessage = useCareerStore((s) => s.sendMessage);
  const addMessage = useCareerStore((s) => s.addMessage);

  const typeLabel: Record<string, string> = {
    individual: "单面",
    group: "群面",
    case: "Case",
    technical: "技术面",
  };
  const styleLabel: Record<string, string> = {
    gentle: "温和",
    stress: "压力",
  };

  const handleStart = () => {
    addMessage(
      "system",
      `开始模拟面试：${typeLabel[interview.type]}（${styleLabel[interview.style]}风格）`
    );
    setTimeout(() => {
      sendMessage(`开始模拟面试，类型：${typeLabel[interview.type]}，风格：${styleLabel[interview.style]}`);
    }, 100);
  };

  return (
    <div className="sidebar-section">
      <h4>🎯 模拟面试</h4>
      <div style={{ fontSize: 13, marginBottom: 8 }}>
        <div style={{ color: "#888", marginBottom: 4 }}>
          类型：{typeLabel[interview.type]}
        </div>
        <div style={{ color: "#888", marginBottom: 8 }}>
          风格：{styleLabel[interview.style]}
        </div>
        {currentStage !== "interview" && (
          <div style={{ fontSize: 12, color: "#faad14", marginBottom: 8 }}>
            💡 先完成前序阶段再开始面试
          </div>
        )}
      </div>
      <button
        onClick={handleStart}
        disabled={currentStage !== "interview"}
        style={{
          width: "100%",
          padding: "8px",
          background: currentStage === "interview" ? "#1677ff" : "#d9d9d9",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          fontSize: 13,
          cursor: currentStage === "interview" ? "pointer" : "not-allowed",
        }}
      >
        {currentStage === "interview" ? "开始面试" : "未到面试阶段"}
      </button>
    </div>
  );
}

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
