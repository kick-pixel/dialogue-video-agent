/**
 * 视觉主题系统 v2
 * 支持的主题: tech-dark | neon | light
 */

export type ThemeName = 'tech-dark' | 'neon' | 'light';

export interface Theme {
  /** 页面背景色 */
  bg: string;
  /** 主强调色 */
  accent: string;
  /** 主强调色（亮版） */
  accentLight: string;
  /** 卡片背景 */
  cardBg: string;
  /** 卡片边框 */
  cardBorder: string;
  /** 主文字色 */
  textPrimary: string;
  /** 次文字色 */
  textSecondary: string;
  /** 粒子颜色 */
  particleColor: string;
  /** fox 角色光晕色 */
  foxGlow: string;
  /** bunny 角色光晕色 */
  bunnyGlow: string;
  /** 成功/对比色（比较卡右列） */
  success: string;
  /** 危险色（比较卡左列） */
  danger: string;
  /** 卡片阴影 */
  cardShadow: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  'tech-dark': {
    bg:            '#0B0E1A',
    accent:        '#FFA03C',
    accentLight:   '#FFD080',
    cardBg:        'rgba(8, 4, 22, 0.82)',
    cardBorder:    'rgba(255,255,255,0.06)',
    textPrimary:   '#F2EAFF',
    textSecondary: 'rgba(240,234,255,0.65)',
    particleColor: '#3B82F6',
    foxGlow:       'rgba(255,140,30,0.55)',
    bunnyGlow:     'rgba(255,100,180,0.55)',
    success:       '#00DCA0',
    danger:        '#FF6B6B',
    cardShadow:    '0 0 80px rgba(255,160,60,0.10), 0 0 0 1px rgba(255,255,255,0.06), 0 32px 80px rgba(0,0,0,0.6)',
  },
  'neon': {
    bg:            '#0A0014',
    accent:        '#00FFD1',
    accentLight:   '#80FFE8',
    cardBg:        'rgba(0, 0, 30, 0.88)',
    cardBorder:    'rgba(0,255,209,0.18)',
    textPrimary:   '#EEFFFA',
    textSecondary: 'rgba(200,255,240,0.6)',
    particleColor: '#7C3AED',
    foxGlow:       'rgba(0,255,209,0.6)',
    bunnyGlow:     'rgba(200,100,255,0.6)',
    success:       '#39FF14',
    danger:        '#FF0080',
    cardShadow:    '0 0 80px rgba(0,255,209,0.12), 0 0 0 1px rgba(0,255,209,0.15), 0 32px 80px rgba(0,0,0,0.7)',
  },
  'light': {
    bg:            '#F5F7FF',
    accent:        '#6B4FFF',
    accentLight:   '#9E87FF',
    cardBg:        'rgba(255,255,255,0.92)',
    cardBorder:    'rgba(107,79,255,0.15)',
    textPrimary:   '#1A1040',
    textSecondary: 'rgba(30,20,80,0.6)',
    particleColor: '#6B4FFF',
    foxGlow:       'rgba(107,79,255,0.35)',
    bunnyGlow:     'rgba(236,72,153,0.35)',
    success:       '#059669',
    danger:        '#DC2626',
    cardShadow:    '0 8px 40px rgba(107,79,255,0.12), 0 0 0 1px rgba(107,79,255,0.1)',
  },
};

/**
 * 根据主题名称获取主题配置，未知名称 fallback 到 tech-dark
 */
export function getTheme(name?: string): Theme {
  return THEMES[(name as ThemeName) ?? 'tech-dark'] ?? THEMES['tech-dark'];
}
