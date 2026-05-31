"use client";

import { useState } from "react";
import ChatView from "@/components/ChatView";
import SidePanel from "@/components/SidePanel";
import InterviewConfig from "@/components/InterviewConfig";
import { useCareerStore } from "@/stores/careerStore";

export default function Home() {
  const currentStage = useCareerStore((s) => s.currentStage);
  const interviewConfig = useCareerStore((s) => s.interview);
  const setStage = useCareerStore((s) => s.setStage);
  const addMessage = useCareerStore((s) => s.addMessage);
  const sendMessage = useCareerStore((s) => s.sendMessage);
  const clearChat = useCareerStore((s) => s.clearChat);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleInterviewTypeChange = (type: "individual" | "group" | "case" | "technical") => {
    useCareerStore.setState((s) => ({
      interview: { ...s.interview, type },
    }));
  };

  const handleInterviewStyleChange = (style: "gentle" | "stress") => {
    useCareerStore.setState((s) => ({
      interview: { ...s.interview, style },
    }));
  };

  const handleStartInterview = () => {
    if (currentStage !== "interview") {
      setStage("interview");
    }
    const typeLabel =
      { individual: "单面", group: "群面", case: "Case", technical: "技术面" }[interviewConfig.type] ||
      "单面";
    const styleLabel = interviewConfig.style === "gentle" ? "温和" : "压力";
    addMessage(
      "system",
      `开始模拟面试：${typeLabel}（${styleLabel}风格）`
    );
    // Send initial interview message
    setTimeout(() => {
      sendMessage(`开始模拟面试，类型：${typeLabel}，风格：${styleLabel}`);
    }, 100);
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header" style={{ position: "relative" }}>
        <h1>AI Career Agent</h1>
        <p>你的求职伙伴与职业向导</p>

        <div className="header-actions" style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setSidebarOpen(true)}
            title="求职工作台"
            style={{
              background: "none",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              cursor: "pointer",
              color: "#666",
            }}
          >
            ☰ 工作台
          </button>
          <button
            onClick={clearChat}
            title="重新开始"
            style={{
              background: "none",
              border: "1px solid #d9d9d9",
              borderRadius: 6,
              padding: "4px 10px",
              fontSize: 12,
              cursor: "pointer",
              color: "#666",
            }}
          >
            ↺ 重置
          </button>
        </div>
      </div>

      {/* Interview config (only show in interview stage) */}
      {currentStage === "interview" && (
        <InterviewConfig
          type={interviewConfig.type}
          style={interviewConfig.style}
          onTypeChange={handleInterviewTypeChange}
          onStyleChange={handleInterviewStyleChange}
          onStart={handleStartInterview}
        />
      )}

      {/* Chat area */}
      <ChatView />

      {/* Side panel */}
      <SidePanel open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
