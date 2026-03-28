// 类型定义 v3 - visual_card 架构，替代 keywords

// ── VisualCard 联合类型 ──────────────────────────────────────
export interface VisualCardQuestion {
  type: 'question';
  text: string;
}

export interface FlowStep {
  icon: string;
  label: string;
  desc?: string;
}

export interface VisualCardFlowSteps {
  type: 'flow_steps';
  title: string;
  steps: FlowStep[];
}

export interface VisualCardConceptBox {
  type: 'concept_box';
  term: string;
  definition: string;
  example?: string;
}

export interface BulletPoint {
  icon: string;
  text: string;
}

export interface VisualCardBulletPoints {
  type: 'bullet_points';
  title: string;
  points: BulletPoint[];
}

export interface ComparisonSide {
  label: string;
  items: string[];
}

export interface VisualCardComparison {
  type: 'comparison';
  title: string;
  before: ComparisonSide;
  after: ComparisonSide;
}

export type VisualCard =
  | VisualCardQuestion
  | VisualCardFlowSteps
  | VisualCardConceptBox
  | VisualCardBulletPoints
  | VisualCardComparison;

// ── 对话数据结构 ─────────────────────────────────────────────
export interface AudioInfo {
  file: string;
  duration_sec: number;
  duration_frames: number;
}

export interface Exchange {
  id: string;
  speaker: 'bunny' | 'fox';
  text: string;  // TTS 用，大橘的 text 不显示在屏幕上
  emotion: 'idle' | 'curious' | 'explaining' | 'thinking' | 'celebrating';
  transition_in?: 'slide-diagonal' | 'cross-dissolve' | 'glitch-split';
  visual_card?: VisualCard;  // 替代旧的 keywords
  audio: AudioInfo;
}

export interface Character {
  id: string;
  name: string;
  voice: string;
  screen_anchor: 'bottom-left' | 'top-right';
}

export interface EndingCard {
  type: 'summary-card';
  title: string;
  points: string[];
  cta: string;
  duration_frames: number;
}

export interface VideoConfig {
  fps: number;
  width: number;
  height: number;
  theme: string;
  total_frames?: number;
}

export interface DialogueMeta {
  title: string;
  source_doc: string;
  video_config: VideoConfig;
  total_frames?: number;
  total_duration_sec?: number;
}

export interface DialogueData {
  meta: DialogueMeta;
  characters: {
    questioner: Character;
    answerer: Character;
  };
  exchanges: Exchange[];
  ending: EndingCard;
}
