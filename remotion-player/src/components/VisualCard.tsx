/**
 * VisualCard v4 - 内容垂直居中，更鲜明视觉效果
 * 布局：top=240(fox头像下方) ~ bottom=120，内部 flexbox 垂直居中
 */
import React from 'react';
import {
  AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig,
} from 'remotion';
import type {
  VisualCard as VisualCardType,
  VisualCardFlowSteps, VisualCardConceptBox,
  VisualCardBulletPoints, VisualCardComparison,
} from '../types';

const ACCENT = '#FFA03C';
const ACCENT_L = '#FFD080';
const BG_CARD = 'rgba(255,160,60,0.06)';

// 动画工具
function useFadeIn(frame: number, delay: number, dy = 30) {
  return {
    opacity: interpolate(frame - delay, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    transform: `translateY(${interpolate(frame - delay, [0, 16], [dy, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
  };
}
function useSlideIn(frame: number, delay: number, dx = -60) {
  return {
    opacity: interpolate(frame - delay, [0, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    transform: `translateX(${interpolate(frame - delay, [0, 16], [dx, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
  };
}
function useSpring(frame: number, delay: number, fps: number) {
  return spring({ fps, frame: Math.max(0, frame - delay), config: { damping: 12, stiffness: 220 } });
}

// 标题
const Title: React.FC<{ text: string; frame: number }> = ({ text, frame }) => (
  <div style={{ ...useFadeIn(frame, 0, -20), marginBottom: 40 }}>
    <div style={{
      width: 44, height: 4, borderRadius: 2, marginBottom: 18,
      background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_L})`,
      boxShadow: `0 0 18px rgba(255,160,60,0.8)`,
    }} />
    <div style={{
      fontSize: 52, fontWeight: 900, color: '#FFF', letterSpacing: 2,
      fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
      textShadow: '0 0 24px rgba(255,160,60,0.4)',
    }}>{text}</div>
  </div>
);

// ── 1. FlowSteps ────────────────────────────────────────────
const FlowStepsCard: React.FC<{ card: VisualCardFlowSteps; frame: number; fps: number }> = ({ card, frame, fps }) => (
  <>
    <Title text={card.title} frame={frame} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {card.steps.map((step, i) => {
        const sc = useSpring(frame, 6 + i * 12, fps);
        const sl = useSlideIn(frame, 6 + i * 12);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, ...sl }}>
            {/* 编号圆 - 鲜明橙色 */}
            <div style={{
              width: 90, height: 90, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${ACCENT} 0%, #FF6B1A 100%)`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 28px rgba(255,140,30,0.7), 0 4px 16px rgba(0,0,0,0.5)`,
              transform: `scale(${sc})`,
              fontSize: 32,
            }}>
              {step.icon || String(i + 1)}
            </div>
            {/* 连接线（竖线） */}
            <div style={{ flex: 1 }}>
              {/* 步骤标题 */}
              <div style={{
                fontSize: 42, fontWeight: 800,
                color: i === 0 ? ACCENT_L : '#F4EEFF',
                fontFamily: "'Noto Sans SC', sans-serif",
                marginBottom: step.desc ? 8 : 0,
              }}>
                {step.label}
              </div>
              {/* 步骤说明 */}
              {step.desc && (
                <div style={{
                  fontSize: 30, color: 'rgba(240,234,255,0.65)',
                  fontFamily: "'Noto Sans SC', sans-serif",
                }}>
                  {step.desc}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </>
);

// ── 2. ConceptBox ───────────────────────────────────────────
const ConceptBoxCard: React.FC<{ card: VisualCardConceptBox; frame: number; fps: number }> = ({ card, frame, fps }) => {
  const sc = useSpring(frame, 0, fps);
  const fi = useFadeIn(frame, 0, 0);
  return (
    <>
      {/* 超大术语 */}
      <div style={{
        ...fi,
        textAlign: 'center',
        fontSize: 120, fontWeight: 900, lineHeight: 1,
        color: ACCENT,
        fontFamily: "'Noto Sans SC', sans-serif",
        letterSpacing: 4,
        textShadow: `0 0 80px rgba(255,160,60,0.6)`,
        transform: `${fi.transform} scale(${sc})`,
        marginBottom: 36,
      }}>{card.term}</div>

      {/* 定义框 */}
      <div style={{
        ...useFadeIn(frame, 16),
        background: 'rgba(255,160,60,0.10)',
        border: `2px solid rgba(255,160,60,0.45)`,
        borderRadius: 22, padding: '30px 36px', marginBottom: 24,
        boxShadow: `0 0 40px rgba(255,160,60,0.08)`,
      }}>
        <div style={{
          fontSize: 40, fontWeight: 600, color: '#F0EAFF', lineHeight: 1.6,
          fontFamily: "'Noto Sans SC', sans-serif",
          textAlign: 'center',
        }}>{card.definition}</div>
      </div>

      {/* 例子 */}
      {card.example && (
        <div style={{
          ...useFadeIn(frame, 28),
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
        }}>
          <span style={{ fontSize: 36 }}>💡</span>
          <div style={{
            fontSize: 34, color: 'rgba(240,234,255,0.7)',
            fontFamily: "'Noto Sans SC', sans-serif",
            fontStyle: 'italic',
          }}>{card.example}</div>
        </div>
      )}
    </>
  );
};

// ── 3. BulletPoints ─────────────────────────────────────────
const BulletPointsCard: React.FC<{ card: VisualCardBulletPoints; frame: number; fps: number }> = ({ card, frame, fps }) => (
  <>
    <Title text={card.title} frame={frame} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {card.points.map((pt, i) => {
        const sc = useSpring(frame, 6 + i * 14, fps);
        const sl = useSlideIn(frame, 6 + i * 14, -80);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, ...sl }}>
            {/* 大图标圆 */}
            <div style={{
              width: 86, height: 86, borderRadius: '50%', flexShrink: 0,
              background: `rgba(255,160,60,0.12)`,
              border: `2.5px solid rgba(255,160,60,0.6)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, transform: `scale(${sc})`,
              boxShadow: `0 0 20px rgba(255,160,60,0.25)`,
            }}>{pt.icon}</div>
            <div style={{
              fontSize: 42, fontWeight: 700, color: '#F0EAFF', lineHeight: 1.4,
              fontFamily: "'Noto Sans SC', sans-serif",
            }}>{pt.text}</div>
          </div>
        );
      })}
    </div>
  </>
);

// ── 4. Comparison ───────────────────────────────────────────
const ComparisonCard: React.FC<{ card: VisualCardComparison; frame: number; fps: number }> = ({ card, frame }) => {
  const lx = interpolate(frame - 6, [0, 18], [-100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rx = interpolate(frame - 6, [0, 18], [100,  0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = interpolate(frame - 6, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const col = (label: string, items: string[], isAfter: boolean) => (
    <div style={{
      flex: 1, opacity: op,
      transform: `translateX(${isAfter ? rx : lx}px)`,
    }}>
      <div style={{
        background: isAfter ? 'rgba(0,220,160,0.08)' : 'rgba(255,70,70,0.08)',
        border: `2px solid ${isAfter ? 'rgba(0,220,160,0.5)' : 'rgba(255,80,80,0.5)'}`,
        borderRadius: 20, padding: '28px 24px', height: '100%',
        boxShadow: isAfter ? '0 0 30px rgba(0,220,160,0.08)' : '0 0 30px rgba(255,80,80,0.08)',
      }}>
        <div style={{
          fontSize: 34, fontWeight: 800,
          color: isAfter ? '#00DCA0' : '#FF6B6B',
          fontFamily: "'Noto Sans SC', sans-serif",
          marginBottom: 20,
        }}>{label}</div>
        {items.map((it, j) => (
          <div key={j} style={{
            fontSize: 30, color: isAfter ? 'rgba(160,255,230,0.85)' : 'rgba(255,190,190,0.85)',
            fontFamily: "'Noto Sans SC', sans-serif",
            lineHeight: 1.6, marginBottom: 12,
          }}>• {it}</div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Title text={card.title} frame={frame} />
      <div style={{ display: 'flex', gap: 24, flex: 1 }}>
        {col(card.before.label, card.before.items, false)}
        {col(card.after.label,  card.after.items,  true)}
      </div>
    </>
  );
};

// ── 主入口 ────────────────────────────────────────────────
export const VisualCard: React.FC<{ card: VisualCardType }> = ({ card }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (card.type === 'question') return null;

  const outerOp = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const outerSc = spring({ fps, frame, config: { damping: 14, stiffness: 160 } });

  const renderInner = () => {
    switch (card.type) {
      case 'flow_steps':    return <FlowStepsCard    card={card} frame={frame} fps={fps} />;
      case 'concept_box':   return <ConceptBoxCard   card={card} frame={frame} fps={fps} />;
      case 'bullet_points': return <BulletPointsCard card={card} frame={frame} fps={fps} />;
      case 'comparison':    return <ComparisonCard   card={card} frame={frame} fps={fps} />;
      default: return null;
    }
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/*
        布局原则：
        - Fox 角色在右上角 (x≈870, y≈24, size=180)，只占右上 204x204 区域
        - 内容区：全屏高度 flex 居中，避开角色核心区域
      */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '220px 56px 140px',  // 上 220 给 fox 留空间，左右对称
        opacity: outerOp,
        transform: `scale(${outerSc})`,
        transformOrigin: 'center center',
      }}>
        {/* 内容面板 - 无边框、半透明深色毛玻璃 */}
        <div style={{
          width: '100%',
          background: 'rgba(8, 4, 22, 0.82)',
          borderRadius: 32,
          padding: '52px 52px',
          backdropFilter: 'blur(24px)',
          boxShadow: `
            0 0 80px rgba(255,160,60,0.10),
            0 0 0 1px rgba(255,255,255,0.06),
            0 32px 80px rgba(0,0,0,0.6)
          `,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* 右上角蜂巢装饰圆 */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 180, height: 180, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,160,60,0.15) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: -30,
            width: 120, height: 120, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,100,30,0.10) 0%, transparent 70%)',
          }} />

          {renderInner()}
        </div>
      </div>
    </AbsoluteFill>
  );
};
