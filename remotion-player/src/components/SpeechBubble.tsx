// 对话气泡 - 无边框、无名称标签，纯沉浸式大字展示
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface SpeechBubbleProps {
  text: string;
  speaker: 'bunny' | 'fox';
}

// 仅用颜色区分角色，不用名称标签
const ACCENT = {
  bunny: '#FF9EC8',
  fox:   '#FFA03C',
};

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ text, speaker }) => {
  const frame = useCurrentFrame();

  // 整体淡入 + 上移
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const slideY  = interpolate(frame, [0, 14], [30,  0], { extrapolateRight: 'clamp' });

  // 打字机：每帧 1.6 个字符
  const visible   = text.slice(0, Math.floor(frame * 1.6));
  const showCursor = visible.length < text.length;
  const accent = ACCENT[speaker];

  /*
   * 布局：气泡垂直居中在屏幕中间区域（y=680~1380）
   * 角色图片在角落（bunny=左下 y≈1480, fox=右上 y≈80）
   * 两者不重叠：气泡统一放在 y=720~1360 中央带
   */
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute',
        left: 52,
        right: 52,
        top: 720,        // 屏幕中央固定位置，兔子和狐狸共用同一区域
        opacity,
        transform: `translateY(${slideY}px)`,
      }}>
        {/* 极细顶部强调线，用颜色暗示说话人，不用名字标签 */}
        <div style={{
          width: 56,
          height: 4,
          borderRadius: 2,
          background: accent,
          marginBottom: 20,
          boxShadow: `0 0 14px ${accent}`,
        }} />

        {/* 台词区 - 无边框，深色半透明背景，大字清晰 */}
        <div style={{
          background: 'rgba(8, 5, 22, 0.78)',
          borderRadius: 24,
          padding: '32px 40px',
          backdropFilter: 'blur(18px)',
          // 仅用极细内光边代替硬边框
          boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.07), 0 16px 48px rgba(0,0,0,0.6)`,
        }}>
          <div style={{
            fontSize: 52,
            fontWeight: 700,
            color: '#F0EAFF',
            fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
            lineHeight: 1.65,
            letterSpacing: 0.5,
          }}>
            <RichText text={visible} accent={accent} />
            {showCursor && (
              <span style={{
                display: 'inline-block',
                width: 3,
                height: '0.85em',
                background: accent,
                marginLeft: 4,
                verticalAlign: 'middle',
                opacity: frame % 6 < 3 ? 1 : 0,
                borderRadius: 2,
              }} />
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// 引号/书名号内容高亮
const RichText: React.FC<{ text: string; accent: string }> = ({ text, accent }) => {
  const parts = text.split(/(["「『《【〔].*?["」』》】〕])/g);
  return (
    <>
      {parts.map((p, i) =>
        /^["「『《【〔]/.test(p)
          ? <span key={i} style={{ color: accent, fontWeight: 900 }}>{p}</span>
          : <span key={i}>{p}</span>
      )}
    </>
  );
};
