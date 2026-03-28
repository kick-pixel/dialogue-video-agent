// Remotion Root - 注册所有 Composition
import React from 'react';
import { Composition } from 'remotion';
import { DialogueVideo, calculateDialogueMetadata } from './DialogueVideo';
import type { DialogueData } from './types';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Composition
        id="DialogueVideo"
        component={DialogueVideo as any}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{} as DialogueData}
        calculateMetadata={calculateDialogueMetadata}
      />
    </>
  );
};
