"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Stage, STAGE_ORDER, STAGE_LABELS, parseMarkers } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface Profile {
  education?: string;
  major?: string;
  grade?: string;
  cityPreference?: string;
  personality?: string;
  values?: string[];
}

interface CareerDirection {
  title: string;
  matchReason: string;
  pros: string[];
  cons: string[];
}

interface Exploration {
  directions: CareerDirection[];
  selectedDirection: number | null;
}

interface JobMatch {
  targetPosition: string;
  jdText: string;
  gapAnalysis?: string;
}

interface Materials {
  resume?: string;
  coverLetter?: string;
}

interface InterviewRound {
  round: number;
  type: string;
  feedback: string;
}

interface Interview {
  type: "individual" | "group" | "case" | "technical";
  style: "gentle" | "stress";
  history: InterviewRound[];
}

interface Review {
  analysis?: string;
  suggestions: string[];
}

export interface Application {
  id: string;
  company: string;
  position: string;
  status: "preparing" | "submitted" | "interview" | "offer" | "rejected";
  date: string;
  notes?: string;
}

interface MoodEntry {
  date: string;
  mood: number; // 1-5
  note?: string;
}

interface CareerState {
  // Stage
  currentStage: Stage;
  stageProgress: Record<string, "locked" | "active" | "complete">;

  // Conversation
  messages: Message[];
  isWaiting: boolean;
  error: string | null;

  // Stage 1: Profile
  profile: Profile;

  // Stage 2: Exploration
  exploration: Exploration;

  // Stage 3: Job Match
  jobMatch: JobMatch;

  // Stage 4: Materials
  materials: Materials;

  // Stage 5: Interview
  interview: Interview;

  // Stage 6: Review
  review: Review;

  // Persistent layer
  applications: Application[];
  moodEntries: MoodEntry[];

  // Actions
  addMessage: (role: "user" | "assistant" | "system", content: string) => void;
  sendMessage: (text: string) => Promise<void>;
  uploadResume: (file: File) => Promise<void>;
  setStage: (stage: Stage) => void;
  updateProfile: (data: Partial<Profile>) => void;
  updateExploration: (data: Partial<Exploration>) => void;
  updateJobMatch: (data: Partial<JobMatch>) => void;
  clearError: () => void;
  addApplication: (app: Application) => void;
  updateApplication: (id: string, data: Partial<Application>) => void;
  addMoodEntry: (entry: MoodEntry) => void;
  exportData: () => string;
  importData: (json: string) => void;
  clearChat: () => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

const INITIAL_PROMPT =
  "你好！我是你的 AI 求职助理 🎯\n\n我可以帮你完成求职全流程：从探索职业方向、匹配岗位、准备简历和求职信，到模拟面试和面试复盘。\n\n你可以直接上传你的简历（PDF），我来帮你自动读取信息；也可以像聊天一样，逐步告诉我你的情况。";

export const useCareerStore = create<CareerState>()(
  persist(
    (set, get) => ({
      currentStage: "connect",
      stageProgress: {
        connect: "active",
        explore: "locked",
        match: "locked",
        prepare: "locked",
        interview: "locked",
        review: "locked",
      },
      messages: [
        {
          id: generateId(),
          role: "assistant",
          content: INITIAL_PROMPT,
          timestamp: Date.now(),
        },
      ],
      isWaiting: false,
      error: null,

      profile: {},
      exploration: { directions: [], selectedDirection: null },
      jobMatch: { targetPosition: "", jdText: "" },
      materials: {},
      interview: { type: "individual", style: "gentle", history: [] },
      review: { suggestions: [] },
      applications: [],
      moodEntries: [],

      addMessage: (role, content) => {
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: generateId(),
              role,
              content,
              timestamp: Date.now(),
            },
          ],
        }));
      },

      sendMessage: async (text) => {
        const state = get();
        if (!text.trim() || state.isWaiting) return;

        // Add user message
        set((s) => ({
          messages: [
            ...s.messages,
            { id: generateId(), role: "user" as const, content: text, timestamp: Date.now() },
          ],
          isWaiting: true,
          error: null,
        }));

        try {
          const currentState = get();

          // Build state context
          const stateContext = {
            profile: currentState.profile,
            exploration: currentState.exploration,
            jobMatch: currentState.jobMatch,
          };

          const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              stage: currentState.currentStage,
              messages: currentState.messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              state: stateContext,
              userMessage: text,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `请求失败 (${response.status})`);
          }

          const data = await response.json();
          const aiText = data.content || "";

          // Parse markers
          const { cleanText, data: stageData, complete } = parseMarkers(aiText);

          // Add AI response
          const store = get();
          store.addMessage("assistant", cleanText || "(AI 正在思考...)");

          // Update state from STAGE_DATA
          if (stageData) {
            if (stageData.profile) {
              set((s) => ({ profile: { ...s.profile, ...(stageData.profile as Profile) } }));
            }
            if (stageData.exploration) {
              set((s) => ({
                exploration: { ...s.exploration, ...(stageData.exploration as unknown as Exploration) },
              }));
            }
            if (stageData.jobMatch) {
              set((s) => ({
                jobMatch: { ...s.jobMatch, ...(stageData.jobMatch as unknown as JobMatch) },
              }));
            }
          }

          // Handle STAGE_COMPLETE
          if (complete) {
            const nextStage = complete.next_stage;
            if (isValidStage(nextStage)) {
              set((s) => ({
                currentStage: nextStage as Stage,
                stageProgress: {
                  ...s.stageProgress,
                  [s.currentStage]: "complete",
                  [nextStage]: "active",
                },
              }));

              // Add transition toast
              const label = STAGE_LABELS[nextStage] || nextStage;
              get().addMessage(
                "system",
                `进入下一阶段：${label}`
              );
            }
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : "网络连接失败，请检查网络后重试";
          set({ error: message });
        } finally {
          set({ isWaiting: false });
        }
      },

      setStage: (stage) => {
        set((state) => {
          const newProgress = { ...state.stageProgress };
          // Unlock stages up to the target
          let reached = false;
          for (const s of STAGE_ORDER) {
            if (reached && newProgress[s] !== "complete") {
              newProgress[s] = "locked";
            }
            if (s === stage) {
              newProgress[s] = "active";
              reached = true;
            }
          }
          return { currentStage: stage, stageProgress: newProgress };
        });
      },

      uploadResume: async (file: File) => {
        const state = get();
        if (state.isWaiting) return;

        // Validate file type
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
          set({ error: "请上传 PDF 格式的简历文件" });
          return;
        }

        get().addMessage("system", "已收到你的简历，正在读取信息...");

        try {
          const { extractTextFromPDF } = await import("@/lib/pdf");
          const resumeText = await extractTextFromPDF(file);

          if (!resumeText.trim()) {
            set({ error: "无法读取简历内容，请确认文件不是扫描件或图片" });
            return;
          }

          await get().sendMessage(
            `这是我的简历，请帮我提取相关信息：\n\n${resumeText}`
          );
        } catch {
          set({ error: "简历解析失败，请确认文件是有效的 PDF 格式" });
        }
      },

      updateProfile: (data) => set((s) => ({ profile: { ...s.profile, ...data } })),
      updateExploration: (data) => set((s) => ({ exploration: { ...s.exploration, ...data } })),
      updateJobMatch: (data) => set((s) => ({ jobMatch: { ...s.jobMatch, ...data } })),

      clearError: () => set({ error: null }),

      addApplication: (app) => set((s) => ({ applications: [...s.applications, app] })),
      updateApplication: (id, data) =>
        set((s) => ({
          applications: s.applications.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),
      addMoodEntry: (entry) =>
        set((s) => ({
          moodEntries: [...s.moodEntries, entry].slice(-100),
        })),

      exportData: () => {
        const state = get();
        return JSON.stringify({
          profile: state.profile,
          exploration: state.exploration,
          jobMatch: state.jobMatch,
          materials: state.materials,
          applications: state.applications,
          moodEntries: state.moodEntries,
          stageProgress: state.stageProgress,
          currentStage: state.currentStage,
        });
      },

      importData: (json) => {
        try {
          const data = JSON.parse(json);
          set((s) => ({
            ...s,
            ...data,
            messages: s.messages, // Keep current messages
            isWaiting: false,
            error: null,
          }));
        } catch {
          // Invalid data, ignore
        }
      },

      clearChat: () => {
        set((s) => ({
          messages: [
            {
              id: generateId(),
              role: "assistant",
              content: INITIAL_PROMPT,
              timestamp: Date.now(),
            },
          ],
          currentStage: "connect",
          stageProgress: {
            connect: "active",
            explore: "locked",
            match: "locked",
            prepare: "locked",
            interview: "locked",
            review: "locked",
          },
          profile: {},
          exploration: { directions: [], selectedDirection: null },
          jobMatch: { targetPosition: "", jdText: "" },
          materials: {},
          interview: { type: "individual" as const, style: "gentle" as const, history: [] },
          review: { suggestions: [] },
          error: null,
          isWaiting: false,
        }));
      },
    }),
    {
      name: "career-agent-storage",
      partialize: (state) => ({
        profile: state.profile,
        exploration: state.exploration,
        jobMatch: state.jobMatch,
        materials: state.materials,
        applications: state.applications,
        moodEntries: state.moodEntries,
        stageProgress: state.stageProgress,
        currentStage: state.currentStage,
        messages: state.messages.slice(-50), // Keep last 50 messages
      }),
    }
  )
);

function isValidStage(s: string): boolean {
  return STAGE_ORDER.includes(s as Stage);
}
