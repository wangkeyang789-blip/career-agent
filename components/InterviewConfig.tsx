"use client";

import { useState } from "react";

interface InterviewConfigProps {
  type: "individual" | "group" | "case" | "technical";
  style: "gentle" | "stress";
  onTypeChange: (type: "individual" | "group" | "case" | "technical") => void;
  onStyleChange: (style: "gentle" | "stress") => void;
  onStart: () => void;
}

const TYPE_OPTIONS = [
  { value: "individual" as const, label: "单面", desc: "一对一面试" },
  { value: "group" as const, label: "群面", desc: "无领导小组讨论" },
  { value: "case" as const, label: "Case", desc: "案例分析面试" },
  { value: "technical" as const, label: "技术面", desc: "技术问题与编程" },
];

const STYLE_OPTIONS = [
  { value: "gentle" as const, label: "温和", desc: "鼓励型，多给提示" },
  { value: "stress" as const, label: "压力面", desc: "挑战型，追问细节" },
];

export default function InterviewConfig({
  type,
  style,
  onTypeChange,
  onStyleChange,
  onStart,
}: InterviewConfigProps) {
  return (
    <div
      style={{
        padding: "16px 24px",
        borderBottom: "1px solid #f0f0f0",
        background: "#fafafa",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
        🎯 模拟面试设置
      </div>

      {/* Type selection */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>面试类型</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onTypeChange(opt.value)}
              title={opt.desc}
              style={{
                padding: "6px 14px",
                borderRadius: 16,
                border: type === opt.value ? "1px solid #1677ff" : "1px solid #d9d9d9",
                background: type === opt.value ? "#e6f4ff" : "#fff",
                color: type === opt.value ? "#1677ff" : "#666",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style selection */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>面试风格</div>
        <div style={{ display: "flex", gap: 6 }}>
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStyleChange(opt.value)}
              title={opt.desc}
              style={{
                padding: "6px 14px",
                borderRadius: 16,
                border: style === opt.value ? "1px solid #1677ff" : "1px solid #d9d9d9",
                background: style === opt.value ? "#e6f4ff" : "#fff",
                color: style === opt.value ? "#1677ff" : "#666",
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        style={{
          width: "100%",
          padding: "10px",
          background: "linear-gradient(135deg, #1677ff, #0958d9)",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.3s",
        }}
      >
        开始模拟面试
      </button>
    </div>
  );
}
