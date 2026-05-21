"use client";

import { useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <div className="chat-input-row">
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
