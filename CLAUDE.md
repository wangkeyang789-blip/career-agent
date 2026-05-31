# AI Career Agent - 智能求职陪伴助手

## 项目概述
对话式 AI 求职陪伴助手。不只是求职工具，更是在迷茫期提供陪伴和支持的伙伴。
支持直接简历评估、模拟面试、岗位匹配，以及完整的求职全流程引导。

## 技术栈
- **框架**: Next.js 16 (App Router)
- **UI**: 纯 CSS 自定义样式
- **状态管理**: Zustand + localStorage 持久化
- **AI**: Anthropic Claude API（支持切换 DeepSeek/OpenAI）
- **数据**: Mock JSON data + Claude 知识库（KnowledgeProvider 接口设计，可切换为 Web Search / RAG）
- **部署**: Vercel 免费版

## 项目结构
```
career-agent/
├── app/
│   ├── layout.tsx              # 页面布局
│   ├── page.tsx                # 主页面（聊天为主，无阶段指示器）
│   ├── globals.css             # 全部样式
│   └── api/chat/route.ts       # AI API 代理 + 知识检索 + 记忆注入
├── components/
│   ├── ChatView.tsx            # 对话列表
│   ├── ChatInput.tsx           # 输入框 + 模式切换（求职/简历评估/模拟面试）
│   ├── MessageBubble.tsx       # 消息气泡
│   ├── SidePanel.tsx           # 侧边栏工作台（6个板块）
│   └── InterviewConfig.tsx     # 面试配置器
├── stores/
│   └── careerStore.ts          # 全局状态（含三级记忆、模式切换、简历上传）
├── lib/
│   ├── pdf.ts                  # PDF 文字提取（pdfjs-dist）
│   ├── utils.ts                # 工具函数（标记解析、记忆标记）
│   ├── prompts.ts              # 提示词加载
│   ├── knowledge.ts            # KnowledgeProvider 接口 + Mock 实现
│   └── data/
│       ├── jd.json             # Mock 岗位 JD 数据
│       ├── qa.json             # Mock 面试 QA 数据
│       └── interview.json      # Mock 面试题数据
├── prompts/                    # AI 行为定义
│   ├── 1-connect.md            # 建立连接（含情感陪伴）
│   ├── 2-explore.md            # 方向探索
│   ├── 3-match.md              # 岗位匹配
│   ├── 4-prepare.md            # 材料准备
│   ├── 5-interview.md          # 面试备战
│   └── 6-review.md             # 复盘进化
└── .env.example
```

## 核心设计

### 三级记忆机制
1. **会话消息** — 当前对话上下文（持久化最近 50 条）
2. **结构化数据** — profile / exploration / jobMatch 等（已有）
3. **长期记忆** — memory[] 数组，AI 通过 %%%MEMORY 标记写入

AI 回复中的 `%%%MEMORY{"memories": [...]}%%%` 会被前端解析后存入
memory 数组，按重要性和时效性筛选后注入后续对话。

### 模式切换
用户可随时切换三种模式：
- **求职助手** — 按阶段流程的求职指导
- **简历评估** — 直接评估/修改简历，不受阶段限制
- **模拟面试** — 直接进入面试模拟，不受阶段限制

### KnowledgeProvider 接口
```ts
interface KnowledgeProvider {
  search(query: string, context?: SearchContext): Promise<SearchResult[]>;
}
```
当前实现 MockKnowledgeProvider（本地 JSON 关键词匹配），预留了
WebSearchProvider / VectorSearchProvider 的接口。

### 特殊标记
- `%%%STAGE_DATA{...json...}%%%` — 结构化数据存入状态
- `%%%STAGE_COMPLETE{...json...}%%%` — 触发阶段切换
- `%%%MEMORY{...json...}%%%` — AI 写入长期记忆

## 开发命令
```bash
npm run dev      # 启动开发服务器 (http://localhost:3000)
npm run build    # 生产构建
npm run start    # 启动生产服务器
```

## 环境变量
创建 `.env.local` 文件：
```
ANTHROPIC_API_KEY=sk-ant-你的密钥
```
可选切换 DeepSeek/OpenAI：
```
NEXT_PUBLIC_AI_PROVIDER=openai
OPENAI_API_KEY=你的密钥
OPENAI_MODEL=deepseek-chat
```

## 约定
- 核心 AI 行为在 `prompts/` 中定义
- Mock 数据在 `lib/data/` 中维护，覆盖 6 个常见岗位
- 数据自动保存在浏览器 localStorage，导出备份以防丢失
- 修改 prompts / data 后重启 `npm run dev`
