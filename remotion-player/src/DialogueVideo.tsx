// 主视频组件 v3 - VisualCard 架构
// 提问方: QuestionCard | 回答方: VisualCard (TTS only for text)
import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
  type CalculateMetadataFunction,
} from 'remotion';
import type { DialogueData } from './types';
import { ParticleGrid }  from './components/ParticleGrid';
import { FocusGlow }     from './components/FocusGlow';
import { CharacterLayer } from './components/CharacterLayer';
import { QuestionCard }  from './components/QuestionCard';
import { VisualCard }    from './components/VisualCard';
import { EndingCard }    from './components/EndingCard';

// 动态计算总帧数（Remotion v4 best practice）
export const calculateDialogueMetadata: CalculateMetadataFunction<Record<string, unknown>> = ({
  props,
}) => {
  const data = props as unknown as DialogueData;
  if (!data?.exchanges?.length) {
    return { durationInFrames: 900, fps: 30, width: 1080, height: 1920 };
  }
  const exchangeFrames = data.exchanges.reduce(
    (sum, ex) => sum + (ex.audio?.duration_frames ?? 90),
    0
  );
  const endingFrames = data.ending?.duration_frames ?? 120;
  return {
    durationInFrames: exchangeFrames + endingFrames,
    fps: 30,
    width: 1080,
    height: 1920,
  };
};

export const DialogueVideo: React.FC<DialogueData> = (props) => {
  const { exchanges = [], ending } = props;
  const { fps } = useVideoConfig();

  // 计算每个 exchange 的起始帧
  const exchangeOffsets: number[] = [];
  let offset = 0;
  for (const ex of exchanges) {
    exchangeOffsets.push(offset);
    offset += ex.audio?.duration_frames ?? 90;
  }
  const endingOffset = offset;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0B0E1A', fontFamily: "'Noto Sans SC', sans-serif" }}>

      {/* Layer 0: 粒子背景（全程持续） */}
      <ParticleGrid />

      {/* 每段 Exchange 场景 */}
      {exchanges.map((ex, i) => {
        const from = exchangeOffsets[i];
        const dur  = ex.audio?.duration_frames ?? 90;
        const isBunny = ex.speaker === 'bunny';

        return (
          <Sequence key={ex.id} from={from} durationInFrames={dur}>

            {/* TTS 配音 */}
            {ex.audio?.file && (
              <Audio src={staticFile(ex.audio.file)} volume={1.0} />
            )}

            {/* Layer 1: 聚焦光晕背景 */}
            <FocusGlow speaker={ex.speaker} />

            {/* Layer 2: 角色圆形头像（固定在角落小尺寸） */}
            <CharacterLayer exchange={ex} />

            {/* Layer 3: 主内容层
                - 小白 (bunny): 显示 QuestionCard（大字问题）
                - 大橘 (fox):   显示 VisualCard（富可视化内容，text 只走 TTS）
            */}
            {isBunny ? (
              <QuestionCard text={ex.visual_card?.type === 'question' ? (ex.visual_card as any).text : ex.text} />
            ) : (
              ex.visual_card && ex.visual_card.type !== 'question' && (
                <VisualCard card={ex.visual_card} />
              )
            )}

          </Sequence>
        );
      })}

      {/* 结尾总结卡 */}
      {ending && (
        <Sequence from={endingOffset} durationInFrames={ending.duration_frames ?? 120}>
          <EndingCard ending={ending} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
