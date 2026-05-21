# AI Career Agent - 智能求职助理

## 项目概述
对话式 AI 求职助理，6 阶段覆盖求职全流程：建立连接 → 方向探索 → 岗位匹配 → 材料准备 → 面试备战 → 复盘进化。

## 技术栈
- **框架**: Next.js 16 (App Router)
- **UI**: 纯 CSS 自定义样式（无第三方 UI 库依赖，除 Ant Design 外）
- **状态管理**: Zustand + localStorage 持久化
- **AI**: Anthropic Claude API（支持切换 DeepSeek/OpenAI）
- **部署**: Vercel 免费版

## 项目结构
```
career-agent/
├── app/
│   ├── layout.tsx          # 页面布局
│   ├── page.tsx            # 主页面（唯一页面）
│   ├── globals.css         # 全部样式
│   └── api/chat/route.ts   # AI API 代理（隐藏密钥）
├── components/
│   ├── ChatView.tsx        # 对话列表
│   ├── ChatInput.tsx       # 输入框
│   ├── MessageBubble.tsx   # 消息气泡
│   ├── StageIndicator.tsx  # 阶段进度条
│   ├── SidePanel.tsx       # 侧边栏（档案/进度/投递/心情）
│   └── InterviewConfig.tsx # 面试配置器
├── stores/
│   └── careerStore.ts      # 全局状态管理
├── lib/
│   ├── utils.ts            # 工具函数（标记解析、阶段定义）
│   ├── prompts.ts          # 提示词加载
├── prompts/                # <<< 核心：AI 行为定义 >>>
│   ├── 1-connect.md        # 阶段1：了解用户
│   ├── 2-explore.md        # 阶段2：方向探索
│   ├── 3-match.md          # 阶段3：岗位匹配
│   ├── 4-prepare.md        # 阶段4：材料准备
│   ├── 5-interview.md      # 阶段5：面试备战
│   └── 6-review.md         # 阶段6：复盘进化
└── .env.example            # 环境变量模板
```

## 如何修改 AI 行为

编辑 `prompts/` 目录下的 Markdown 文件即可：
- 每个文件对应一个阶段
- 修改提示词可以改变 AI 的语气、提问方式、输出格式
- 不需要动任何代码文件

### 特殊标记
AI 回复中可以包含标记来控制行为：
- `%%%STAGE_DATA{...json...}%%%` — 结构化数据存入状态
- `%%%STAGE_COMPLETE{...json...}%%%` — 触发阶段切换

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

## 部署
1. 推送代码到 GitHub（私有仓库）
2. 在 Vercel 导入仓库，一键部署
3. 在 Vercel 控制台设置 `ANTHROPIC_API_KEY` 环境变量

## 约定
- 不改动 `prompts/` 以外的文件
- 数据自动保存在浏览器 localStorage，导出备份以防丢失
- 每次修改 prompts 后重启 `npm run dev` 才能看到效果
