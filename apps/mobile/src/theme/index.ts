export const colors = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export const typography = {
  heading1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
} as const;

export const theme = {
  colors,
  spacing,
  typography,
} as const;

export default theme;
