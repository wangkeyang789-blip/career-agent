"use client";

import { useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  onUpload: (file: File) => Promise<void>;
  disabled: boolean;
}

export default function ChatInput({ onSend, onUpload, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
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
        placeholder="输入你的消息... (Enter 发送, Shift+Enter 换行)"
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
  );
}
