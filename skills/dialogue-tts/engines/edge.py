"""Edge TTS 引擎（免费，无需 API Key）"""
import os
from pathlib import Path

import edge_tts

from .base import TTSEngine


# 默认音色（可被环境变量覆盖）
DEFAULT_VOICES = {
    "bunny": "zh-CN-XiaoxiaoNeural",   # 小白：甜美女声
    "fox":   "zh-CN-YunxiNeural",       # 大橘：清晰男声
}
# 更多可用声音参考: https://docs.microsoft.com/zh-cn/azure/cognitive-services/speech-service/language-support


class EdgeTTSEngine(TTSEngine):
    """使用 Microsoft Edge TTS（免费）的引擎"""

    def __init__(self):
        self.voices = {
            "bunny": os.getenv("VOICE_BUNNY", DEFAULT_VOICES["bunny"]),
            "fox":   os.getenv("VOICE_FOX",   DEFAULT_VOICES["fox"]),
        }

    async def synthesize(self, text: str, speaker: str, output_path: Path) -> Path:
        voice = self.voices.get(speaker, DEFAULT_VOICES["fox"])
        # Edge TTS 输出为 MP3
        mp3_path = output_path.with_suffix(".mp3")
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(str(mp3_path))
        return mp3_path
