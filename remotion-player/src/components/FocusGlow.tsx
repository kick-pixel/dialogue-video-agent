// 聚焦光晕 - 根据说话人在对应角落渲染大光晕
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

interface FocusGlowProps {
  speaker: 'bunny' | 'fox';
}

export const FocusGlow: React.FC<FocusGlowProps> = ({ speaker }) => {
  const frame = useCurrentFrame();

  // 渐变淡入
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // 呼吸脉冲
  const pulse = 0.88 + Math.sin(frame * 0.07) * 0.12;

  if (speaker === 'bunny') {
    // 小白：左下角 粉色光晕
    return (
      <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
        {/* 主光晕 */}
        <div style={{
          position: 'absolute',
          left: -200,
          bottom: -200,
          width: 720,
          height: 720,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,100,180,0.22) 0%, rgba(180,60,130,0.10) 45%, transparent 70%)',
          transform: `scale(${pulse})`,
          filter: 'blur(30px)',
        }} />
        {/* 副光晕（更亮的核心） */}
        <div style={{
          position: 'absolute',
          left: -60,
          bottom: -60,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,160,210,0.20) 0%, transparent 60%)',
          filter: 'blur(20px)',
        }} />
        {/* 顶部边缘暗色过渡 */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, rgba(8,6,18,0.5) 0%, transparent 40%, transparent 65%, rgba(8,6,18,0.3) 100%)',
        }} />
      </AbsoluteFill>
    );
  }

  // 大橘：右上角 橙色光晕
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      {/* 主光晕 */}
      <div style={{
        position: 'absolute',
        right: -200,
        top: -200,
        width: 720,
        height: 720,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,140,30,0.22) 0%, rgba(200,100,20,0.10) 45%, transparent 70%)',
        transform: `scale(${pulse})`,
        filter: 'blur(30px)',
      }} />
      {/* 副光晕 */}
      <div style={{
        position: 'absolute',
        right: -60,
        top: -60,
        width: 400,
        height: 400,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,180,80,0.18) 0%, transparent 60%)',
        filter: 'blur(20px)',
      }} />
      {/* 底部边缘暗色过渡 */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(0deg, rgba(8,6,18,0.5) 0%, transparent 40%, transparent 65%, rgba(8,6,18,0.3) 100%)',
      }} />
    </AbsoluteFill>
  );
};
