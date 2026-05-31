"use client";

import { useEffect, useRef } from "react";
import { useCareerStore } from "@/stores/careerStore";
import MessageBubble from "@/components/MessageBubble";
import ChatInput from "@/components/ChatInput";

export default function ChatView() {
  const messages = useCareerStore((s) => s.messages);
  const isWaiting = useCareerStore((s) => s.isWaiting);
  const error = useCareerStore((s) => s.error);
  const sendMessage = useCareerStore((s) => s.sendMessage);
  const uploadResume = useCareerStore((s) => s.uploadResume);
  const clearError = useCareerStore((s) => s.clearError);

  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, isWaiting]);

  const handleSend = (text: string) => {
    sendMessage(text);
  };

  const handleRetry = () => {
    clearError();
    // Re-send the last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      sendMessage(lastUserMsg.content);
    }
  };

  // Empty state: no messages after system welcome
  const isFirstMessage = messages.length <= 1;

  return (
    <>
      <div className="message-list" ref={listRef}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
        ))}

        {/* Typing indicator */}
        {isWaiting && (
          <div className="message ai">
            <div className="message-avatar ai">🤖</div>
            <div className="typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={handleRetry}>重试</button>
          </div>
        )}
      </div>

      {isFirstMessage && !isWaiting && (
        <div style={{ textAlign: "center", padding: "0 24px 16px", fontSize: 13, color: "#bbb" }}>
          开始对话，AI 会逐步了解你的情况
        </div>
      )}

      <div className="chat-input-area">
        <ChatInput onSend={handleSend} onUpload={uploadResume} disabled={isWaiting} />
      </div>
    </>
  );
}
