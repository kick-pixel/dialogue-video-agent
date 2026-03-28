// 兔子 SVG 角色 - 小白🐰
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface BunnySVGProps {
  state: 'idle' | 'curious' | 'explaining' | 'thinking' | 'celebrating';
}

export const BunnySVG: React.FC<BunnySVGProps> = ({ state }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isTalking = state === 'curious';
  // 嘴巴开合（sin 波模拟）
  const mouthOpen = isTalking ? Math.abs(Math.sin(frame / fps * Math.PI * 5.5)) * 14 : 0;
  // 耳朵摆动
  const earWiggle = isTalking ? Math.sin(frame / fps * Math.PI * 3) * 6 : Math.sin(frame / fps * Math.PI * 0.8) * 2;
  // 整体浮动
  const floatY = Math.sin(frame / fps * Math.PI * 1.2) * 6;
  // 眼睛：thinking 时向上看
  const eyeY = state === 'thinking' ? 110 : 118;
  // celebrating：跳跃
  const jumpY = state === 'celebrating' ? Math.abs(Math.sin(frame / fps * Math.PI * 3)) * -40 : 0;

  return (
    <svg
      width="220"
      height="320"
      viewBox="0 0 220 320"
      style={{ transform: `translateY(${floatY + jumpY}px)`, overflow: 'visible' }}
    >
      {/* 左耳 */}
      <ellipse
        cx={75} cy={60} rx={22} ry={58}
        fill="white" stroke="#f0f0f0" strokeWidth={2}
        transform={`rotate(${-12 + earWiggle}, 75, 120)`}
      />
      <ellipse
        cx={75} cy={62} rx={12} ry={44}
        fill="#FFB6C1"
        transform={`rotate(${-12 + earWiggle}, 75, 120)`}
      />
      {/* 右耳 */}
      <ellipse
        cx={145} cy={60} rx={22} ry={58}
        fill="white" stroke="#f0f0f0" strokeWidth={2}
        transform={`rotate(${12 - earWiggle}, 145, 120)`}
      />
      <ellipse
        cx={145} cy={62} rx={12} ry={44}
        fill="#FFB6C1"
        transform={`rotate(${12 - earWiggle}, 145, 120)`}
      />
      {/* 头部 */}
      <ellipse cx={110} cy={145} rx={72} ry={68} fill="white" stroke="#e8e8e8" strokeWidth={2} />
      {/* 眼睛（左） */}
      <circle cx={86} cy={eyeY} r={12} fill="#222" />
      <circle cx={82} cy={114} r={4} fill="white" />
      {/* 眼睛高光 */}
      <circle cx={86} cy={eyeY} r={4} fill="white" opacity={0.9} />
      {/* 眼睛（右） */}
      <circle cx={134} cy={eyeY} r={12} fill="#222" />
      <circle cx={130} cy={114} r={4} fill="white" />
      <circle cx={134} cy={eyeY} r={4} fill="white" opacity={0.9} />
      {/* 鼻子 */}
      <ellipse cx={110} cy={140} rx={7} ry={5} fill="#FFB6C1" />
      {/* 嘴巴 */}
      <path
        d={`M 92 148 Q 110 ${150 + mouthOpen} 128 148`}
        stroke="#FFB6C1" strokeWidth={3} fill="none" strokeLinecap="round"
      />
      {/* 腮红 */}
      <ellipse cx={78} cy={148} rx={14} ry={9} fill="#FFB6C1" opacity={0.4} />
      <ellipse cx={142} cy={148} rx={14} ry={9} fill="#FFB6C1" opacity={0.4} />
      {/* 身体 */}
      <ellipse cx={110} cy={245} rx={62} ry={72} fill="white" stroke="#e8e8e8" strokeWidth={2} />
      {/* 肚皮 */}
      <ellipse cx={110} cy={248} rx={36} ry={46} fill="#FFF0F5" />
      {/* 爪子（左） */}
      <ellipse cx={52} cy={255} rx={18} ry={28} fill="white" stroke="#e8e8e8" strokeWidth={2}
        transform={`rotate(${state === 'thinking' ? 30 : 15}, 52, 230)`}
      />
      {/* 爪子（右） */}
      <ellipse cx={168} cy={255} rx={18} ry={28} fill="white" stroke="#e8e8e8" strokeWidth={2}
        transform={`rotate(${-15}, 168, 230)`}
      />
    </svg>
  );
};
