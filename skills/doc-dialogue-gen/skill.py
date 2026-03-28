"""
Skill 1: doc-dialogue-gen
将技术文档转换为双角色对话脚本（dialogue.json）
新版 v3: keywords → visual_card，回答方只走TTS，屏幕显示富可视化内容
"""
import json
import os
import re
import pathlib
from openai import AsyncOpenAI


SYSTEM_PROMPT = """你是一位专业的技术短视频脚本编剧，专为抖音/YouTube Shorts 创作内容。

【角色设定】
- 小白🐰（questioner）：白兔，初学者，口吻萌且好奇，每次只问1~2句话
- 大橘🦊（answerer）：橘狐，技术大牛，解释生动，善用类比，每次回答不超过60字

【布局说明】
- 小白在画面左下角，大橘在画面右上角
- 每次只显示一个角色
- 小白说话：屏幕显示大字问题（QuestionCard）
- 大橘说话：屏幕显示富可视化内容（VisualCard），文字答案仅通过TTS播报

【visual_card 类型规则】
- flow_steps：有先后步骤的流程（2~4步），每步要有 emoji icon + 简短 label + 一句 desc
- concept_box：单个核心概念 + 定义 + 可选例子
- bullet_points：并列优势或要点（3~4条），每条要有 emoji icon
- comparison：新旧/有无对比，左右各2~3条

【emotion 枚举】
- curious: 好奇（小白提问时）
- explaining: 解释（大橘解说时）
- celebrating: 庆祝（结尾时）

【输出要求】
1. 总台词字数 250~350 字（约60~90秒）
2. 3~5 轮问答，大橘每次回答必须有对应 visual_card
3. small white 的 text 是问题（会显示在屏幕上，要简洁 ≤25字）
4. fox 的 text 是解说词（只走TTS，不显示在屏幕上，可稍长 ≤80字）
5. 最后大橘说一句总结金句（visual_card type=bullet_points 列出3条核心要点）
6. 严格按以下 JSON schema 输出，禁止输出任何额外文字或代码块标记"""

DIALOGUE_SCHEMA = """
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
      "text": "<问题，≤25字，会显示在屏幕上>",
      "emotion": "curious",
      "visual_card": {
        "type": "question",
        "text": "<同上，或更精炼的问题>"
      }
    },
    {
      "id": "ex_02",
      "speaker": "fox",
      "text": "<解说词，只走TTS，≤80字>",
      "emotion": "explaining",
      "visual_card": {
        "type": "flow_steps",
        "title": "<标题，≤12字>",
        "steps": [
          {"icon": "📂", "label": "<步骤名≤6字>", "desc": "<一句话说明≤18字>"},
          {"icon": "🧩", "label": "<步骤名≤6字>", "desc": "<一句话说明≤18字>"},
          {"icon": "✨", "label": "<步骤名≤6字>", "desc": "<一句话说明≤18字>"}
        ]
      }
    },
    {
      "id": "ex_03",
      "speaker": "fox",
      "text": "<解说词，只走TTS>",
      "emotion": "explaining",
      "visual_card": {
        "type": "concept_box",
        "term": "<核心术语≤8字>",
        "definition": "<定义≤30字>",
        "example": "<类比或例子≤25字>"
      }
    },
    {
      "id": "ex_04",
      "speaker": "fox",
      "text": "<解说词，只走TTS>",
      "emotion": "explaining",
      "visual_card": {
        "type": "bullet_points",
        "title": "<标题≤12字>",
        "points": [
          {"icon": "⚡", "text": "<要点≤20字>"},
          {"icon": "🎯", "text": "<要点≤20字>"},
          {"icon": "🔍", "text": "<要点≤20字>"}
        ]
      }
    },
    {
      "id": "ex_05",
      "speaker": "fox",
      "text": "<解说词，只走TTS>",
      "emotion": "explaining",
      "visual_card": {
        "type": "comparison",
        "title": "<对比标题≤12字>",
        "before": {"label": "❌ 没有RAG", "items": ["<缺点1≤16字>", "<缺点2≤16字>"]},
        "after":  {"label": "✅ 有了RAG", "items": ["<优点1≤16字>", "<优点2≤16字>"]}
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
}"""

USER_PROMPT_TEMPLATE = """请根据以下技术文档生成双角色对话脚本：

文档标题：{doc_title}

文档内容：
{doc_content}

请严格按照 schema 输出，直接给出 JSON，不要任何其他文字。"""


class DocDialogueGenSkill:
    def __init__(self):
        self.client = AsyncOpenAI(
            api_key=os.getenv("OPENAI_API_KEY"),
            base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        )
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o")

    async def run(self, doc_content: str, doc_title: str = "技术文档") -> dict:
        """调用 LLM 生成 dialogue.json，返回 dict"""
        if len(doc_content) > 4000:
            doc_content = doc_content[:4000] + "\n\n（文档已截断，请基于以上内容生成对话）"

        user_prompt = USER_PROMPT_TEMPLATE.format(
            doc_title=doc_title,
            doc_content=doc_content,
        )
        full_system = SYSTEM_PROMPT + "\n\n【JSON Schema 示例】:\n" + DIALOGUE_SCHEMA

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": full_system},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            # 不使用 response_format，兼容国产 API
        )

        raw = response.choices[0].message.content.strip()

        # 调试：保存原始响应
        try:
            pathlib.Path("output").mkdir(exist_ok=True)
            pathlib.Path("output/llm_raw.txt").write_text(raw, encoding="utf-8")
        except Exception:
            pass

        # ── 提取 JSON 块 ──────────────────────────────────────────
        code_block = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
        if code_block:
            raw = code_block.group(1)
        else:
            json_block = re.search(r"\{.*\}", raw, re.DOTALL)
            if json_block:
                raw = json_block.group(0)

        # 清理裸控制字符
        raw = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', raw)

        # 使用 json_repair 解析
        try:
            from json_repair import repair_json
            repaired = repair_json(raw, return_objects=True)
            if isinstance(repaired, dict):
                dialogue = repaired
            else:
                dialogue = json.loads(raw, strict=False)
        except Exception:
            dialogue = json.loads(raw, strict=False)

        # 自动解包外层包装
        if "exchanges" not in dialogue:
            for val in dialogue.values():
                if isinstance(val, dict) and "exchanges" in val:
                    dialogue = val
                    break
            else:
                raise ValueError(
                    f"LLM 返回的 JSON 中没有找到 'exchanges' 字段。\n"
                    f"返回的顶层 keys: {list(dialogue.keys())}\n"
                    f"原始内容已保存至 output/llm_raw.txt"
                )

        # 规范化每个 exchange
        for idx, ex in enumerate(dialogue.get("exchanges", []), start=1):
            ex.setdefault("visual_card", None)
            ex.setdefault("emotion", "curious" if ex.get("speaker") == "bunny" else "explaining")
            if not ex.get("id"):
                ex["id"] = f"ex_{idx:02d}"
            # 向后兼容：把旧 keywords 转为 bullet_points visual_card
            if ex.get("keywords") and not ex.get("visual_card"):
                kws = ex["keywords"]
                ex["visual_card"] = {
                    "type": "bullet_points",
                    "title": "关键词",
                    "points": [{"icon": "🔹", "text": k["text"]} for k in kws],
                }

        return dialogue
