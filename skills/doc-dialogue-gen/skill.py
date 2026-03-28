"""
Skill 1: doc-dialogue-gen v4
增强版：Pydantic 严格校验 + 自动 Retry + Chain-of-Thought 提示词 + 多比例/主题支持
"""
import json
import os
import re
import pathlib
from typing import Literal

from openai import AsyncOpenAI

# ─── Pydantic 校验（Python 3.10+）────────────────────────────────────────────
try:
    from pydantic import BaseModel, Field, model_validator
    _PYDANTIC_AVAILABLE = True
except ImportError:
    _PYDANTIC_AVAILABLE = False


# ─── 数据模型（用于 Pydantic 校验）──────────────────────────────────────────

if _PYDANTIC_AVAILABLE:
    class FlowStep(BaseModel):
        icon: str
        label: str
        desc: str = ""

    class BulletPoint(BaseModel):
        icon: str
        text: str

    class ComparisonSide(BaseModel):
        label: str
        items: list[str]

    class VisualCardBase(BaseModel):
        type: str

    class QuestionCard(VisualCardBase):
        type: Literal["question"]
        text: str

    class FlowStepsCard(VisualCardBase):
        type: Literal["flow_steps"]
        title: str
        steps: list[FlowStep] = Field(min_length=2, max_length=5)

    class ConceptBoxCard(VisualCardBase):
        type: Literal["concept_box"]
        term: str
        definition: str
        example: str = ""

    class BulletPointsCard(VisualCardBase):
        type: Literal["bullet_points"]
        title: str
        points: list[BulletPoint] = Field(min_length=2, max_length=5)

    class ComparisonCard(VisualCardBase):
        type: Literal["comparison"]
        title: str
        before: ComparisonSide
        after: ComparisonSide

    class Exchange(BaseModel):
        id: str
        speaker: Literal["bunny", "fox"]
        text: str
        emotion: str = "explaining"
        visual_card: dict | None = None

        @model_validator(mode="after")
        def check_visual_card(self):
            vc = self.visual_card
            if vc is None:
                return self
            t = vc.get("type", "")
            if t == "question" and self.speaker == "bunny":
                QuestionCard(**vc)
            elif t == "flow_steps":
                FlowStepsCard(**vc)
            elif t == "concept_box":
                ConceptBoxCard(**vc)
            elif t == "bullet_points":
                BulletPointsCard(**vc)
            elif t == "comparison":
                ComparisonCard(**vc)
            return self

    class Dialogue(BaseModel):
        meta: dict
        characters: dict
        exchanges: list[Exchange] = Field(min_length=3)
        ending: dict


# ─── 提示词 ──────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """\
你是一位资深的技术短视频脚本编剧，专为抖音/YouTube Shorts 创作高质量内容。

## 角色设定

| 角色 | ID | 描述 |
|------|-----|------|
| 小白🐰 | bunny | 白兔，初学者视角，口吻萌且好奇，每次只问1句话，≤20字 |
| 大橘🦊 | fox   | 橘狐，技术大牛，解释生动，善用类比，每次回答≤70字 |

## 视频布局

- 9:16 竖屏，1080×1920
- 小白（bunny）：画面左下角小圆形头像
- 大橘（fox）：画面右上角小圆形头像
- **小白说话**：屏幕中央显示 QuestionCard（大字问题）
- **大橘说话**：屏幕中央显示 VisualCard（富可视化），文字答案**仅通过TTS播报，不显示在屏幕上**

## VisualCard 类型 - 必须精准匹配场景

| type | 适用场景 | 要求 |
|------|------|------|
| `flow_steps` | 有顺序的流程（如"3步走"）| 2~4步，每步含 icon+label+desc |
| `concept_box` | 解释单个核心术语 | term(≤8字)+definition(≤30字)+example |
| `bullet_points` | 并列的优缺点/要点 | 3~4条，每条含 icon+text |
| `comparison` | 有无/新旧/好坏对比 | 左右各2~3条，label要加✅/❌ |

## 质量标准

1. **对话字数**：总计250~350字，约60~90秒视频
2. **问答轮数**：3~5轮，先问后答
3. **visual_card**：大橘每次回答必须有 visual_card（除非是纯问候语）
4. **首轮**：必须由 bunny 提问，visual_card.type = "question"
5. **语言风格**：口语化，避免书面语，多用类比
6. **结尾**：最后一轮大橘用 bullet_points 总结3条核心收获

## 输出要求

- 直接输出 JSON，不要 markdown 代码块（```）
- 不要在 JSON 之前或之后添加任何解释文字
- 严格遵循下方 JSON Schema
- 所有字段类型必须与 schema 完全一致，不能缺失必填字段
\
"""

DIALOGUE_SCHEMA = """\
{
  "meta": {
    "title": "<视频标题，15字以内>",
    "source_doc": "<文档标题>",
    "video_config": {"fps": 30, "width": 1080, "height": 1920, "theme": "tech-dark"}
  },
  "characters": {
    "questioner": {"id": "bunny", "name": "小白", "voice": "zh-CN-XiaoxiaoNeural", "screen_anchor": "bottom-left"},
    "answerer":   {"id": "fox",   "name": "大橘", "voice": "zh-CN-YunxiNeural",   "screen_anchor": "top-right"}
  },
  "exchanges": [
    {
      "id": "ex_01",
      "speaker": "bunny",
      "text": "<问题，≤20字>",
      "emotion": "curious",
      "visual_card": {"type": "question", "text": "<同上或更精炼>"}
    },
    {
      "id": "ex_02",
      "speaker": "fox",
      "text": "<TTS解说词，≤70字，不显示在屏幕>",
      "emotion": "explaining",
      "visual_card": {
        "type": "flow_steps",
        "title": "<标题≤12字>",
        "steps": [
          {"icon": "📂", "label": "<步骤名≤6字>", "desc": "<≤18字>"},
          {"icon": "🧩", "label": "<步骤名≤6字>", "desc": "<≤18字>"},
          {"icon": "✨", "label": "<步骤名≤6字>", "desc": "<≤18字>"}
        ]
      }
    },
    {
      "id": "ex_03",
      "speaker": "bunny",
      "text": "<追问≤20字>",
      "emotion": "curious",
      "visual_card": {"type": "question", "text": "<追问精炼版>"}
    },
    {
      "id": "ex_04",
      "speaker": "fox",
      "text": "<TTS解说词≤70字>",
      "emotion": "explaining",
      "visual_card": {
        "type": "concept_box",
        "term": "<核心术语≤8字>",
        "definition": "<定义≤30字>",
        "example": "<类比≤25字>"
      }
    },
    {
      "id": "ex_05",
      "speaker": "bunny",
      "text": "<追问≤20字>",
      "emotion": "curious",
      "visual_card": {"type": "question", "text": "<追问精炼版>"}
    },
    {
      "id": "ex_06",
      "speaker": "fox",
      "text": "<TTS解说词≤70字>",
      "emotion": "explaining",
      "visual_card": {
        "type": "comparison",
        "title": "<对比标题≤12字>",
        "before": {"label": "❌ <旧方式>", "items": ["<缺点1≤16字>", "<缺点2≤16字>"]},
        "after":  {"label": "✅ <新方式>", "items": ["<优点1≤16字>", "<优点2≤16字>"]}
      }
    },
    {
      "id": "ex_07",
      "speaker": "fox",
      "text": "<总结金句≤60字>",
      "emotion": "celebrating",
      "visual_card": {
        "type": "bullet_points",
        "title": "核心收获 ✨",
        "points": [
          {"icon": "🎯", "text": "<核心收获1≤20字>"},
          {"icon": "⚡", "text": "<核心收获2≤20字>"},
          {"icon": "🔑", "text": "<核心收获3≤20字>"}
        ]
      }
    }
  ],
  "ending": {
    "type": "summary-card",
    "title": "今日学到了 ✨",
    "points": ["<知识点1>", "<知识点2>", "<知识点3>"],
    "cta": "关注我，每天 1 分钟搞懂一个技术概念 🚀",
    "duration_frames": 120
  }
}\
"""

USER_PROMPT_TEMPLATE = """\
请根据以下技术文档生成双角色对话脚本：

文档标题：{doc_title}

文档内容：
{doc_content}

【重要提醒】
- 只输出 JSON，不要输出任何其他文字
- 不要使用 markdown 代码块（不要写 ```）
- exchanges 中大橘的每次回答都必须包含 visual_card
- visual_card 的 type 必须是以下之一：question / flow_steps / concept_box / bullet_points / comparison
"""

USER_PROMPT_RETRY_TEMPLATE = """\
你上次输出的 JSON 存在以下问题，请修正后重新输出完整的 JSON（只输出 JSON，无任何额外文字）：

【错误信息】
{error_msg}

【你上次的输出】
{prev_output}

文档标题：{doc_title}

【重要】直接输出修正后的完整 JSON，不要任何解释。
"""


class DocDialogueGenSkill:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        )
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o")
        self.max_retries = 3

    def _build_system_prompt(self, video_config: dict) -> str:
        """根据 video_config 动态调整系统提示词"""
        ratio = video_config.get("ratio", "9:16")
        theme = video_config.get("theme", "tech-dark")
        system = SYSTEM_PROMPT

        # 动态修改 schema 中的 video_config
        w, h = (1920, 1080) if ratio == "16:9" else (1080, 1920)
        schema = DIALOGUE_SCHEMA.replace(
            '"width": 1080, "height": 1920',
            f'"width": {w}, "height": {h}'
        ).replace(
            '"theme": "tech-dark"',
            f'"theme": "{theme}"'
        )
        return system + "\n\n## JSON Schema（严格遵循）\n\n" + schema

    async def run(
        self,
        doc_content: str,
        doc_title: str = "技术文档",
        video_config: dict | None = None,
    ) -> dict:
        """调用 LLM 生成 dialogue.json，内置 Pydantic 校验 + 自动 Retry"""
        if video_config is None:
            video_config = {}

        # 长文档截断（保留前/后关键段落）
        if len(doc_content) > 6000:
            half = 3000
            doc_content = doc_content[:half] + "\n\n……（中间内容已省略）……\n\n" + doc_content[-half:]

        system_prompt = self._build_system_prompt(video_config)
        user_prompt = USER_PROMPT_TEMPLATE.format(
            doc_title=doc_title,
            doc_content=doc_content,
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ]

        last_error = None
        last_raw = ""

        for attempt in range(1, self.max_retries + 1):
            if attempt > 1:
                print(f"    [retry {attempt}/{self.max_retries}] 上次错误: {last_error}")
                # 追加 retry 消息引导 LLM 修正
                messages.append({"role": "assistant", "content": last_raw})
                messages.append({
                    "role": "user",
                    "content": USER_PROMPT_RETRY_TEMPLATE.format(
                        error_msg=str(last_error),
                        prev_output=last_raw[:2000],  # 截断防止超长
                        doc_title=doc_title,
                    ),
                })

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.6 if attempt == 1 else 0.3,  # retry 时降低随机性
            )

            raw = response.choices[0].message.content.strip()
            last_raw = raw

            # 调试：保存原始响应
            try:
                pathlib.Path("output").mkdir(exist_ok=True)
                pathlib.Path("output/llm_raw.txt").write_text(raw, encoding="utf-8")
            except Exception:
                pass

            try:
                dialogue = self._parse_and_validate(raw, video_config)
                return dialogue
            except Exception as e:
                last_error = e
                if attempt == self.max_retries:
                    raise RuntimeError(
                        f"LLM 在 {self.max_retries} 次尝试后仍输出无效 JSON。\n"
                        f"最后错误: {last_error}\n"
                        f"原始输出已保存至 output/llm_raw.txt"
                    ) from e

        # 不应该走到这里
        raise RuntimeError("未知错误")

    def _parse_and_validate(self, raw: str, video_config: dict) -> dict:
        """从 LLM 输出中提取 JSON 并做 Pydantic 校验"""
        # 1. 提取 JSON 块
        cleaned = raw

        # 去掉 markdown 代码块标记
        code_block = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
        if code_block:
            cleaned = code_block.group(1)
        else:
            # 提取从第一个 { 到最后一个 }
            first = cleaned.find("{")
            last  = cleaned.rfind("}")
            if first != -1 and last != -1 and last > first:
                cleaned = cleaned[first:last + 1]

        # 清理控制字符
        cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", cleaned)

        # 2. 解析 JSON（带容错修复）
        try:
            from json_repair import repair_json
            dialogue = repair_json(cleaned, return_objects=True)
            if not isinstance(dialogue, dict):
                dialogue = json.loads(cleaned, strict=False)
        except ImportError:
            try:
                dialogue = json.loads(cleaned, strict=False)
            except json.JSONDecodeError:
                # 最后手段：宽松解析
                dialogue = json.loads(re.sub(r",\s*([}\]])", r"\1", cleaned))

        # 3. 自动解包外层包装（有些模型会多套一层）
        if "exchanges" not in dialogue:
            for val in dialogue.values():
                if isinstance(val, dict) and "exchanges" in val:
                    dialogue = val
                    break
            else:
                raise ValueError(f"JSON 中未找到 'exchanges' 字段，顶层 keys: {list(dialogue.keys())}")

        # 4. 规范化 exchanges
        for idx, ex in enumerate(dialogue.get("exchanges", []), start=1):
            ex.setdefault("emotion", "curious" if ex.get("speaker") == "bunny" else "explaining")
            if not ex.get("id"):
                ex["id"] = f"ex_{idx:02d}"
            # 向后兼容：把旧 keywords 转为 bullet_points visual_card
            if ex.get("keywords") and not ex.get("visual_card"):
                kws = ex.pop("keywords")
                ex["visual_card"] = {
                    "type": "bullet_points",
                    "title": "关键词",
                    "points": [{"icon": "🔹", "text": k.get("text", str(k))} for k in kws],
                }
            # 如果 visual_card 缺失 type，做 fallback
            vc = ex.get("visual_card")
            if vc and "type" not in vc:
                ex["visual_card"] = {
                    "type": "bullet_points",
                    "title": vc.get("title", "要点"),
                    "points": [{"icon": "🔹", "text": str(v)} for v in vc.values() if isinstance(v, str)][:4],
                }

        # 5. meta.video_config 合并 CLI 参数
        if "meta" in dialogue and video_config:
            dialogue["meta"].setdefault("video_config", {})
            dialogue["meta"]["video_config"].update(video_config)

        # 6. Pydantic 深度校验（可选，降级处理）
        if _PYDANTIC_AVAILABLE:
            try:
                Dialogue(**dialogue)
            except Exception as pydantic_err:
                # 轻微格式问题：尝试自动修正
                dialogue = self._auto_fix(dialogue, str(pydantic_err))
                # 二次校验
                Dialogue(**dialogue)

        return dialogue

    def _auto_fix(self, dialogue: dict, error_msg: str) -> dict:
        """尝试自动修正常见的 Pydantic 校验失败"""
        for ex in dialogue.get("exchanges", []):
            vc = ex.get("visual_card")
            if not vc:
                continue
            t = vc.get("type", "")
            # flow_steps：steps 至少2条
            if t == "flow_steps":
                steps = vc.get("steps", [])
                while len(steps) < 2:
                    steps.append({"icon": "➡️", "label": "步骤", "desc": ""})
                vc["steps"] = steps
            # bullet_points：points 至少2条
            elif t == "bullet_points":
                pts = vc.get("points", [])
                while len(pts) < 2:
                    pts.append({"icon": "•", "text": "..."})
                vc["points"] = pts
            # comparison：确保 before/after 存在
            elif t == "comparison":
                vc.setdefault("before", {"label": "❌ 旧方式", "items": ["..."]})
                vc.setdefault("after",  {"label": "✅ 新方式", "items": ["..."]})
        return dialogue
