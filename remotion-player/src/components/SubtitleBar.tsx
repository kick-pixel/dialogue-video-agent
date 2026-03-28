// 字幕条 - 固定在画面底部，毛玻璃效果
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import type { Exchange, DialogueData } from '../types';

interface SubtitleBarProps {
  exchange: Exchange;
  characters: DialogueData['characters'];
}

export const SubtitleBar: React.FC<SubtitleBarProps> = ({ exchange, characters }) => {
  const frame = useCurrentFrame();

  const isQuestioner = exchange.speaker === 'bunny';
  const char = isQuestioner ? characters.questioner : characters.answerer;
  const accentColor = isQuestioner ? '#FFB6C1' : '#00FFD1';
  const emoji = isQuestioner ? '🐰' : '🦊';

  // 从底部滑入
  const translateY = interpolate(frame, [0, 14], [80, 0], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 130,
      background: 'rgba(8,10,20,0.80)',
      backdropFilter: 'blur(16px)',
      borderTop: `1.5px solid ${accentColor}44`,
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      padding: '0 36px',
      transform: `translateY(${translateY}px)`,
      opacity,
      zIndex: 20,
    }}>
      {/* 角色头像圆圈 */}
      <div style={{
        width: 72,
        height: 72,
        borderRadius: '50%',
        border: `3px solid ${accentColor}`,
        boxShadow: `0 0 16px ${accentColor}66`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 38,
        flexShrink: 0,
        background: 'rgba(11,14,26,0.9)',
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {/* 角色名 */}
        <div style={{
          fontSize: 22,
          fontWeight: 700,
          color: accentColor,
          fontFamily: "'Noto Sans SC', sans-serif",
          marginBottom: 4,
        }}>
          {char.name}
        </div>
        {/* 台词（单行省略） */}
        <div style={{
          fontSize: 28,
          color: '#D0D8EC',
          fontFamily: "'Noto Sans SC', sans-serif",
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {exchange.text}
        </div>
      </div>
    </div>
  );
};
