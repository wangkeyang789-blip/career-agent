export interface StageData {
  profile?: Record<string, string | string[]>;
  exploration?: Record<string, unknown>;
  jobMatch?: Record<string, unknown>;
  materials?: Record<string, unknown>;
  interview?: Record<string, unknown>;
  review?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface StageComplete {
  next_stage: string;
  summary?: string;
}

export interface MemoryItem {
  id: string;
  type: "fact" | "preference" | "emotion" | "experience" | "goal";
  content: string;
  timestamp: number;
  sourceStage: string;
  importance: number; // 1-5
}

export interface ResumeVersion {
  id: string;
  version: number;
  content: string;
  suggestions: string;
  date: string;
}

/**
 * Parse structured data markers from AI response.
 * Supports:
 *   %%%STAGE_DATA{...json...}%%%
 *   %%%STAGE_COMPLETE{...json...}%%%
 */
export function parseMarkers(text: string): {
  cleanText: string;
  data: StageData | null;
  complete: StageComplete | null;
} {
  let cleanText = text;
  let data: StageData | null = null;
  let complete: StageComplete | null = null;

  // Parse STAGE_DATA
  const dataMatch = cleanText.match(/%%%STAGE_DATA\s*([\s\S]*?)%%%/);
  if (dataMatch) {
    try {
      data = JSON.parse(dataMatch[1].trim());
    } catch {
      // If JSON is invalid, ignore the data marker
    }
    cleanText = cleanText.replace(dataMatch[0], "").trim();
  }

  // Parse STAGE_COMPLETE
  const completeMatch = cleanText.match(/%%%STAGE_COMPLETE\s*([\s\S]*?)%%%/);
  if (completeMatch) {
    try {
      complete = JSON.parse(completeMatch[1].trim());
    } catch {
      // If JSON is invalid, ignore the marker
    }
    cleanText = cleanText.replace(completeMatch[0], "").trim();
  }

  return { cleanText, data, complete };
}

/**
 * Truncate conversation history for token management.
 * Keeps the most recent N messages, plus a system summary of older ones.
 */
/**
 * Parse MEMORY markers from AI response.
 *   %%%MEMORY{...json...}%%%
 */
export function parseMemoryMarker(text: string): {
  cleanText: string;
  memories: MemoryItem[];
} {
  let cleanText = text;
  const memories: MemoryItem[] = [];

  const regex = /%%%MEMORY\s*([\s\S]*?)%%%/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      const data = JSON.parse(match[1].trim());
      if (Array.isArray(data.memories)) {
        for (const m of data.memories) {
          memories.push({
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            type: m.type || "fact",
            content: m.content || "",
            timestamp: Date.now(),
            sourceStage: m.sourceStage || "unknown",
            importance: m.importance || 1,
          });
        }
      }
    } catch {
      // ignore invalid JSON
    }
    cleanText = cleanText.replace(match[0], "").trim();
  }

  return { cleanText, memories };
}

export function truncateHistory(
  messages: { role: string; content: string }[],
  maxCount: number = 20
): { role: string; content: string }[] {
  if (messages.length <= maxCount) return messages;

  const oldest = messages.slice(0, messages.length - maxCount);
  const recent = messages.slice(messages.length - maxCount);

  const summary = oldest
    .filter((m) => m.role === "assistant")
    .map((m) => m.content.substring(0, 100))
    .join("\n");

  return [
    { role: "system", content: `[Earlier conversation summary:\n${summary.substring(0, 500)}\n]` },
    ...recent,
  ];
}

export const STAGE_LABELS: Record<string, string> = {
  connect: "建立连接",
  explore: "方向探索",
  match: "岗位匹配",
  prepare: "材料准备",
  interview: "面试备战",
  review: "复盘进化",
};

export const STAGE_ORDER = ["connect", "explore", "match", "prepare", "interview", "review"] as const;
export type Stage = (typeof STAGE_ORDER)[number];

export function isStage(s: string): s is Stage {
  return STAGE_ORDER.includes(s as Stage);
}
