"""
对话视频 Agent 主入口
用法: python run_agent.py --doc <文档路径>
"""
import argparse
import asyncio
import json
import os
import sys
import importlib.util
from pathlib import Path

# 加载 .env
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


async def run_agent(doc_path: str, output_dir: str = "output"):
    """
    端到端运行三个 Skill，将文档转换为对话视频。
    """
    doc_path = Path(doc_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(exist_ok=True)
    (output_dir / "audio").mkdir(exist_ok=True)

    if not doc_path.exists():
        print(f"[ERROR] 文档不存在: {doc_path}")
        sys.exit(1)

    doc_content = doc_path.read_text(encoding="utf-8")
    print(f"\n{'='*60}")
    print(f"  对话视频 Agent")
    print(f"  文档: {doc_path.name}")
    print(f"{'='*60}\n")

    # ── Skill 1: 生成对话脚本 ─────────────────────────────────
    print("[1/3] 🤖 LLM 正在分析文档并生成对话脚本...")
    DocDialogueGenSkill = load_skill("doc-dialogue-gen", "DocDialogueGenSkill")
    skill1 = DocDialogueGenSkill()
    dialogue = await skill1.run(doc_content=doc_content, doc_title=doc_path.stem)

    dialogue_path = output_dir / "dialogue.json"
    with open(dialogue_path, "w", encoding="utf-8") as f:
        json.dump(dialogue, f, ensure_ascii=False, indent=2)
    print(f"    ✅ 已生成 {len(dialogue['exchanges'])} 段对话 → {dialogue_path}\n")

    # ── Skill 2: Edge TTS 配音 ────────────────────────────────
    print("[2/3] 🎙️  Edge TTS 正在生成双声道配音...")
    DialogueTTSSkill = load_skill("dialogue-tts", "DialogueTTSSkill")
    skill2 = DialogueTTSSkill(audio_dir=str(output_dir / "audio"))
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
    parser.add_argument("--doc", required=True, help="技术文档路径 (.md / .txt)")
    parser.add_argument("--output", default="output", help="输出目录（默认: output）")
    args = parser.parse_args()

    asyncio.run(run_agent(doc_path=args.doc, output_dir=args.output))
