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
    300: '#fcd34d',
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
  // Free/promo green
  freeGreen: '#10b981',
  freeGreenLight: '#6ee7b7',
  freeGreenBg: 'rgba(16,185,129,0.20)',
  freeGreenBorder: 'rgba(16,185,129,0.40)',
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
  // Score bar gradient
  scoreBar: ['#9333ea', '#ec4899'] as const,
};

// Shared gradient props (135° angle)
export const gradientProps = {
  diagonal: { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  topToBottom: { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } },
  leftToRight: { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } },
};

// Screen-level gradient background (brand: purple -> pink -> gold hint -> black)
export const screenGradient = [
  'rgba(147,51,234,0.22)',
  'rgba(236,72,153,0.12)',
  'rgba(245,158,11,0.05)',
  '#09090b',
] as const;

// Rich section gradient for marketing/landing sections
export const sectionGradient = [
  'rgba(147,51,234,0.30)',
  'rgba(236,72,153,0.15)',
  'rgba(245,158,11,0.06)',
  '#09090b',
] as const;

// Header bar gradient (subtle brand hint)
export const headerGradient = ['rgba(147,51,234,0.10)', 'rgba(236,72,153,0.04)', colors.surface[950]] as const;

// Card accent line height
export const CARD_ACCENT_HEIGHT = 3;

// Glass card styling — matches website's .glass class
export const glass = {
  backgroundColor: 'rgba(255,255,255,0.08)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: 20,
};

// Elevated glass card — slightly more visible
export const glassElevated = {
  backgroundColor: 'rgba(255,255,255,0.10)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.15)',
  borderRadius: 20,
};

// Section header styling
export const sectionHeader = {
  color: colors.textSecondary,
  fontSize: 12 as const,
  fontWeight: '600' as const,
  letterSpacing: 1.5,
  textTransform: 'uppercase' as const,
  marginBottom: 12,
  marginLeft: 4,
};

// Shared input styling
export const inputStyle = {
  backgroundColor: 'rgba(255,255,255,0.07)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  borderRadius: 14,
  padding: 16,
  color: '#fff',
  fontSize: 16,
};

// Shared label styling
export const labelStyle = {
  color: '#d4d4d8',
  fontSize: 13,
  marginBottom: 8,
  fontWeight: '500' as const,
};
