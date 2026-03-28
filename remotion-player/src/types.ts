// types.ts v4 - 含 theme / video_config / VisualCard 联合类型
export interface VideoConfig {
  fps: number;
  width: number;
  height: number;
  ratio?: '9:16' | '16:9';
  theme?: string;
}

export interface Meta {
  title: string;
  source_doc?: string;
  video_config?: VideoConfig;
  total_frames?: number;
  total_duration_sec?: number;
  tts_engine?: string;
}

export interface CharacterMeta {
  id: string;
  name: string;
  voice?: string;
  screen_anchor?: string;
  image?: string;   // 头像图片路径（相对 remotion public/ 目录）
}

export interface AudioInfo {
  file: string;           // 相对路径（audio/ex_01.mp3）
  duration_sec: number;
  duration_frames: number;
}

// ── VisualCard 联合类型 ───────────────────────────────────────────────────────

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

// ── Exchange / Ending / DialogueData ─────────────────────────────────────────

export interface Exchange {
  id: string;
  speaker: 'bunny' | 'fox';
  text: string;
  emotion?: string;
  visual_card?: VisualCard | null;
  audio?: AudioInfo;
}

export interface Ending {
  type?: string;
  title?: string;
  points?: string[];
  cta?: string;
  duration_frames?: number;
}

export interface DialogueData {
  meta?: Meta;
  characters?: {
    questioner?: CharacterMeta;
    answerer?: CharacterMeta;
  };
  exchanges: Exchange[];
  ending?: Ending;
}
