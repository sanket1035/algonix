import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { CssBaseline } from '@mui/material';

type ColorModeContextType = { mode: PaletteMode; toggleColorMode: () => void };

const ColorModeContext = createContext<ColorModeContextType>({ mode: 'light', toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export const brand = {
  primary: '#4F46E5',
  primaryLight: '#818CF8',
  accent: '#06B6D4',
  gradient: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #06B6D4 100%)',
};

const buildTheme = (mode: PaletteMode) => {
  const isDark = mode === 'dark';
  const border = isDark ? 'rgba(148, 163, 184, 0.14)' : '#E5E7EB';

  return createTheme({
    palette: {
      mode,
      primary: { main: isDark ? brand.primaryLight : brand.primary, contrastText: '#fff' },
      secondary: { main: '#7C3AED' },
      info: { main: brand.accent },
      success: { main: '#10B981' },
      warning: { main: '#F59E0B' },
      error: { main: '#EF4444' },
      background: {
        default: isDark ? '#0B0F19' : '#F7F8FA',
        paper: isDark ? '#111827' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#F1F5F9' : '#0F172A',
        secondary: isDark ? '#94A3B8' : '#64748B',
      },
      divider: border,
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 800, letterSpacing: '-0.025em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, fontSize: '1.05rem' },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: isDark ? '#0B0F19' : '#F7F8FA' },
          '::-webkit-scrollbar-thumb': { background: isDark ? '#334155' : '#CBD5E1' },
          '::-webkit-scrollbar-track': { background: 'transparent' },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: { backgroundImage: 'none' },
          outlined: { borderColor: border },
          elevation0: { border: `1px solid ${border}` },
          elevation1: { border: `1px solid ${border}`, boxShadow: 'none' },
          elevation2: { border: `1px solid ${border}`, boxShadow: 'none' },
          elevation3: { border: `1px solid ${border}`, boxShadow: 'none' },
        },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            border: `1px solid ${border}`,
            transition: 'border-color .2s, box-shadow .2s, transform .2s',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, paddingInline: 16 },
          containedPrimary: { '&:hover': { boxShadow: `0 6px 18px ${alpha(brand.primary, 0.35)}` } },
          outlined: { borderColor: border },
        },
      },
      MuiChip: { styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } } },
      MuiTextField: { defaultProps: { variant: 'outlined' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 8, '& fieldset': { borderColor: border } },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { borderRadius: 99, backgroundColor: isDark ? '#1F2937' : '#EEF2FF' },
          bar: { borderRadius: 99 },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: border },
          head: { fontWeight: 600, color: isDark ? '#94A3B8' : '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em' },
        },
      },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
      MuiTooltip: { styleOverrides: { tooltip: { borderRadius: 6, fontSize: '0.75rem' } } },
      MuiDialog: { styleOverrides: { paper: { borderRadius: 14 } } },
      MuiMenu: { styleOverrides: { paper: { border: `1px solid ${border}`, boxShadow: '0 12px 32px rgba(15,23,42,0.12)' } } },
    },
  });
};

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    try {
      const saved = localStorage.getItem('colorMode');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    try { localStorage.setItem('colorMode', mode); } catch {}
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleColorMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')) }), [mode]);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
