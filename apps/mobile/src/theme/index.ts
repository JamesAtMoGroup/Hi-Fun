// ============================================================
// FOMO Theme — Dark Mode + Neon Nightlife Aesthetic
// ============================================================

export const colors = {
  // Brand
  primary: '#A855F7',        // Vivid purple (brighter for dark bg)
  primaryDark: '#7C3AED',    // Original purple
  primaryLight: '#C084FC',   // Light purple for highlights
  secondary: '#EC4899',      // Hot pink
  secondaryLight: '#F472B6',

  // Neon accents (use sparingly, for FOMO moments)
  neonCyan: '#00E5FF',       // Electric blue — "live now" markers
  neonGreen: '#00FF88',      // Matrix green — "friends going"
  neonYellow: '#FFEE00',     // Warning yellow — "almost sold out"

  // Backgrounds (dark mode first)
  background: '#0A0A0F',     // Almost black with purple tint
  surface: '#16161F',        // Card background
  surfaceElevated: '#1F1F2B', // Elevated card / modal
  surfaceHover: '#2A2A38',   // Hover / pressed state
  overlay: 'rgba(0, 0, 0, 0.7)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#6B7280',
  textInverse: '#0A0A0F',    // For light backgrounds

  // Borders
  border: '#2A2A38',
  borderLight: '#1F1F2B',
  borderFocus: '#A855F7',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#00E5FF',

  // Gradients (use as tuples for LinearGradient)
  gradientPrimary: ['#A855F7', '#EC4899'] as const,
  gradientDark: ['#0A0A0F', '#16161F'] as const,
  gradientNeon: ['#00E5FF', '#A855F7'] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const typography = {
  // Hero headers (for big callouts)
  hero: {
    fontSize: 32,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  heading1: {
    fontSize: 26,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  heading3: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  small: {
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
  },
  tiny: {
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
} as const;

// Border radius — more generous for modern look
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
} as const;

// Shadows for dark mode (use glow instead of shadow)
export const glow = {
  primary: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  neon: {
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export const theme = {
  colors,
  spacing,
  typography,
  radius,
  glow,
} as const;

export default theme;
