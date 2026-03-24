// RoutineX Brand Theme — matches website globals.css
// Gradient: purple → pink → gold (135°)

export const colors = {
  // Primary purple
  primary: {
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
  },
  // Accent pink
  accent: {
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
  },
  // Gold
  gold: {
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
  },
  // Surface / neutral
  surface: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
  },
  // Semantic
  success: '#10b981',
  successLight: '#6ee7b7',
  error: '#f87171',
  errorDark: '#dc2626',
  textPrimary: '#ffffff',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  placeholder: '#52525b',
  border: 'rgba(255,255,255,0.1)',
  cardBg: 'rgba(255,255,255,0.05)',
};

// Gradient color arrays for LinearGradient
export const gradients = {
  // Main brand gradient (purple → pink → gold)
  brand: ['#9333ea', '#ec4899', '#f59e0b'] as const,
  // Subtle brand for backgrounds
  brandSubtle: ['rgba(147,51,234,0.3)', 'rgba(236,72,153,0.15)', 'rgba(245,158,11,0.05)'] as const,
  // Purple-only gradient for backgrounds
  purpleDark: ['rgba(147,51,234,0.2)', 'rgba(147,51,234,0.05)', 'transparent'] as const,
  // Card accent
  cardAccent: ['#9333ea', '#c084fc'] as const,
};

// Shared gradient props (135° angle)
export const gradientProps = {
  diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  topToBottom: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  leftToRight: { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
};
