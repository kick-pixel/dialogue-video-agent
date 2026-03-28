"""
对话视频 Agent 主入口 v2
新增参数: --tts (edge|aliyun)、--ratio (9:16|16:9)、--theme

优先级（高→低）:
  CLI --ratio/--theme  >  环境变量 VIDEO_RATIO/VIDEO_THEME  >  默认值
"""
import argparse
import asyncio
import json
import os
import sys
import importlib.util
from pathlib import Path

from dotenv import load_dotenv
load_dotenv()


def load_skill(skill_dir_name: str, class_name: str):
    """
    从 skills/<dir>/skill.py 动态加载 Skill 类。
    解决目录名含连字符(-)无法直接 import 的问题。
    """
    skill_path = Path(__file__).parent / "skills" / skill_dir_name / "skill.py"
    spec = importlib.util.spec_from_file_location(f"skill_{skill_dir_name}", skill_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return getattr(module, class_name)


VALID_RATIOS = {"9:16", "16:9"}
VALID_THEMES = {"tech-dark", "neon", "light"}


async def run_agent(
    doc_path: str,
    output_dir: str = "output",
    tts_engine: str | None = None,
    ratio: str | None = None,
    theme: str | None = None,
):
    # 三层优先级: CLI arg > 环境变量 > 默认值
    ratio = ratio or os.getenv("VIDEO_RATIO", "9:16")
    theme = theme or os.getenv("VIDEO_THEME", "tech-dark")
    """端到端运行三个 Skill，将文档转换为对话视频。"""
    doc_path   = Path(doc_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    (output_dir / "audio").mkdir(exist_ok=True)

    if not doc_path.exists():
        print(f"[ERROR] 文档不存在: {doc_path}")
        sys.exit(1)

    # 参数校验
    if ratio not in VALID_RATIOS:
        print(f"[ERROR] --ratio 须为 {VALID_RATIOS}，当前: {ratio}")
        sys.exit(1)
    if theme not in VALID_THEMES:
        print(f"[ERROR] --theme 须为 {VALID_THEMES}，当前: {theme}")
        sys.exit(1)

    doc_content = doc_path.read_text(encoding="utf-8")

    # video_config（传给 Skill 1，写入 meta）
    if ratio == "16:9":
        width, height = 1920, 1080
    else:
        width, height = 1080, 1920

    video_config = {
        "fps":    30,
        "width":  width,
        "height": height,
        "ratio":  ratio,
        "theme":  theme,
    }

    print(f"\n{'='*60}")
    print(f"  对话视频 Agent")
    print(f"  文档:   {doc_path.name}")
    print(f"  比例:   {ratio} ({width}×{height})")
    print(f"  主题:   {theme}")
    print(f"  TTS:    {tts_engine or os.getenv('TTS_ENGINE', 'edge')}")
    print(f"{'='*60}\n")

    # ── Skill 1: 生成对话脚本 ─────────────────────────────────
    print("[1/3] 🤖 LLM 正在分析文档并生成对话脚本...")
    DocDialogueGenSkill = load_skill("doc-dialogue-gen", "DocDialogueGenSkill")
    skill1 = DocDialogueGenSkill()
    dialogue = await skill1.run(
        doc_content=doc_content,
        doc_title=doc_path.stem,
        video_config=video_config,
    )

    dialogue_path = output_dir / "dialogue.json"

    # ── 注入角色图片路径（来自环境变量，fallback 到默认值）────────
    bunny_img = os.getenv("CHARACTER_BUNNY_IMAGE", "characters/bunny.png")
    fox_img   = os.getenv("CHARACTER_FOX_IMAGE",   "characters/fox.png")
    dialogue.setdefault("characters", {})
    dialogue["characters"].setdefault("questioner", {})
    dialogue["characters"].setdefault("answerer",   {})
    dialogue["characters"]["questioner"]["image"] = bunny_img
    dialogue["characters"]["answerer"]["image"]   = fox_img

    with open(dialogue_path, "w", encoding="utf-8") as f:
        json.dump(dialogue, f, ensure_ascii=False, indent=2)
    print(f"    ✅ 已生成 {len(dialogue['exchanges'])} 段对话 → {dialogue_path}\n")


    # ── Skill 2: TTS 配音 ─────────────────────────────────────
    print("[2/3] 🎙️  TTS 正在生成双声道配音...")
    DialogueTTSSkill = load_skill("dialogue-tts", "DialogueTTSSkill")
    skill2 = DialogueTTSSkill(
        audio_dir=str(output_dir / "audio"),
        engine_type=tts_engine,  # None → 读取 TTS_ENGINE 环境变量
    )
    dialogue_with_audio = await skill2.run(dialogue=dialogue)

    dialogue_audio_path = output_dir / "dialogue_with_audio.json"
    with open(dialogue_audio_path, "w", encoding="utf-8") as f:
        json.dump(dialogue_with_audio, f, ensure_ascii=False, indent=2)

    total_sec = sum(ex["audio"]["duration_sec"] for ex in dialogue_with_audio["exchanges"])
    print(f"    ✅ 配音完成，预计时长 {total_sec:.1f}s → {dialogue_audio_path}\n")

    # ── Skill 3: Remotion 渲染 ────────────────────────────────
    print("[3/3] 🎬 Remotion 正在渲染视频...")
    DialogueVideoRenderSkill = load_skill("dialogue-video-render", "DialogueVideoRenderSkill")
    skill3 = DialogueVideoRenderSkill(
        remotion_dir=str(Path(__file__).parent / "remotion-player"),
        output_path=str(output_dir / "final_video.mp4"),
    )
    result = await skill3.run(dialogue_path=str(dialogue_audio_path))

    print(f"\n{'='*60}")
    print(f"  🎉 视频生成完成！")
    print(f"  输出路径: {result['output_path']}")
    print(f"  视频时长: {total_sec:.1f} 秒")
    print(f"{'='*60}\n")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="技术文档 → 双角色对话视频 Agent")
    parser.add_argument("--doc",    required=True, help="技术文档路径 (.md / .txt)")
    parser.add_argument("--output", default="output", help="输出目录（默认: output）")
    parser.add_argument(
        "--tts",
        default=None,
        choices=["edge", "aliyun"],
        help="TTS 引擎（默认读取 TTS_ENGINE 环境变量，fallback: edge）",
    )
    parser.add_argument(
        "--ratio",
        default="9:16",
        choices=["9:16", "16:9"],
        help="视频比例（默认: 9:16 竖屏）",
    )
    parser.add_argument(
        "--theme",
        default="tech-dark",
        choices=["tech-dark", "neon", "light"],
        help="视觉主题（默认: tech-dark）",
    )
    args = parser.parse_args()

    asyncio.run(run_agent(
        doc_path=args.doc,
        output_dir=args.output,
        tts_engine=args.tts,
        ratio=args.ratio,
        theme=args.theme,
    ))
