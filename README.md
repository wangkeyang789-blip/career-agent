# AI Career Agent 🎯

智能求职助理 —— 从职业方向探索到面试准备，AI 全程陪伴。

## 功能

| 阶段 | 功能 | 说明 |
|------|------|------|
| 建立连接 | 基本信息收集 | 自然对话了解学历、专业、城市偏好等 |
| 方向探索 | 职业方向推荐 | 苏格拉底式提问，输出 2-3 个方向 |
| 岗位匹配 | JD 分析与匹配 | 拆解岗位要求，评估匹配度 |
| 材料准备 | 简历/Cover Letter | 针对岗位定制化修改 |
| 面试备战 | 模拟面试 | 支持多种类型和风格 |
| 复盘进化 | 面试复盘 | 分析表现，给出改进建议 |

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 API 密钥

在项目根目录创建 `.env.local` 文件：

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

目前支持：
- **Anthropic Claude**（默认）：设置 `ANTHROPIC_API_KEY`
- **DeepSeek** 或其他 OpenAI 兼容接口：设置 `OPENAI_API_KEY` 和 `OPENAI_API_BASE`

### 3. 启动

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用。

## 使用说明

- 全程对话式交互，AI 会逐步引导你完成每个阶段
- 右上角「工作台」可查看档案、进度、管理投递记录、记录心情
- 面试阶段可在顶部配置面试类型和风格
- 数据自动保存在浏览器中，可通过工作台导出备份

## 自定义 AI 行为

编辑 `prompts/` 目录下的 Markdown 文件即可修改各阶段 AI 行为，无需改动代码。

## 技术架构

Next.js 16 + Zustand + Claude API，单页应用，无独立后端，无数据库。

## 部署

推荐使用 Vercel 一键部署，在 Environment Variables 中设置 `ANTHROPIC_API_KEY`。
