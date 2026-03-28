/**
 * VisualCard v5 - 接受 theme prop，所有颜色从主题系统读取
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
import type { Theme } from '../themes';

// ── 动画工具 ─────────────────────────────────────────────────────────────────
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

// ── 标题组件 ─────────────────────────────────────────────────────────────────
const Title: React.FC<{ text: string; frame: number; theme: Theme }> = ({ text, frame, theme }) => (
  <div style={{ ...useFadeIn(frame, 0, -20), marginBottom: 32 }}>
    <div style={{
      width: 44, height: 4, borderRadius: 2, marginBottom: 16,
      background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
      boxShadow: `0 0 18px ${theme.accent}CC`,
    }} />
    <div style={{
      fontSize: 52, fontWeight: 900, color: theme.textPrimary, letterSpacing: 2,
      textShadow: `0 0 24px ${theme.accent}66`,
    }}>{text}</div>
  </div>
);

// ── 1. FlowSteps ─────────────────────────────────────────────────────────────
const FlowStepsCard: React.FC<{ card: VisualCardFlowSteps; frame: number; fps: number; theme: Theme }> = ({ card, frame, fps, theme }) => (
  <>
    <Title text={card.title} frame={frame} theme={theme} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {card.steps.map((step, i) => {
        const sc = useSpring(frame, 6 + i * 12, fps);
        const sl = useSlideIn(frame, 6 + i * 12);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, ...sl }}>
            <div style={{
              width: 86, height: 86, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentLight}88 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 28px ${theme.accent}99, 0 4px 16px rgba(0,0,0,0.4)`,
              transform: `scale(${sc})`, fontSize: 34,
            }}>{step.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: i === 0 ? theme.accentLight : theme.textPrimary }}>{step.label}</div>
              {step.desc && <div style={{ fontSize: 30, color: theme.textSecondary, marginTop: 4 }}>{step.desc}</div>}
            </div>
          </div>
        );
      })}
    </div>
  </>
);

// ── 2. ConceptBox ─────────────────────────────────────────────────────────────
const ConceptBoxCard: React.FC<{ card: VisualCardConceptBox; frame: number; fps: number; theme: Theme }> = ({ card, frame, fps, theme }) => {
  const sc = useSpring(frame, 0, fps);
  const fi = useFadeIn(frame, 0, 0);
  return (
    <>
      <div style={{
        ...fi, textAlign: 'center', fontSize: 110, fontWeight: 900, lineHeight: 1,
        color: theme.accent, letterSpacing: 4,
        textShadow: `0 0 80px ${theme.accent}99`,
        transform: `${fi.transform} scale(${sc})`, marginBottom: 32,
      }}>{card.term}</div>
      <div style={{
        ...useFadeIn(frame, 16),
        background: `${theme.accent}18`, border: `2px solid ${theme.accent}66`,
        borderRadius: 22, padding: '28px 36px', marginBottom: 20,
      }}>
        <div style={{ fontSize: 40, fontWeight: 600, color: theme.textPrimary, lineHeight: 1.6, textAlign: 'center' }}>{card.definition}</div>
      </div>
      {card.example && (
        <div style={{ ...useFadeIn(frame, 28), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <span style={{ fontSize: 34 }}>💡</span>
          <div style={{ fontSize: 32, color: theme.textSecondary, fontStyle: 'italic' }}>{card.example}</div>
        </div>
      )}
    </>
  );
};

// ── 3. BulletPoints ───────────────────────────────────────────────────────────
const BulletPointsCard: React.FC<{ card: VisualCardBulletPoints; frame: number; fps: number; theme: Theme }> = ({ card, frame, fps, theme }) => (
  <>
    <Title text={card.title} frame={frame} theme={theme} />
    <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
      {card.points.map((pt, i) => {
        const sc = useSpring(frame, 6 + i * 14, fps);
        const sl = useSlideIn(frame, 6 + i * 14, -80);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 26, ...sl }}>
            <div style={{
              width: 84, height: 84, borderRadius: '50%', flexShrink: 0,
              background: `${theme.accent}18`, border: `2.5px solid ${theme.accent}88`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 38, transform: `scale(${sc})`, boxShadow: `0 0 20px ${theme.accent}44`,
            }}>{pt.icon}</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: theme.textPrimary, lineHeight: 1.4 }}>{pt.text}</div>
          </div>
        );
      })}
    </div>
  </>
);

// ── 4. Comparison ─────────────────────────────────────────────────────────────
const ComparisonCard: React.FC<{ card: VisualCardComparison; frame: number; fps: number; theme: Theme }> = ({ card, frame, theme }) => {
  const lx = interpolate(frame - 6, [0, 18], [-100, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const rx = interpolate(frame - 6, [0, 18], [100,  0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const op = interpolate(frame - 6, [0, 14], [0, 1],   { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const col = (label: string, items: string[], isAfter: boolean) => {
    const c = isAfter ? theme.success : theme.danger;
    return (
      <div style={{ flex: 1, opacity: op, transform: `translateX(${isAfter ? rx : lx}px)` }}>
        <div style={{
          background: `${c}14`, border: `2px solid ${c}88`,
          borderRadius: 20, padding: '26px 22px', height: '100%',
          boxShadow: `0 0 30px ${c}14`,
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: c, marginBottom: 18 }}>{label}</div>
          {items.map((it, j) => (
            <div key={j} style={{ fontSize: 28, color: `${c}CC`, lineHeight: 1.6, marginBottom: 10 }}>• {it}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Title text={card.title} frame={frame} theme={theme} />
      <div style={{ display: 'flex', gap: 22, flex: 1 }}>
        {col(card.before.label, card.before.items, false)}
        {col(card.after.label,  card.after.items,  true)}
      </div>
    </>
  );
};

// ── 主入口 ────────────────────────────────────────────────────────────────────
interface VisualCardProps {
  card: VisualCardType;
  theme: Theme;
  isLandscape?: boolean;
}

export const VisualCard: React.FC<VisualCardProps> = ({ card, theme, isLandscape = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (card.type === 'question') return null;

  const outerOp = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });
  const outerSc = spring({ fps, frame, config: { damping: 14, stiffness: 160 } });

  const renderInner = () => {
    switch (card.type) {
      case 'flow_steps':    return <FlowStepsCard    card={card} frame={frame} fps={fps} theme={theme} />;
      case 'concept_box':   return <ConceptBoxCard   card={card} frame={frame} fps={fps} theme={theme} />;
      case 'bullet_points': return <BulletPointsCard card={card} frame={frame} fps={fps} theme={theme} />;
      case 'comparison':    return <ComparisonCard   card={card} frame={frame} fps={fps} theme={theme} />;
      default: return null;
    }
  };

  // 横屏时左移让出角色位置，竖屏时正常居中
  const paddingTop    = isLandscape ? 60  : 220;
  const paddingBottom = isLandscape ? 60  : 140;
  const paddingLeft   = isLandscape ? 280 : 56;   // 横屏左侧给 fox
  const paddingRight  = isLandscape ? 56  : 56;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: `${paddingTop}px ${paddingRight}px ${paddingBottom}px ${paddingLeft}px`,
        opacity: outerOp,
        transform: `scale(${outerSc})`,
        transformOrigin: 'center center',
      }}>
        <div style={{
          width: '100%',
          background: theme.cardBg,
          borderRadius: 32, padding: '48px 48px',
          backdropFilter: 'blur(24px)',
          boxShadow: theme.cardShadow,
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* 装饰圆 */}
          <div style={{
            position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accent}22 0%, transparent 70%)`,
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: -30, width: 120, height: 120, borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.accent}14 0%, transparent 70%)`,
          }} />
          {renderInner()}
        </div>
      </div>
    </AbsoluteFill>
  );
};
