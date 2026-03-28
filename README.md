<div align="center">

# 🎬 Dialogue Video Agent

**将技术文档一键转换为双角色对话短视频**

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python)](https://python.org)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)](https://nodejs.org)
[![Remotion](https://img.shields.io/badge/Remotion-4.x-purple?logo=react)](https://remotion.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#license)

</div>

---

## 📖 简介

`dialogue-video-agent` 是一个自动化 AI Agent，它能将任意技术文档（Markdown）转换为 **9:16 双角色对话短视频**，适用于抖音、B站、YouTube Shorts 等平台。

整个流程无需手动干预：**文档 → 对话脚本 → TTS 配音 → 视频渲染**，一条命令完成。

<div align="center">

```
📄 Markdown 文档
      ↓   LLM（GPT / 国产）
📝 结构化对话脚本（visual_card）
      ↓   Edge TTS
🎙️ 双角色配音（MP3）
      ↓   Remotion
🎬 final_video.mp4（9:16，30fps）
```

</div>

---

## ✨ 特性

| 功能 | 说明 |
|------|------|
| 🤖 LLM 驱动 | 兼容 OpenAI、DeepSeek、通义等任何 OpenAI 兼容 API |
| 🎙️ Edge TTS | 免费高质量中文 TTS，两种声音区分角色 |
| 🎬 Remotion 渲染 | React 驱动，高性能服务端视频渲染 |
| 🖼️ 富可视化卡片 | 4 种 VisualCard：流程图 / 概念卡 / 对比图 / 要点列表 |
| 🐰🦊 双角色 | 小白（提问者）+ 大橘（回答者），角色形象可替换 |
| ⚡ 全自动 | 一条命令，端到端无人值守生成 |

---

## 🗂️ 项目结构

```
dialogue-video-agent/
├── run_agent.py                  # 主入口：三个 Skill 的编排器
├── .env.example                  # 环境变量示例
├── examples/
│   └── sample_doc.md             # 示例文档（RAG 原理）
├── skills/
│   ├── doc-dialogue-gen/         # Skill 1：LLM 生成对话脚本
│   │   └── skill.py
│   ├── dialogue-tts/             # Skill 2：Edge TTS 配音
│   │   └── skill.py
│   └── dialogue-video-render/    # Skill 3：Remotion 渲染
│       └── skill.py
├── remotion-player/              # React/Remotion 视频渲染前端
│   ├── src/
│   │   ├── DialogueVideo.tsx     # 主视频组件
│   │   ├── types.ts              # TypeScript 类型定义
│   │   └── components/
│   │       ├── CharacterLayer.tsx  # 角色圆形头像（角落显示）
│   │       ├── VisualCard.tsx      # 富可视化卡片（4 种类型）
│   │       ├── QuestionCard.tsx    # 提问方问题展示
│   │       ├── EndingCard.tsx      # 结尾总结卡
│   │       ├── FocusGlow.tsx       # 聚焦光晕背景
│   │       └── ParticleGrid.tsx    # 粒子星空背景
│   ├── public/
│   │   └── characters/           # 角色图片（bunny.png / fox.png）
│   └── package.json
└── output/                       # 生成产物（gitignore）
    ├── dialogue.json
    ├── dialogue_with_audio.json
    ├── audio/                    # TTS 音频文件
    └── final_video.mp4           # 最终视频
```

---

## 🚀 快速开始

### 1. 环境要求

- Python ≥ 3.10
- Node.js ≥ 18
- 已配置 OpenAI 兼容 API Key

### 2. 安装依赖

```bash
# Python 依赖
pip install openai edge-tts mutagen python-dotenv json-repair

# Remotion 前端依赖
cd remotion-player
npm install
cd ..
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`：

```env
# OpenAI / 兼容 API
OPENAI_API_KEY=your_api_key_here

# 可选：国产模型 base_url（如 DeepSeek、通义）
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat
```

### 4. 运行

```bash
python run_agent.py --doc examples/sample_doc.md
```

输出视频位于 `output/final_video.mp4`。

```bash
# 自定义输出目录
python run_agent.py --doc your_article.md --output my_output
```

---

## 🎨 视觉系统

### 布局设计（1080 × 1920）

```
┌─────────────────────┬─────┐
│                     │ 🦊  │  ← 大橘头像（右上）
│   VisualCard        │     │
│  ┌───────────────┐  └─────┘
│  │ 流程图/概念卡  │
│  │ /对比图/要点  │
│  └───────────────┘
│                          │
└──────────────────────────┘
│ 🐰 │  ← 小白头像（左下）
└────┘
```

### VisualCard 类型

| 类型 | 效果 | 触发场景 |
|------|------|------|
| `flow_steps` | 步骤顺序弹入，编号圆+标题+说明 | 有流程的技术概念 |
| `concept_box` | 大字术语 + 定义框 + 类比例子 | 单个核心词解释 |
| `bullet_points` | 图标圆 + 要点列表，从左滑入 | 并列优势/特点 |
| `comparison` | 左红右绿双列对比 | 新旧/有无对比 |

---

## 🧩 数据结构（dialogue_with_audio.json）

每个 `exchange` 包含：

```json
{
  "id": "ex_02",
  "speaker": "fox",
  "text": "仅用于 TTS，不显示在屏幕上",
  "emotion": "explaining",
  "visual_card": {
    "type": "flow_steps",
    "title": "RAG 三步走",
    "steps": [
      { "icon": "📂", "label": "检索", "desc": "从知识库搜相关文档" },
      { "icon": "🧩", "label": "增强", "desc": "拼入原始问题" },
      { "icon": "✨", "label": "生成", "desc": "LLM 输出最终答案" }
    ]
  },
  "audio": {
    "file": "audio/ex_02.mp3",
    "duration_sec": 8.42,
    "duration_frames": 253
  }
}
```

---

## 🔧 自定义

### 替换角色图片

将新图片放置到：

```
remotion-player/public/characters/bunny.png   # 小白（建议 512×512+）
remotion-player/public/characters/fox.png     # 大橘
```

> 💡 图片会自动裁剪为圆形显示，无需透明背景

### 更换 TTS 声音

编辑 `skills/dialogue-tts/skill.py`，或在 `dialogue.json` 中修改 `characters.questioner.voice` / `characters.answerer.voice`。

可用中文声音：`zh-CN-XiaoxiaoNeural`、`zh-CN-YunxiNeural`、`zh-CN-XiaohanNeural` 等。

### 接入国产 LLM

在 `.env` 中修改：

```env
# DeepSeek
OPENAI_BASE_URL=https://api.deepseek.com/v1
OPENAI_MODEL=deepseek-chat

# 通义千问
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-plus
```

---

## 📦 依赖一览

### Python

| 包 | 用途 |
|------|------|
| `openai` | LLM API 调用 |
| `edge-tts` | Edge TTS 语音合成 |
| `mutagen` | 音频时长读取 |
| `python-dotenv` | 环境变量管理 |
| `json-repair` | LLM 输出 JSON 容错修复 |

### Node.js

| 包 | 用途 |
|------|------|
| `remotion` | 视频渲染核心 |
| `@remotion/cli` | CLI 渲染命令 |
| `react` / `react-dom` | UI 组件框架 |
| `typescript` | 类型安全 |

---

## 📋 已知限制

- 输入格式：目前仅支持 `.md` / `.txt`（PDF / URL 支持规划中）
- 视频格式：固定 9:16 竖屏（横屏支持规划中）
- 长文档：超过 4000 字会截断处理

---

## 🛣️ Roadmap

- [ ] 支持 PDF / URL / Word 输入
- [ ] 横屏（16:9）视频模式
- [ ] 多主题风格（浅色 / 赛博朋克 / 学习风）
- [ ] Web UI（上传文档 → 下载视频）
- [ ] 背景音乐层
- [ ] 字幕导出（.srt / .vtt）
- [ ] Docker 一键部署

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

## 📄 License

MIT License © 2026
