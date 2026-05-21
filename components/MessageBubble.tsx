"use client";

interface MessageBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function MessageBubble({ role, content }: MessageBubbleProps) {
  if (role === "system") {
    return <div className="stage-toast">{content}</div>;
  }

  const isAI = role === "assistant";

  return (
    <div className={`message ${isAI ? "ai" : "user"}`}>
      <div className={`message-avatar ${isAI ? "ai" : "user"}`}>
        {isAI ? "🤖" : "👤"}
      </div>
      <div className="message-content">
        <FormattedText text={content} />
      </div>
    </div>
  );
}

function FormattedText({ text }: { text: string }) {
  // Split by double newlines for paragraphs
  const paragraphs = text.split(/\n\n+/).filter(Boolean);

  return (
    <>
      {paragraphs.map((para, i) => {
        // Check if it's a list
        if (para.match(/^[\d]+\.\s/m) || para.match(/^[-*]\s/m)) {
          return <ListBlock key={i} text={para} />;
        }
        // Check if it's a bold header (starts with **text**)
        if (para.startsWith("**") && para.includes("**")) {
          return (
            <p key={i}>
              <strong>{para}</strong>
            </p>
          );
        }
        return <p key={i}>{para}</p>;
      })}
    </>
  );
}

function ListBlock({ text }: { text: string }) {
  const lines = text.split("\n").filter(Boolean);
  const ordered = lines[0]?.match(/^\d+\.\s/);

  if (ordered) {
    return (
      <ol>
        {lines.map((line, i) => (
          <li key={i}>{line.replace(/^\d+\.\s*/, "")}</li>
        ))}
      </ol>
    );
  }

  return (
    <ul>
      {lines.map((line, i) => (
        <li key={i}>{line.replace(/^[-*]\s*/, "")}</li>
      ))}
    </ul>
  );
}
