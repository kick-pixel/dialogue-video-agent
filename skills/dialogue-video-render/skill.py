"""
Skill 3: dialogue-video-render
调用 Remotion CLI 将 dialogue_with_audio.json 渲染为 MP4
"""
import asyncio
import copy
import json
import shutil
import tempfile
from pathlib import Path


class DialogueVideoRenderSkill:
    def __init__(self, remotion_dir: str, output_path: str = "output/final_video.mp4"):
        self.remotion_dir = Path(remotion_dir)
        self.output_path = Path(output_path)

    async def run(self, dialogue_path: str) -> dict:
        """
        使用 Remotion 渲染视频。
        
        关键：Remotion CLI 使用 Chrome Headless，浏览器安全策略禁止 file:// 协议。
        解决方案：将音频文件复制到 remotion-player/public/audio/，
        通过 Remotion 内置 HTTP 服务（staticFile）提供访问。
        
        workflow:
          1. 复制 MP3 到 public/audio/ 目录
          2. props 中存储相对路径 "audio/filename.mp3"（供 staticFile() 使用）
          3. TSX 中用 staticFile(src) 加载，Remotion 自动通过内部 HTTP 提供
        """
        dialogue_path = Path(dialogue_path)

        with open(dialogue_path, "r", encoding="utf-8") as f:
            props_data = json.load(f)

        # ── 复制音频到 public/audio/ ──────────────────────────────
        public_audio_dir = self.remotion_dir / "public" / "audio"
        public_audio_dir.mkdir(parents=True, exist_ok=True)

        props_patched = copy.deepcopy(props_data)
        for ex in props_patched.get("exchanges", []):
            audio = ex.get("audio", {})
            file_path = audio.get("file", "")
            if not file_path:
                continue

            # 相对路径以 dialogue_path 所在目录（output/）为根解析
            src = dialogue_path.parent / file_path
            if not src.exists():
                print(f"    [警告] 音频文件不存在: {src}")
                continue

            # 复制到 public/audio/ 目录
            dst = public_audio_dir / src.name
            shutil.copy2(src, dst)

            # props 里改为相对路径，供 staticFile("audio/xxx.mp3") 使用
            audio["file"] = f"audio/{src.name}"

        # ── 写入临时 props 文件 ───────────────────────────────────
        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".json", delete=False, encoding="utf-8"
        ) as tmp:
            json.dump(props_patched, tmp, ensure_ascii=False)
            tmp_props_path = tmp.name

        # Windows 上 npx 是 npx.cmd，需要通过 shell 调用
        props_path_fwd = tmp_props_path.replace("\\", "/")
        output_fwd = str(self.output_path.resolve()).replace("\\", "/")
        shell_cmd = (
            f'npx remotion render DialogueVideo '
            f'"{output_fwd}" '
            f'--props "{props_path_fwd}"'
        )

        print(f"    执行: npx remotion render DialogueVideo → {self.output_path.name}")
        print(f"    音频已复制到: {public_audio_dir}")
        proc = None
        try:
            proc = await asyncio.create_subprocess_shell(
                shell_cmd,
                cwd=str(self.remotion_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
            stdout, _ = await proc.communicate()
        finally:
            Path(tmp_props_path).unlink(missing_ok=True)

        output_text = stdout.decode("utf-8", errors="replace") if stdout else ""

        if proc is None or proc.returncode != 0:
            raise RuntimeError(
                f"Remotion 渲染失败 (exit {getattr(proc, 'returncode', '?')}):\n"
                f"{output_text[-3000:]}"   # 只显示最后 3000 字符
            )

        return {
            "output_path": str(self.output_path.resolve()),
            "success": True,
        }
