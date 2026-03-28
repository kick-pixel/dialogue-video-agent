"""
阿里云千问 TTS 引擎
文档: https://help.aliyun.com/zh/model-studio/qwen-tts
SDK: dashscope (pip install dashscope)
"""
import os
import urllib.request
from pathlib import Path

from .base import TTSEngine


# 推荐音色（女声-小白，男声-大橘）
DEFAULT_VOICES = {
    "bunny": "Cherry",   # 芊悦：阳光积极、亲切自然小姐姐
    "fox":   "Ethan",    # 晨煦：阳光温暖，活力朝气男生
}

# 可选女声: Cherry(芊悦), Serena(苏瑶/温柔), Mia(乖小妹), Bunny(萌小姬), Chelsie(千雪/二次元)
# 可选男声: Ethan(晨煦), Moon(月白/帅气), Kai(凯), Elias(墨讲师), Nofish(不吃鱼)

ALIYUN_BASE_URL = "https://dashscope.aliyuncs.com/api/v1"


class AliyunTTSEngine(TTSEngine):
    """
    阿里云千问 TTS 引擎。
    使用 dashscope.MultiModalConversation.call() 非流式合成，
    从返回 URL 下载 WAV 文件到本地。
    """

    def __init__(self):
        self.api_key = os.getenv("DASHSCOPE_API_KEY")
        if not self.api_key:
            raise EnvironmentError(
                "使用阿里云 TTS 需要设置环境变量 DASHSCOPE_API_KEY。\n"
                "获取 API Key: https://bailian.console.aliyun.com/"
            )

        self.model = os.getenv("ALIYUN_TTS_MODEL", "qwen3-tts-flash")
        self.voices = {
            "bunny": os.getenv("ALIYUN_VOICE_BUNNY", DEFAULT_VOICES["bunny"]),
            "fox":   os.getenv("ALIYUN_VOICE_FOX",   DEFAULT_VOICES["fox"]),
        }

    async def synthesize(self, text: str, speaker: str, output_path: Path) -> Path:
        """
        调用阿里云千问 TTS API，下载返回的 WAV 音频文件。
        """
        import asyncio

        voice = self.voices.get(speaker, DEFAULT_VOICES["fox"])
        wav_path = output_path.with_suffix(".wav")

        # 在线程池中执行同步 SDK 调用（SDK 不支持 async）
        audio_url = await asyncio.get_event_loop().run_in_executor(
            None, self._call_api, text, voice
        )

        # 下载音频文件
        await asyncio.get_event_loop().run_in_executor(
            None, self._download, audio_url, wav_path
        )

        return wav_path

    def _call_api(self, text: str, voice: str) -> str:
        """同步调用 DashScope API，返回音频 URL。"""
        import dashscope
        dashscope.base_http_api_url = ALIYUN_BASE_URL

        response = dashscope.MultiModalConversation.call(
            model=self.model,
            api_key=self.api_key,
            text=text,
            voice=voice,
            language_type="Chinese",
            stream=False,
        )

        # 提取音频 URL
        try:
            audio_url = response.output.audio.url
        except AttributeError:
            raise RuntimeError(
                f"阿里云 TTS 返回格式异常: {response}\n"
                f"请检查 DASHSCOPE_API_KEY 是否正确。"
            )

        if not audio_url:
            raise RuntimeError(f"阿里云 TTS 返回了空的音频 URL: {response}")

        return audio_url

    def _download(self, url: str, output_path: Path) -> None:
        """下载音频文件到本地（WAV 格式，URL 24小时有效）。"""
        urllib.request.urlretrieve(url, str(output_path))
