// CharacterLayer v4 - 更小的圆形头像，在角落安静显示，不遮挡内容
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Exchange } from '../types';

// 更小的尺寸，颜色鲜明的角落显示
const CONFIG = {
  bunny: {
    restX: 24, restY: 1650,   // 左下角
    fromX: -280, fromY: 2100,
    ring: 'linear-gradient(135deg, #FF9EC8 0%, #D466A0 100%)',
    glow: 'rgba(255,100,180,0.55)',
    size: 180,  // 更小
  },
  fox: {
    restX: 870, restY: 24,    // 右上角，更靠角落
    fromX: 1300, fromY: -280,
    ring: 'linear-gradient(135deg, #FFC86A 0%, #FF8C30 100%)',
    glow: 'rgba(255,140,30,0.55)',
    size: 180,  // 更小
  },
} as const;

interface CharacterLayerProps { exchange: Exchange; }

export const CharacterLayer: React.FC<CharacterLayerProps> = ({ exchange }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const speaker = exchange.speaker as 'bunny' | 'fox';
  const cfg = CONFIG[speaker];

  const enter = spring({ fps, frame, config: { damping: 14, stiffness: 160, mass: 0.9 } });
  const exit  = interpolate(frame, [durationInFrames - 12, durationInFrames], [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const x = cfg.fromX + (cfg.restX - cfg.fromX) * enter + (cfg.fromX - cfg.restX) * exit;
  const y = cfg.fromY + (cfg.restY - cfg.fromY) * enter + (cfg.fromY - cfg.restY) * exit;
  const scale = interpolate(exit, [0, 1], [1, 0.4]);
  const breathY = Math.sin(frame * 0.11) * 5;
  const s = cfg.size;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* 外发光 */}
      <div style={{
        position: 'absolute', left: x - 14, top: y + breathY - 14,
        width: s + 28, height: s + 28, borderRadius: '50%',
        background: cfg.glow, filter: 'blur(16px)',
        transform: `scale(${scale})`,
      }} />
      {/* 渐变色环 + 图片 */}
      <div style={{
        position: 'absolute', left: x - 4, top: y + breathY - 4,
        width: s + 8, height: s + 8, borderRadius: '50%',
        background: cfg.ring,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}>
        <div style={{
          position: 'absolute', inset: 4, borderRadius: '50%',
          background: '#0B0E1A',
        }} />
        <div style={{
          position: 'absolute', inset: 7, borderRadius: '50%',
          overflow: 'hidden', background: '#0B0E1A',
        }}>
          <Img
            src={staticFile(`characters/${speaker}.png`)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 10%' }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
