// 狐狸 SVG 角色 - 大橘🦊
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface FoxSVGProps {
  state: 'idle' | 'curious' | 'explaining' | 'thinking' | 'celebrating';
}

export const FoxSVG: React.FC<FoxSVGProps> = ({ state }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isTalking = state === 'explaining' || state === 'thinking';
  const mouthOpen = isTalking ? Math.abs(Math.sin(frame / fps * Math.PI * 5)) * 16 : 0;
  const tailSway = Math.sin(frame / fps * Math.PI * 1.5) * 12;
  const floatY = Math.sin(frame / fps * Math.PI * 0.9 + 1) * 5;
  const eyebrowY = state === 'explaining' ? 108 : state === 'thinking' ? 104 : 110;
  const jumpY = state === 'celebrating' ? Math.abs(Math.sin(frame / fps * Math.PI * 3.2)) * -45 : 0;

  return (
    <svg
      width="240"
      height="340"
      viewBox="0 0 240 340"
      style={{ transform: `translateY(${floatY + jumpY}px) scaleX(-1)`, overflow: 'visible' }}
      // scaleX(-1) 让狐狸面朝左（朝向小白）
    >
      {/* 耳朵（左） */}
      <polygon points="60,80 40,20 88,68" fill="#E8813A" />
      <polygon points="65,78 50,30 84,70" fill="#FFF0E0" />
      {/* 耳朵（右） */}
      <polygon points="155,78 152,18 188,72" fill="#E8813A" />
      <polygon points="158,76 157,30 183,70" fill="#FFF0E0" />
      {/* 头部 */}
      <ellipse cx={120} cy={148} rx={76} ry={72} fill="#E8813A" />
      {/* 白色面部 */}
      <ellipse cx={120} cy={155} rx={50} ry={55} fill="#FFF0E0" />
      {/* 眉毛（左） */}
      <path d={`M 90 ${eyebrowY} Q 103 ${eyebrowY - 8} 108 ${eyebrowY + 2}`}
        stroke="#c4602a" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* 眉毛（右） */}
      <path d={`M 132 ${eyebrowY + 2} Q 137 ${eyebrowY - 8} 150 ${eyebrowY}`}
        stroke="#c4602a" strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* 眼睛（左） */}
      <ellipse cx={100} cy={126} rx={13} ry={14} fill="#2a1a0a" />
      <circle cx={96} cy={122} r={4} fill="white" opacity={0.9} />
      <ellipse cx={100} cy={125} rx={5} ry={6} fill="#8B4513" opacity={0.6} />
      {/* 眼睛（右） */}
      <ellipse cx={140} cy={126} rx={13} ry={14} fill="#2a1a0a" />
      <circle cx={136} cy={122} r={4} fill="white" opacity={0.9} />
      <ellipse cx={140} cy={125} rx={5} ry={6} fill="#8B4513" opacity={0.6} />
      {/* 鼻子 */}
      <ellipse cx={120} cy={148} rx={9} ry={7} fill="#222" />
      {/* 嘴 */}
      <path
        d={`M 100 157 Q 120 ${160 + mouthOpen} 140 157`}
        stroke="#c4602a" strokeWidth={3.5} fill="none" strokeLinecap="round"
      />
      {/* 须 */}
      <line x1={68} y1={150} x2={94} y2={153} stroke="#c4602a" strokeWidth={1.5} opacity={0.6} />
      <line x1={68} y1={160} x2={94} y2={158} stroke="#c4602a" strokeWidth={1.5} opacity={0.6} />
      <line x1={146} y1={153} x2={172} y2={150} stroke="#c4602a" strokeWidth={1.5} opacity={0.6} />
      <line x1={146} y1={158} x2={172} y2={160} stroke="#c4602a" strokeWidth={1.5} opacity={0.6} />
      {/* 身体 */}
      <ellipse cx={120} cy={258} rx={68} ry={78} fill="#E8813A" />
      {/* 肚皮 */}
      <ellipse cx={120} cy={262} rx={42} ry={52} fill="#FFF0E0" />
      {/* 爪子（左） */}
      <ellipse cx={58} cy={270} rx={20} ry={30} fill="#E8813A"
        transform={`rotate(20, 58, 240)`} />
      {/* 爪子（右） */}
      <ellipse cx={182} cy={270} rx={20} ry={30} fill="#E8813A"
        transform={`rotate(-15, 182, 240)`} />
      {/* 尾巴 */}
      <ellipse cx={42} cy={290} rx={32} ry={18} fill="#E8813A"
        transform={`rotate(${tailSway}, 90, 290)`} />
      <ellipse cx={28} cy={292} rx={16} ry={10} fill="white"
        transform={`rotate(${tailSway}, 90, 290)`} />
    </svg>
  );
};
