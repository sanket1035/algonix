import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Warm neutral palette: sand header/hero, off-white cards, charcoal actions.
export const palette = {
  sand: '#E2D6CE',
  sandDeep: '#D3C5BB',
  page: '#F3EEEA',
  card: '#FBF8F6',
  stripe: '#F7F2EE',
  line: '#EAE1DA',
  ink: '#1F1F1F',
  charcoal: '#2B2B2B',
  muted: '#5A4F49',
  easy: '#3F6B4F',
  medium: '#9A5B1E',
  hard: '#9B2C2C',
  editor: '#232120',
};

export const fonts = {
  body: '"DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif',
  wordmark: '"Bodoni Moda", Georgia, serif',
  mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
};

// Maps the backend's four levels onto the Easy / Medium / Hard scale shown in the UI.
export const difficultyLabel: Record<string, string> = {
  Beginner: 'Easy',
  Intermediate: 'Medium',
  Advanced: 'Hard',
  Expert: 'Expert',
};

export const difficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return palette.easy;
    case 'Intermediate':
      return palette.medium;
    default:
      return palette.hard;
  }
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: palette.charcoal, contrastText: palette.page },
    secondary: { main: palette.muted },
    success: { main: palette.easy },
    warning: { main: palette.medium },
    error: { main: palette.hard },
    info: { main: '#3D5A80' },
    background: { default: palette.page, paper: palette.card },
    text: { primary: palette.ink, secondary: palette.muted },
    divider: palette.line,
    action: { hover: 'rgba(43, 43, 43, 0.05)', selected: 'rgba(43, 43, 43, 0.08)' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: fonts.body,
    h1: { fontWeight: 400, letterSpacing: '-0.02em' },
    h2: { fontWeight: 400, letterSpacing: '-0.02em' },
    h3: { fontWeight: 400, letterSpacing: '-0.02em' },
    h4: { fontWeight: 500, letterSpacing: '-0.02em' },
    h5: { fontWeight: 500, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: palette.page },
        '::-webkit-scrollbar-thumb': { background: palette.sandDeep },
        '::-webkit-scrollbar-track': { background: 'transparent' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation0: { border: `1px solid ${palette.line}` },
        elevation1: { border: `1px solid ${palette.line}`, boxShadow: 'none' },
        elevation2: { border: `1px solid ${palette.line}`, boxShadow: 'none' },
        elevation3: { border: `1px solid ${palette.line}`, boxShadow: 'none' },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: `1px solid ${palette.line}`, borderRadius: 16 } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 999, paddingInline: 20, minHeight: 40 },
        outlined: { borderColor: palette.charcoal, '&:hover': { borderColor: palette.charcoal, backgroundColor: 'rgba(43,43,43,0.05)' } },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 999 } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          '& fieldset': { borderColor: palette.sandDeep },
          '&.Mui-focused fieldset': { borderColor: palette.charcoal },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 6, borderRadius: 99, backgroundColor: palette.line },
        bar: { borderRadius: 99 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: palette.line },
        head: { fontWeight: 600, color: palette.muted, fontSize: '0.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' },
      },
    },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 46 } } },
    MuiTabs: { styleOverrides: { indicator: { backgroundColor: palette.charcoal } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 18 } } },
    MuiMenu: { styleOverrides: { paper: { border: `1px solid ${palette.line}`, boxShadow: '0 12px 32px rgba(31,31,31,0.10)' } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
  },
});

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);
