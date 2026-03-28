/**
 * QuestionCard v5 - 接受 theme prop
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Theme } from '../themes';

interface QuestionCardProps {
  text: string;
  theme: Theme;
  isLandscape?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ text, theme, isLandscape = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc      = spring({ fps, frame, config: { damping: 13, stiffness: 190 } });
  const op      = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const floatY  = Math.sin(frame * 0.09) * 10;

  // 竖屏：问题在中上，下留500给bunny；横屏：问题在右侧居中
  const paddingTop    = isLandscape ? 80  : 160;
  const paddingBottom = isLandscape ? 80  : 500;
  const paddingLeft   = isLandscape ? 56  : 56;
  const paddingRight  = isLandscape ? 280 : 56;  // 横屏右侧给 bunny

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
        opacity: op,
        transform: `scale(${sc})`,
        transformOrigin: 'center center',
      }}>
        {/* 思考 emoji */}
        <div style={{
          fontSize: 110, lineHeight: 1, marginBottom: 30,
          transform: `translateY(${floatY}px)`,
          filter: `drop-shadow(0 0 28px ${theme.bunnyGlow})`,
        }}>🤔</div>

        {/* 问题卡 */}
        <div style={{
          width: '100%',
          background: theme.cardBg,
          border: `2px solid ${theme.bunnyGlow}`,
          borderRadius: 28, padding: '38px 44px',
          backdropFilter: 'blur(20px)',
          boxShadow: `0 0 60px ${theme.bunnyGlow}44, 0 0 0 1px rgba(255,255,255,0.05)`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* 顶线 */}
          <div style={{
            width: 48, height: 4, borderRadius: 2, marginBottom: 20,
            background: theme.bunnyGlow,
            boxShadow: `0 0 16px ${theme.bunnyGlow}`,
          }} />
          <div style={{
            fontSize: 58, fontWeight: 800, color: theme.textPrimary, lineHeight: 1.55, letterSpacing: 1,
          }}>{text}</div>
          {/* 装饰圆 */}
          <div style={{
            position: 'absolute', bottom: -24, right: -24, width: 100, height: 100, borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.bunnyGlow}28 0%, transparent 70%)`,
          }} />
        </div>

        {/* 脉冲点 */}
        <div style={{
          marginTop: 26, display: 'flex', gap: 14,
          opacity: interpolate(frame, [10, 20], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%', background: theme.bunnyGlow,
              opacity: 0.4 + i * 0.25,
              transform: `scale(${1 + Math.sin(frame * 0.1 + i * 1.2) * 0.3})`,
              boxShadow: `0 0 10px ${theme.bunnyGlow}`,
            }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
