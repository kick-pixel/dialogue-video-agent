/**
 * QuestionCard v4 - 小白提问时，大字问题居中展示，下方给角色留空间
 */
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

interface QuestionCardProps { text: string; }

const ACCENT = '#FF9EC8';
const GLOW   = 'rgba(255,158,200,0.5)';

export const QuestionCard: React.FC<QuestionCardProps> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sc  = spring({ fps, frame, config: { damping: 13, stiffness: 190 } });
  const op  = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });
  const floatY = Math.sin(frame * 0.09) * 10;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/*
        布局：
        - Bunny 角色在左下角 (x=24, y≈1650, size=180), 只占下方
        - 问题卡在屏幕中上方居中显示，padding-bottom 给角色留空间
      */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '160px 56px 500px', // 下方 500 给 bunny 留空间
        opacity: op,
        transform: `scale(${sc})`,
        transformOrigin: 'center center',
      }}>
        {/* emoji */}
        <div style={{
          fontSize: 120, lineHeight: 1,
          marginBottom: 36,
          transform: `translateY(${floatY}px)`,
          filter: `drop-shadow(0 0 28px ${GLOW})`,
        }}>🤔</div>

        {/* 问题卡 */}
        <div style={{
          width: '100%',
          background: 'rgba(8, 4, 22, 0.85)',
          border: `2px solid rgba(255,158,200,0.4)`,
          borderRadius: 28, padding: '40px 48px',
          backdropFilter: 'blur(20px)',
          boxShadow: `0 0 60px rgba(255,100,180,0.12), 0 0 0 1px rgba(255,255,255,0.05)`,
          position: 'relative', overflow: 'hidden',
        }}>
          {/* 粉色顶线 */}
          <div style={{
            width: 48, height: 4, borderRadius: 2,
            background: ACCENT, marginBottom: 22,
            boxShadow: `0 0 16px ${GLOW}`,
          }} />
          {/* 问题大字 */}
          <div style={{
            fontSize: 60, fontWeight: 800, color: '#F2EAFF', lineHeight: 1.55,
            fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
            letterSpacing: 1,
          }}>{text}</div>
          {/* 角落装饰圆 */}
          <div style={{
            position: 'absolute', bottom: -24, right: -24,
            width: 100, height: 100, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(255,158,200,0.15) 0%, transparent 70%)`,
          }} />
        </div>

        {/* 脉冲点 */}
        <div style={{
          marginTop: 28, display: 'flex', gap: 14,
          opacity: interpolate(frame, [10, 20], [0, 1], { extrapolateRight: 'clamp' }),
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: '50%', background: ACCENT,
              opacity: 0.4 + i * 0.25,
              transform: `scale(${1 + Math.sin(frame * 0.1 + i * 1.2) * 0.3})`,
              boxShadow: `0 0 10px ${GLOW}`,
            }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
