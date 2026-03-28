"""
Skill 2: dialogue-tts
使用 Edge TTS 为每条 exchange 生成配音，并测量时长
"""
import asyncio
import math
import os
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3


# 角色到音色的映射
VOICE_MAP = {
    "bunny": "zh-CN-XiaoxiaoNeural",   # 小白：甜美女声
    "fox":   "zh-CN-YunxiNeural",       # 大橘：清晰男声
}

FPS = 30  # 视频帧率


def get_audio_duration_sec(filepath: str) -> float:
    """使用 mutagen 读取 MP3 时长（秒）"""
    try:
        audio = MP3(filepath)
        return audio.info.length
    except Exception:
        # fallback: 按文件大小估算（128kbps）
        size = os.path.getsize(filepath)
        return size / (128 * 1024 / 8)


class DialogueTTSSkill:
    def __init__(self, audio_dir: str = "output/audio"):
        self.audio_dir = Path(audio_dir)
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    async def _synthesize_one(self, exchange: dict) -> dict:
        """为单条 exchange 生成音频，返回带 audio 字段的 exchange"""
        ex_id = exchange["id"]
        speaker = exchange["speaker"]
        text = exchange["text"]
        voice = VOICE_MAP.get(speaker, "zh-CN-YunxiNeural")

        audio_path = self.audio_dir / f"{ex_id}.mp3"

        # 生成音频
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(audio_path))

        # 测量时长，多加 10 帧缓冲避免音频被截断
        duration_sec = get_audio_duration_sec(str(audio_path))
        duration_frames = math.ceil(duration_sec * FPS) + 10

        print(f"    [{ex_id}] {speaker}: {text[:20]}... → {duration_sec:.2f}s ({duration_frames}f)")

        return {
            **exchange,
            "audio": {
                "file": str(audio_path.resolve()),
                "duration_sec": round(duration_sec, 3),
                "duration_frames": duration_frames,
            },
        }

    async def run(self, dialogue: dict) -> dict:
        """
        为所有 exchanges 生成配音。
        返回带 audio 字段的完整 dialogue dict。
        """
        exchanges = dialogue.get("exchanges", [])

        # 并发生成所有配音
        tasks = [self._synthesize_one(ex) for ex in exchanges]
        enriched_exchanges = await asyncio.gather(*tasks)

        # 计算总帧数
        total_frames = sum(ex["audio"]["duration_frames"] for ex in enriched_exchanges)
        total_sec = sum(ex["audio"]["duration_sec"] for ex in enriched_exchanges)

        # 加上结尾卡时长
        ending_frames = dialogue.get("ending", {}).get("duration_frames", 90)
        total_frames += ending_frames

        return {
            **dialogue,
            "meta": {
                **dialogue.get("meta", {}),
                "total_frames": total_frames,
                "total_duration_sec": round(total_sec, 2),
            },
            "exchanges": list(enriched_exchanges),
        }
