export const colors = {
  background: '#0f0f1a',
  surface: '#1a1a2e',
  surfaceAlt: '#16213e',
  accent: '#6366f1',
  accentSoft: '#818cf8',
  secondary: '#8b5cf6',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#475569',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  border: '#1e293b',
} as const;

export type ColorKey = keyof typeof colors;
