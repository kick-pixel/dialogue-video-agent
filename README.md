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

`dialogue-video-agent` 是一个自动化 AI Agent，将任意技术文档（Markdown）转换为 **双角色对话短视频**，适用于抖音、B站、YouTube Shorts 等平台。

整个流程无需手动干预：**文档 → 对话脚本 → TTS 配音 → 视频渲染**，一条命令完成。

<div align="center">

```
📄 Markdown 文档
      ↓   LLM（GPT / DeepSeek / 通义）
📝 结构化对话脚本（visual_card 富可视化）
      ↓   Edge TTS / 阿里云千问 TTS
🎙️ 双角色配音（MP3 / WAV）
      ↓   Remotion（React）
🎬 final_video.mp4（9:16 或 16:9，30fps）
```

</div>

---

## ✨ 特性

| 功能 | 说明 |
|------|------|
| 🤖 LLM 驱动 | 兼容 OpenAI、DeepSeek、通义等任何 OpenAI 兼容 API |
| 🎙️ 双 TTS 引擎 | Edge TTS（免费）/ 阿里云千问 TTS，一个环境变量切换 |
| 🖼️ 富可视化卡片 | 4 种 VisualCard：流程图 / 概念卡 / 对比图 / 要点列表 |
| 🎨 多视觉主题 | tech-dark / neon / light，一个参数切换 |
| 📐 多视频比例 | 9:16 竖屏（抖音）/ 16:9 横屏（YouTube），一个参数切换 |
| 🐰🦊 角色可配置 | 头像路径、音色均可通过环境变量自定义 |
| 🔁 LLM Retry | Pydantic 严格校验 + 自动 3 次 Retry，输出更稳定 |
| ⚡ 全自动 | 一条命令，端到端无人值守生成 |

---

## 🗂️ 项目结构

```
dialogue-video-agent/
├── run_agent.py                  # 主入口：三个 Skill 的编排器
├── requirements.txt              # Python 依赖
├── .env.example                  # 环境变量示例（复制为 .env）
├── examples/
│   └── sample_doc.md             # 示例文档（RAG 原理）
├── skills/
│   ├── doc-dialogue-gen/         # Skill 1：LLM 生成对话脚本
│   │   └── skill.py              # Pydantic 校验 + 3次 Retry + 增强提示词
│   ├── dialogue-tts/             # Skill 2：TTS 多引擎配音
│   │   ├── skill.py              # 引擎调度（相对路径输出）
│   │   └── engines/
│   │       ├── base.py           # 抽象基类 TTSEngine
│   │       ├── edge.py           # Edge TTS（免费，无需 Key）
│   │       └── aliyun.py         # 阿里云千问 TTS
│   └── dialogue-video-render/    # Skill 3：Remotion 渲染
│       └── skill.py
├── remotion-player/              # React/Remotion 视频渲染
│   ├── src/
│   │   ├── DialogueVideo.tsx     # 主视频组件（支持主题 + 比例）
│   │   ├── types.ts              # TypeScript 类型定义
│   │   ├── themes.ts             # 视觉主题系统（tech-dark/neon/light）
│   │   └── components/
│   │       ├── CharacterLayer.tsx   # 角色头像（路径可配置）
│   │       ├── VisualCard.tsx       # 富可视化卡片（4 种类型）
│   │       ├── QuestionCard.tsx     # 提问方问题展示
│   │       ├── EndingCard.tsx       # 结尾总结卡
│   │       ├── FocusGlow.tsx        # 聚焦光晕背景
│   │       └── ParticleGrid.tsx     # 粒子星空背景
│   ├── public/
│   │   └── characters/              # 角色图片（bunny.png / fox.png）
│   └── package.json
└── output/                       # 生成产物（已 gitignore）
    ├── dialogue.json             # LLM 生成的对话脚本
    ├── dialogue_with_audio.json  # 带时长信息的对话脚本
    ├── audio/                    # TTS 音频（相对路径引用）
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
# ① Python 依赖
pip install -r requirements.txt

# ② Remotion 前端依赖
cd remotion-player
npm install
cd ..
```

### 3. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env`，至少填写：

```env
OPENAI_API_KEY=your_api_key_here
```

### 4. 运行（最简命令）

```bash
python run_agent.py --doc examples/sample_doc.md
```

输出视频位于 `output/final_video.mp4`。

---

## 🔧 完整命令参考

### 基础用法

```bash
# 最简运行（使用 .env 中的默认配置）
python run_agent.py --doc examples/sample_doc.md

# 指定输出目录
python run_agent.py --doc your_article.md --output my_project/output
```

### TTS 引擎选择

```bash
# Edge TTS（默认，免费，无需额外 Key）
python run_agent.py --doc examples/sample_doc.md --tts edge

# 阿里云千问 TTS（需在 .env 中配置 DASHSCOPE_API_KEY）
python run_agent.py --doc examples/sample_doc.md --tts aliyun
```

### 视频比例

```bash
# 9:16 竖屏 —— 抖音 / YouTube Shorts（默认）
python run_agent.py --doc examples/sample_doc.md --ratio 9:16

# 16:9 横屏 —— YouTube / B 站
python run_agent.py --doc examples/sample_doc.md --ratio 16:9
```

### 视觉主题

```bash
# 深色科技感（默认）
python run_agent.py --doc examples/sample_doc.md --theme tech-dark

# 霓虹赛博朋克
python run_agent.py --doc examples/sample_doc.md --theme neon

# 浅色清爽风
python run_agent.py --doc examples/sample_doc.md --theme light
```

### 组合示例

```bash
# 阿里云 TTS + 霓虹主题 + 横屏
python run_agent.py \
  --doc examples/sample_doc.md \
  --tts aliyun \
  --ratio 16:9 \
  --theme neon \
  --output output_landscape

# 查看所有参数
python run_agent.py --help
```

### 环境变量方式（无需每次传参）

在 `.env` 中设置默认值，运行时可省略对应 CLI 参数：

```env
TTS_ENGINE=aliyun
VIDEO_RATIO=9:16
VIDEO_THEME=tech-dark
```

**优先级：CLI 参数 > 环境变量 > 硬编码默认值**

---

## ⚙️ 环境变量完整说明

```env
# ─── LLM（必填）──────────────────────────────────────────
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1   # 可换国产 API
OPENAI_MODEL=gpt-4o                          # 模型名称

# ─── 视频配置（可选）──────────────────────────────────────
VIDEO_RATIO=9:16          # 9:16（默认竖屏）| 16:9（横屏）
VIDEO_THEME=tech-dark     # tech-dark（默认）| neon | light

# ─── TTS 引擎（可选，默认 edge）──────────────────────────
TTS_ENGINE=edge           # edge | aliyun

# 阿里云 TTS（TTS_ENGINE=aliyun 时必填）
DASHSCOPE_API_KEY=sk-xxxx
ALIYUN_TTS_MODEL=qwen3-tts-flash

# ─── Edge TTS 声音（可选）────────────────────────────────
VOICE_BUNNY=zh-CN-XiaoxiaoNeural   # 小白声音
VOICE_FOX=zh-CN-YunxiNeural        # 大橘声音

# ─── 阿里云 TTS 声音（可选）──────────────────────────────
ALIYUN_VOICE_BUNNY=Cherry   # 芊悦（默认）
ALIYUN_VOICE_FOX=Ethan      # 晨煦（默认）

# ─── 角色头像（可选）──────────────────────────────────────
CHARACTER_BUNNY_IMAGE=characters/bunny.png   # 相对 remotion/public/
CHARACTER_FOX_IMAGE=characters/fox.png
```

---

## 🎨 视觉主题对比

| 主题 | 背景 | 高亮色 | 适用场景 |
|------|------|--------|---------|
| `tech-dark` | 深蓝黑 | 橙金色 | 通用技术类内容 |
| `neon` | 纯黑 | 青绿霓虹 | 科技感强的话题 |
| `light` | 浅灰白 | 紫色 | 教育 / 清爽风格 |

---

## 🖼️ VisualCard 类型说明

大橘（fox）回答时屏幕展示的富可视化内容，文字答案仅通过 TTS 播报：

| 类型 | 效果 | 适用场景 |
|------|------|---------|
| `flow_steps` | 步骤弹入动画，图标圆 + 标题 + 说明 | 有顺序的技术流程 |
| `concept_box` | 大字术语 + 定义框 + 类比例子 | 核心术语解释 |
| `bullet_points` | 图标圆 + 要点列表，从左滑入 | 并列优势 / 特点 |
| `comparison` | 左红右绿双列对比 | 新旧 / 有无 / 好坏对比 |

---

## 🧩 数据结构参考（dialogue_with_audio.json）

```json
{
  "meta": {
    "title": "RAG 是什么？",
    "video_config": { "fps": 30, "width": 1080, "height": 1920, "theme": "tech-dark" },
    "tts_engine": "edge",
    "total_frames": 1890,
    "total_duration_sec": 63.0
  },
  "characters": {
    "questioner": { "id": "bunny", "name": "小白", "image": "characters/bunny.png" },
    "answerer":   { "id": "fox",   "name": "大橘", "image": "characters/fox.png" }
  },
  "exchanges": [
    {
      "id": "ex_01",
      "speaker": "bunny",
      "text": "大橘，RAG 是啥？",
      "emotion": "curious",
      "visual_card": { "type": "question", "text": "RAG 是啥？" },
      "audio": { "file": "audio/ex_01.mp3", "duration_sec": 2.1, "duration_frames": 73 }
    },
    {
      "id": "ex_02",
      "speaker": "fox",
      "text": "RAG 就是检索增强生成，让 AI 先查资料再回答。",
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
      "audio": { "file": "audio/ex_02.mp3", "duration_sec": 8.42, "duration_frames": 263 }
    }
  ],
  "ending": {
    "title": "今日学到了 ✨",
    "points": ["RAG = 检索 + 增强 + 生成", "解决 LLM 知识截止问题", "企业落地首选方案"],
    "cta": "关注我，每天 1 分钟搞懂一个技术概念 🚀",
    "duration_frames": 120
  }
}
```

---

## 🔧 自定义角色

### 替换头像图片

将图片放到 `remotion-player/public/characters/`：

```bash
remotion-player/public/characters/bunny.png   # 小白（建议 512×512+，PNG）
remotion-player/public/characters/fox.png     # 大橘
```

或通过环境变量使用自定义名称：

```env
CHARACTER_BUNNY_IMAGE=characters/my_rabbit.png
CHARACTER_FOX_IMAGE=characters/my_fox.png
```

> 💡 图片自动裁剪为圆形显示，背景色会被遮罩，建议主体居中

### 更换 TTS 声音

**Edge TTS 可用中文声音：**

| 声音 | 特色 |
|------|------|
| `zh-CN-XiaoxiaoNeural` | 甜美女声（小白默认）|
| `zh-CN-YunxiNeural` | 清晰男声（大橘默认）|
| `zh-CN-XiaohanNeural` | 知性女声 |
| `zh-CN-YunyangNeural` | 新闻播报男声 |

**阿里云千问 TTS 推荐音色：**

| 声音 | 特色 |
|------|------|
| `Cherry`（芊悦）| 阳光积极小姐姐（小白默认）|
| `Ethan`（晨煦）| 阳光温暖男生（大橘默认）|
| `Serena`（苏瑶）| 温柔知性女声 |
| `Moon`（月白）| 帅气男声 |

---

## 📦 依赖一览

### Python（`requirements.txt`）

| 包 | 用途 |
|------|------|
| `openai` | LLM API 调用 |
| `edge-tts` | Edge TTS 语音合成（免费）|
| `dashscope` | 阿里云千问 TTS（可选）|
| `mutagen` | MP3/WAV 时长读取 |
| `python-dotenv` | 环境变量管理 |
| `pydantic` | LLM 输出结构校验 |
| `json-repair` | LLM JSON 容错修复 |

### Node.js

| 包 | 用途 |
|------|------|
| `remotion` | 视频渲染核心 |
| `@remotion/cli` | CLI 渲染命令 |
| `react` / `react-dom` | UI 组件框架 |
| `typescript` | 类型安全 |

---

## 🛣️ Roadmap

- [x] 多 TTS 引擎（Edge TTS / 阿里云千问）
- [x] 多视频比例（9:16 / 16:9）
- [x] 多视觉主题（tech-dark / neon / light）
- [x] 角色头像路径可配置
- [x] LLM Pydantic 校验 + 自动 Retry
- [ ] PDF / URL / Word 输入支持
- [ ] 背景音乐层
- [ ] 字幕导出（.srt / .vtt）
- [ ] Web UI（上传文档 → 下载视频）
- [ ] Docker 一键部署

---

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

## 📄 License

MIT License © 2026
