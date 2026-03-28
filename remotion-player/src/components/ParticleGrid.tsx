// 粒子网格背景 - 流动粒子点 + 连线
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

export const ParticleGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const particles = useMemo<Particle[]>(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 80 }, () => ({
      x: rand() * width,
      y: rand() * height,
      vx: (rand() - 0.5) * 0.6,
      vy: (rand() - 0.5) * 0.6,
      size: rand() * 3 + 1.5,
      opacity: rand() * 0.5 + 0.2,
    }));
  }, [width, height]);

  // 更新粒子位置
  const animated = particles.map((p) => ({
    ...p,
    x: ((p.x + p.vx * frame) % width + width) % width,
    y: ((p.y + p.vy * frame) % height + height) % height,
  }));

  // 连线（距离 < 180px）
  const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
  const maxDist = 180;
  for (let i = 0; i < animated.length; i++) {
    for (let j = i + 1; j < animated.length; j++) {
      const dx = animated[i].x - animated[j].x;
      const dy = animated[i].y - animated[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        lines.push({
          x1: animated[i].x, y1: animated[i].y,
          x2: animated[j].x, y2: animated[j].y,
          opacity: (1 - dist / maxDist) * 0.25,
        });
      }
    }
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg width={width} height={height} style={{ position: 'absolute' }}>
        {/* 连线 */}
        {lines.map((l, i) => (
          <line
            key={i}
            x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke="#00FFD1"
            strokeWidth={0.8}
            strokeOpacity={l.opacity}
          />
        ))}
        {/* 粒子点 */}
        {animated.map((p, i) => (
          <circle
            key={i}
            cx={p.x} cy={p.y} r={p.size}
            fill="#00FFD1"
            fillOpacity={p.opacity}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
