// 聚焦光晕 v2 - 支持主题颜色
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import type { Theme } from '../themes';

interface FocusGlowProps {
  speaker: 'bunny' | 'fox';
  theme: Theme;
  isLandscape?: boolean;
}

export const FocusGlow: React.FC<FocusGlowProps> = ({ speaker, theme }) => {
  const frame = useCurrentFrame();

  // 渐变淡入
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // 呼吸脉冲
  const pulse = 0.88 + Math.sin(frame * 0.07) * 0.12;

  const glow = speaker === 'bunny' ? theme.bunnyGlow : theme.foxGlow;
  const isBunny = speaker === 'bunny';

  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      {/* 主光晕 */}
      <div style={{
        position: 'absolute',
        ...(isBunny ? { left: -200, bottom: -200 } : { right: -200, top: -200 }),
        width: 720, height: 720, borderRadius: '50%',
        background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
        transform: `scale(${pulse})`, filter: 'blur(30px)',
      }} />
      {/* 副光晕 */}
      <div style={{
        position: 'absolute',
        ...(isBunny ? { left: -60, bottom: -60 } : { right: -60, top: -60 }),
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${glow} 0%, transparent 60%)`,
        filter: 'blur(20px)',
      }} />
    </AbsoluteFill>
  );
};
