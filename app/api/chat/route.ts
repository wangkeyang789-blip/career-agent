import { NextRequest, NextResponse } from "next/server";
import { loadPrompt } from "@/lib/prompts";
import { getKnowledgeProvider } from "@/lib/knowledge";

interface MemoryItem {
  id: string;
  type: "fact" | "preference" | "emotion" | "experience" | "goal";
  content: string;
  timestamp: number;
  sourceStage: string;
  importance: number;
}

// Provider configurations
interface ProviderConfig {
  apiUrl: string;
  model: string;
  headers: (apiKey: string) => Record<string, string>;
  buildBody: (systemPrompt: string, messages: { role: string; content: string }[], model: string) => unknown;
  extractContent: (data: unknown) => string;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  anthropic: {
    apiUrl: "https://api.anthropic.com/v1/messages",
    model: "claude-sonnet-4-20250514",
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }),
    buildBody: (systemPrompt, messages, model) => ({
      model,
      system: systemPrompt,
      messages: messages.filter((m) => m.role !== "system"),
      max_tokens: 4096,
    }),
    extractContent: (data: unknown) => {
      const d = data as { content?: { text?: string }[] };
      return d.content?.[0]?.text || "";
    },
  },
  openai: {
    apiUrl: process.env.OPENAI_API_BASE || "https://api.deepseek.com/v1",
    model: process.env.OPENAI_MODEL || "deepseek-chat",
    headers: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: (systemPrompt, messages, model) => ({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.filter((m) => m.role !== "system"),
      ],
      max_tokens: 4096,
      stream: false,
    }),
    extractContent: (data: unknown) => {
      const d = data as { choices?: { message?: { content?: string } }[] };
      return d.choices?.[0]?.message?.content || "";
    },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { stage, mode, messages: rawMessages, state, memory, userMessage } = body;

    // Validate
    if (!stage && !mode) {
      return NextResponse.json({ error: "Missing stage/mode parameter" }, { status: 400 });
    }
    if (!userMessage && (!rawMessages || rawMessages.length === 0)) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Determine provider
    const providerName = process.env.NEXT_PUBLIC_AI_PROVIDER || "anthropic";
    const provider = PROVIDERS[providerName];

    if (!provider) {
      return NextResponse.json(
        { error: `Unknown AI provider: ${providerName}. Supported: anthropic, openai` },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          content:
            "⚠️ **AI 服务未配置**\n\n请设置 API 密钥：\n1. 在项目根目录创建 `.env.local` 文件\n2. 添加 `ANTHROPIC_API_KEY=你的密钥`\n3. 重启开发服务器",
          _fallback: true,
        },
        { status: 200 }
      );
    }

    // --- Build system prompt ---

    const currentMode = mode || "career";
    let systemPrompt = "";

    // Load prompt based on mode
    if (currentMode === "resume-review") {
      // Resume review uses connect prompt + resume evaluation focus
      systemPrompt = loadPrompt("connect") + buildResumeReviewExtension();
    } else if (currentMode === "interview") {
      // Direct interview mode
      systemPrompt = buildInterviewModePrompt();
    } else if (currentMode === "resume-parse") {
      // Silent resume parsing
      systemPrompt = buildResumeParsePrompt();
    } else {
      // Normal career flow
      systemPrompt = loadPrompt(stage || "connect");
    }

    // Append structured state context
    if (state) {
      systemPrompt += `\n\n## 已收集的用户数据\n\`\`\`json\n${JSON.stringify(state, null, 2)}\n\`\`\``;
    }

    // --- Append long-term memory ---
    if (memory && Array.isArray(memory) && memory.length > 0) {
      const importantMemories = memory
        .filter((m: MemoryItem) => m.importance >= 3)
        .slice(0, 10)
        .map((m: MemoryItem) => `[${m.type}] ${m.content} (重要度: ${m.importance}/5)`)
        .join("\n");

      if (importantMemories) {
        systemPrompt += `\n\n## 长期记忆\n以下是你之前了解到的关于用户的重要信息：\n${importantMemories}\n\n注意：这些信息可能已经过时，请以当前对话为准。`;
      }
    }

    // --- Retrieve relevant knowledge ---
    try {
      const provider = getKnowledgeProvider();
      const knowledgeResults = await provider.search(userMessage || "", {
        role: state?.exploration?.directions?.[state?.exploration?.selectedDirection]?.title,
        stage,
        message: userMessage || "",
      });

      if (knowledgeResults.length > 0) {
        const knowledgeText = knowledgeResults
          .map((r) => `[${r.source}] ${r.content}`)
          .join("\n\n---\n\n");
        systemPrompt += `\n\n## 参考知识\n以下是与用户当前问题相关的参考信息，请结合你的专业知识一起回答：\n\n${knowledgeText}\n\n注意：这些是参考信息，不一定完全准确或适用于用户的具体情况，请根据你的判断使用。`;
      }
    } catch {
      // Knowledge retrieval failure shouldn't break the chat
      console.warn("Knowledge retrieval failed, continuing without it");
    }

    // --- Build message list ---
    const messages = rawMessages?.slice(-20) || [];
    if (userMessage) {
      messages.push({ role: "user", content: userMessage });
    }

    // Build API URL
    const apiUrl = providerName === "openai"
      ? `${provider.apiUrl.replace(/\/+$/, "")}/chat/completions`
      : provider.apiUrl;

    // Call AI API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: provider.headers(apiKey),
      body: JSON.stringify(provider.buildBody(systemPrompt, messages, provider.model)),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`AI API error (${response.status}):`, errorText);

      if (response.status === 429) {
        return NextResponse.json(
          { content: "请求过于频繁，请稍等片刻再继续对话 🙏" },
          { status: 200 }
        );
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            content:
              "⚠️ **API 密钥无效**\n\n请检查 `.env.local` 中的 API 密钥是否正确，或密钥是否还有额度。",
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: `AI 服务暂时不可用 (${response.status})` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = provider.extractContent(data);

    if (!content) {
      return NextResponse.json(
        { content: "抱歉，AI 没有返回有效回复，请重试。" },
        { status: 200 }
      );
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}

/* ====== Mode-specific prompt builders ====== */

function buildResumeReviewExtension(): string {
  return `

## 当前模式：简历评估

用户希望你对简历进行专业评估。请：
1. 分析简历的优点和不足
2. 给出具体的修改建议（排版、内容、措辞等）
3. 指出对目标岗位的匹配度
4. 语气鼓励但真诚，不要只说好话

如果用户没有提供目标岗位，主动询问。`;
}

function buildInterviewModePrompt(): string {
  return `你是一位专业的面试官。请根据用户想要面试的岗位，进行模拟面试。

规则：
1. 先确认用户要面试的岗位和方向
2. 一次问一个问题，模拟真实面试节奏
3. 给出面试类型提示（行为面/技术面/案例面等）
4. 用户回答后给出简短反馈（哪里好、哪里可以改进）
5. 语气可以是温和型或压力型，根据用户的准备情况调整
6. 面试结束后提供完整的复盘总结

当然，不要只是冷冰冰地考核。求职面试本身就很紧张，在给出反馈时多一些鼓励和理解。`;
}

function buildResumeParsePrompt(): string {
  return `你是一位专业的简历解析助手。请从以下简历文本中提取结构化信息。

请使用 STAGE_DATA 标记输出提取到的信息，格式如下：

%%%STAGE_DATA
{
  "profile": {
    "education": "学历",
    "major": "专业",
    "grade": "年级",
    "cityPreference": "目标城市",
    "personality": "性格特点（从经历中推断）",
    "values": ["职业价值观"]
  }
}
%%%

然后再给用户一段简洁温暖的总结，告诉他们你读取到了什么信息，还有什么可以补充。

注意：只提取文本中明确包含的信息，不要编造。`;
}
