// ────────────────────────────────────────────────
// Flux Design System — Design Tokens
// BuildableLabs Task App
// ────────────────────────────────────────────────

export const Colors = {
  // Base surfaces
  background:     '#0A0A0F',
  surface:        '#141419',
  surfaceHover:   '#1C1C24',
  surfaceActive:  '#22222E',
  border:         '#2A2A35',
  borderSubtle:   '#1E1E28',

  // Glow / focus
  glowViolet:     'rgba(139, 92, 246, 0.20)',
  glowCyan:       'rgba(6, 182, 212, 0.15)',

  // Text hierarchy
  textPrimary:    '#F5F5F7',
  textSecondary:  '#8E8E9A',
  textMuted:      '#55555F',
  textDisabled:   '#38383F',

  // Accent gradient endpoints
  accentStart:    '#8B5CF6',   // Violet
  accentEnd:      '#06B6D4',   // Cyan
  accentMid:      '#6366F1',   // Indigo

  // Priority
  priorityHigh:   '#EF4444',
  priorityHighBg: 'rgba(239, 68, 68, 0.12)',
  priorityMed:    '#F59E0B',
  priorityMedBg:  'rgba(245, 158, 11, 0.12)',
  priorityLow:    '#10B981',
  priorityLowBg:  'rgba(16, 185, 129, 0.12)',

  // Status
  success:        '#10B981',
  successBg:      'rgba(16, 185, 129, 0.12)',
  warning:        '#F59E0B',
  error:          '#EF4444',
  errorBg:        'rgba(239, 68, 68, 0.12)',
  streak:         '#F97316',
  streakBg:       'rgba(249, 115, 22, 0.15)',

  // Glass
  glassBg:        'rgba(20, 20, 25, 0.80)',
  glassBorder:    'rgba(255, 255, 255, 0.07)',

  // White overlays
  white:          '#FFFFFF',
  white10:        'rgba(255, 255, 255, 0.10)',
  white05:        'rgba(255, 255, 255, 0.05)',
} as const;

export const Spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
  xxxl: 64,
} as const;

export const Radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  xxl:  32,
  full: 999,
} as const;

export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  base: 16,
  lg:   18,
  xl:   22,
  xxl:  28,
  xxxl: 36,
} as const;

export const FontWeight = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  }),
} as const;

export const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'high':   return { color: Colors.priorityHigh, bg: Colors.priorityHighBg };
    case 'medium': return { color: Colors.priorityMed,  bg: Colors.priorityMedBg };
    case 'low':    return { color: Colors.priorityLow,  bg: Colors.priorityLowBg };
  }
};
