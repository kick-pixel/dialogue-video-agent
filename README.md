# 技术文档 → 双角色对话视频 Agent

将任意技术文档自动转换为约 1 分钟的 9:16 竖屏对话视频。
两个卡通角色（小白🐰 提问 / 大橘🦊 回答）轮流出镜，关键词动态飞入。

## 架构

```
技术文档
   ↓
Skill 1: doc-dialogue-gen   → dialogue.json
   ↓
Skill 2: dialogue-tts       → dialogue_with_audio.json + audio/*.mp3
   ↓
Skill 3: dialogue-video-render (Remotion) → output.mp4
```

## 快速开始

### 1. 安装 Python 依赖

```bash
pip install -r requirements.txt
```

### 2. 配置 LLM API Key

```bash
cp .env.example .env
# 编辑 .env，填入你的 OpenAI API Key
```

### 3. 安装 Remotion 依赖

```bash
cd remotion-player
npm install
```

### 4. 运行 Agent（端到端）

```bash
python run_agent.py --doc "path/to/your_doc.md"
```

视频将输出到 `output/final_video.mp4`

## 目录结构

```
dialogue-video-agent/
├── run_agent.py                    # 主入口：串联 3 个 Skill
├── requirements.txt
├── .env.example
├── skills/
│   ├── doc-dialogue-gen/           # Skill 1: LLM 生成对话脚本
│   │   ├── SKILL.md
│   │   └── skill.py
│   ├── dialogue-tts/               # Skill 2: Edge TTS 双声道配音
│   │   ├── SKILL.md
│   │   └── skill.py
│   └── dialogue-video-render/      # Skill 3: Remotion 渲染视频
│       ├── SKILL.md
│       └── skill.py
├── remotion-player/                # Remotion React 项目
│   ├── package.json
│   ├── src/
│   │   ├── Root.tsx
│   │   ├── DialogueVideo.tsx
│   │   ├── components/
│   │   │   ├── CharacterLayer.tsx
│   │   │   ├── ParticleGrid.tsx
│   │   │   ├── SpeechBubble.tsx
│   │   │   ├── KeywordLayer.tsx
│   │   │   ├── SubtitleBar.tsx
│   │   │   ├── FocusGlow.tsx
│   │   │   └── EndingCard.tsx
│   │   └── characters/
│   │       ├── BunnySVG.tsx
│   │       └── FoxSVG.tsx
├── output/
│   ├── audio/                      # Edge TTS 生成的音频文件
│   └── final_video.mp4
└── examples/
    ├── sample_doc.md               # 示例技术文档
    └── sample_dialogue.json        # 示例 dialogue.json
```

## 角色设定

| 角色 | 屏幕位置 | 音色 | 性格 |
|------|---------|------|------|
| 小白🐰（提问） | 左下角 | `zh-CN-XiaoxiaoNeural` | 好奇可爱 |
| 大橘🦊（回答） | 右上角 | `zh-CN-YunxiNeural` | 睿智沉稳 |
