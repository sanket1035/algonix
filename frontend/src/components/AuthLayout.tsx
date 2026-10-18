import React from 'react';
import { Box, Typography } from '@mui/material';
import { palette } from '../theme';
import Logo from './Logo';

const stats = [
  { value: '40+', label: 'problems' },
  { value: '4', label: 'languages' },
  { value: 'Weekly', label: 'leaderboard' },
];

const AuthLayout: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: palette.sand, display: 'flex', flexDirection: 'column' }}>
    <Box component="header" sx={{ maxWidth: 1240, width: '100%', mx: 'auto', px: { xs: 2.5, sm: 4 }, height: 72, display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
      <Logo />
    </Box>

    <Box
      sx={{
        flex: 1,
        maxWidth: 1240,
        width: '100%',
        mx: 'auto',
        px: { xs: 2.5, sm: 4 },
        py: { xs: 3, md: 6 },
        boxSizing: 'border-box',
        display: 'flex',
        flexWrap: 'wrap',
        gap: { xs: 5, md: 8 },
        alignItems: 'center',
      }}
    >
      <Box sx={{ flex: '1 1 480px', display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', gap: 3.5 }}>
        <Typography sx={{ fontSize: 15 }}>Practice that actually compounds</Typography>
        <Typography component="h1" sx={{ fontSize: { sm: 44, md: 60 }, lineHeight: 1.08, fontWeight: 400, letterSpacing: '-0.02em' }}>
          Sharpen your problem solving, one problem a day.
        </Typography>
        <Typography sx={{ fontSize: 17, lineHeight: 1.6, color: '#4A403B', maxWidth: 480 }}>
          Solve curated DSA problems in the browser, earn points for every accepted solution and track your rank each week.
        </Typography>
        <Box sx={{ display: 'flex', gap: 5, flexWrap: 'wrap', pt: 1 }}>
          {stats.map((s) => (
            <Box key={s.label}>
              <Typography sx={{ fontSize: 30, fontWeight: 500 }}>{s.value}</Typography>
              <Typography sx={{ fontSize: 14, color: '#4A403B' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ flex: '0 1 440px', width: '100%', bgcolor: palette.card, borderRadius: '20px', p: { xs: 3, sm: 5 }, boxSizing: 'border-box' }}>
        <Typography variant="h5" component="h2" sx={{ fontSize: 26 }}>{title}</Typography>
        <Typography sx={{ mt: 0.75, mb: 3, fontSize: 14, color: 'text.secondary' }}>{subtitle}</Typography>
        {children}
      </Box>
    </Box>
  </Box>
);

export default AuthLayout;
