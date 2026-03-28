// 结尾总结卡 - 纯内容版，不显示角色头像
import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Ending } from '../types';
import type { Theme } from '../themes';

interface EndingCardProps {
  ending: Ending;
  theme: Theme;
}

export const EndingCard: React.FC<EndingCardProps> = ({ ending, theme }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgOpacity    = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleScale   = spring({ fps, frame: frame - 4,  config: { damping: 12, stiffness: 200 } });
  const titleOpacity = interpolate(frame, [4, 18],   [0, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      background: `rgba(8,6,20,${bgOpacity})`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 60px',
      gap: 0,
    }}>
      {/* 背景紫色光晕 */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 48%, rgba(140,70,220,0.16) 0%, transparent 55%)',
        pointerEvents: 'none',
      }} />

      {/* 装饰横线 */}
      <div style={{
        opacity: titleOpacity,
        width: 80, height: 4, borderRadius: 2,
        background: 'linear-gradient(90deg, #00FFD1, #B06EFF)',
        marginBottom: 36,
        boxShadow: '0 0 18px rgba(0,255,209,0.7)',
      }} />

      {/* 标题 */}
      <div style={{
        fontSize: 72, fontWeight: 900, color: '#FFF',
        fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
        transform: `scale(${titleScale})`, opacity: titleOpacity,
        marginBottom: 56,
        textShadow: '0 0 50px rgba(180,100,255,0.8)',
        letterSpacing: 2,
      }}>
        {ending.title}
      </div>

      {/* 知识点列表 */}
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 28,
        marginBottom: 80, width: '100%',
        alignItems: 'flex-start',
      }}>
        {(ending.points ?? []).map((pt, i) => {
          const o = interpolate(frame, [18 + i * 8, 30 + i * 8], [0, 1], { extrapolateRight: 'clamp' });
          const x = interpolate(frame, [18 + i * 8, 30 + i * 8], [-50, 0], { extrapolateRight: 'clamp' });
          return (
            <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: o, transform: `translateX(${x}px)` }}>
              {/* 彩色序号圆 */}
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #00FFD1, #B06EFF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 900, color: '#0B0E1A',
                boxShadow: '0 0 16px rgba(0,255,209,0.6)',
              }}>
                {i + 1}
              </div>
              <div style={{
                fontSize: 42, color: '#E8E0FF',
                fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
                fontWeight: 600, lineHeight: 1.4,
              }}>
                {pt}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA 按钮 */}
      {(() => {
        const o = interpolate(frame, [50, 64], [0, 1], { extrapolateRight: 'clamp' });
        const y = interpolate(frame, [50, 64], [24, 0], { extrapolateRight: 'clamp' });
        return (
          <div style={{
            opacity: o, transform: `translateY(${y}px)`,
            background: 'linear-gradient(135deg, rgba(176,110,255,0.3), rgba(0,255,209,0.25))',
            border: '2px solid rgba(0,255,209,0.6)',
            borderRadius: 999,
            padding: '20px 60px',
            fontSize: 34, color: '#FFF',
            fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
            fontWeight: 700, textAlign: 'center',
            boxShadow: '0 0 32px rgba(0,255,209,0.25)',
            letterSpacing: 1,
          }}>
            {ending.cta}
          </div>
        );
      })()}
    </AbsoluteFill>
  );
};
