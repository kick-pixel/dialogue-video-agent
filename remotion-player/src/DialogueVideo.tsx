// 主视频组件 v4 - 支持 theme / ratio 动态布局
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
import { getTheme }         from './themes';
import { ParticleGrid }     from './components/ParticleGrid';
import { FocusGlow }        from './components/FocusGlow';
import { CharacterLayer }   from './components/CharacterLayer';
import { QuestionCard }     from './components/QuestionCard';
import { VisualCard }       from './components/VisualCard';
import { EndingCard }       from './components/EndingCard';

// 动态计算总帧数和视频尺寸
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

  // 从 meta.video_config 读取视频尺寸
  const vc = data.meta?.video_config;
  const width  = vc?.width  ?? 1080;
  const height = vc?.height ?? 1920;

  return {
    durationInFrames: exchangeFrames + endingFrames,
    fps: 30,
    width,
    height,
  };
};

export const DialogueVideo: React.FC<DialogueData> = (props) => {
  const { exchanges = [], ending, meta, characters } = props;
  const { fps, width, height } = useVideoConfig();

  // 主题
  const theme = getTheme(meta?.video_config?.theme);
  const isLandscape = width > height;  // 16:9 横屏

  // 计算每个 exchange 的起始帧
  const exchangeOffsets: number[] = [];
  let offset = 0;
  for (const ex of exchanges) {
    exchangeOffsets.push(offset);
    offset += ex.audio?.duration_frames ?? 90;
  }
  const endingOffset = offset;

  return (
    <AbsoluteFill style={{
      backgroundColor: theme.bg,
      fontFamily: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
    }}>
      {/* Layer 0: 粒子背景（全程持续） */}
      <ParticleGrid theme={theme} />

      {/* 每段 Exchange 场景 */}
      {exchanges.map((ex, i) => {
        const from    = exchangeOffsets[i];
        const dur     = ex.audio?.duration_frames ?? 90;
        const isBunny = ex.speaker === 'bunny';

        return (
          <Sequence key={ex.id} from={from} durationInFrames={dur}>
            {/* TTS 配音 */}
            {ex.audio?.file && (
              <Audio src={staticFile(ex.audio.file)} volume={1.0} />
            )}

            {/* Layer 1: 聚焦光晕背景 */}
            <FocusGlow speaker={ex.speaker} theme={theme} isLandscape={isLandscape} />

            {/* Layer 2: 角色圆形头像 */}
            <CharacterLayer
              exchange={ex}
              characters={characters}
              theme={theme}
              isLandscape={isLandscape}
            />

            {/* Layer 3: 主内容层 */}
            {isBunny ? (
              <QuestionCard
                text={ex.visual_card?.type === 'question' ? (ex.visual_card as any).text : ex.text}
                theme={theme}
                isLandscape={isLandscape}
              />
            ) : (
              ex.visual_card && ex.visual_card.type !== 'question' && (
                <VisualCard
                  card={ex.visual_card}
                  theme={theme}
                  isLandscape={isLandscape}
                />
              )
            )}
          </Sequence>
        );
      })}

      {/* 结尾总结卡 */}
      {ending && (
        <Sequence from={endingOffset} durationInFrames={ending.duration_frames ?? 120}>
          <EndingCard ending={ending} theme={theme} />
        </Sequence>
      )}
    </AbsoluteFill>
  );
};
