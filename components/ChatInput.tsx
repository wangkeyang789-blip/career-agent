"use client";

import { useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { useCareerStore } from "@/stores/careerStore";
import type { ActiveMode } from "@/stores/careerStore";

interface ChatInputProps {
  onSend: (text: string) => void;
  onUpload: (file: File) => Promise<void>;
  disabled: boolean;
}

const MODES: { mode: ActiveMode; label: string; icon: string }[] = [
  { mode: "career", label: "求职助手", icon: "💼" },
  { mode: "resume-review", label: "简历评估", icon: "📄" },
  { mode: "interview", label: "模拟面试", icon: "🎯" },
];

export default function ChatInput({ onSend, onUpload, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeMode = useCareerStore((s) => s.activeMode);
  const setActiveMode = useCareerStore((s) => s.setActiveMode);

  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [disabled]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const text = textarea.value.trim();
    if (!text) return;
    onSend(text);
    textarea.value = "";
    textarea.style.height = "auto";
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await onUpload(file);
    e.target.value = "";
  };

  const placeholderText =
    activeMode === "resume-review"
      ? "粘贴你的简历内容，我来帮你评估..."
      : activeMode === "interview"
      ? "输入你要面试的岗位，开始模拟面试..."
      : "输入你的消息... (Enter 发送, Shift+Enter 换行)";

  return (
    <div>
      {/* Mode switcher */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 8,
          justifyContent: "center",
        }}
      >
        {MODES.map((m) => (
          <button
            key={m.mode}
            onClick={() => setActiveMode(m.mode)}
            style={{
              padding: "4px 14px",
              borderRadius: 14,
              border: activeMode === m.mode ? "1px solid #1677ff" : "1px solid #e8e8e8",
              background: activeMode === m.mode ? "#e6f4ff" : "#fff",
              color: activeMode === m.mode ? "#1677ff" : "#888",
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
              fontWeight: activeMode === m.mode ? 600 : 400,
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="chat-input-row">
        <input
          type="file"
          ref={fileInputRef}
          accept=".pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          className="upload-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          aria-label="上传简历"
          title="上传简历 (PDF)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>
        <textarea
          ref={textareaRef}
          placeholder={placeholderText}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          rows={1}
          aria-label="消息输入"
        />
        <button
          className="send-btn"
          onClick={handleSend}
          disabled={disabled}
          aria-label="发送"
        >
          ↑
        </button>
      </div>
    </div>
  );
}
