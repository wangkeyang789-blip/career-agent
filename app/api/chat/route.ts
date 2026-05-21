import { NextRequest, NextResponse } from "next/server";
import { loadPrompt } from "@/lib/prompts";

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
    const { stage, messages: rawMessages, userMessage } = body;

    // Validate
    if (!stage) {
      return NextResponse.json({ error: "Missing stage parameter" }, { status: 400 });
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

    // Load system prompt for this stage
    let systemPrompt = loadPrompt(stage);

    // Append structured state context
    if (body.state) {
      const stateStr = JSON.stringify(body.state, null, 2);
      systemPrompt += `\n\n## 已收集的用户数据\n\`\`\`json\n${stateStr}\n\`\`\``;
    }

    // Build message list
    const messages = rawMessages?.slice(-20) || [];
    if (userMessage) {
      messages.push({ role: "user", content: userMessage });
    }

    // Build API URL (OpenAI-compatible needs /chat/completions suffix)
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
          {
            content: "请求过于频繁，请稍等片刻再继续对话 🙏",
          },
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
