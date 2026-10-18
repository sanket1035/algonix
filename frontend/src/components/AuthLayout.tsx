import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { CodeRounded, EmojiEventsOutlined, WorkspacePremiumOutlined } from '@mui/icons-material';
import { brand } from '../theme';
import Logo from './Logo';

const features = [
  { icon: <CodeRounded />, title: 'Solve real problems', text: 'In-browser editor with instant test feedback.' },
  { icon: <EmojiEventsOutlined />, title: 'Climb the leaderboard', text: 'Earn points, badges and weekly rankings.' },
  { icon: <WorkspacePremiumOutlined />, title: 'Earn certificates', text: 'Prove your skills with verifiable certificates.' },
];

const AuthLayout: React.FC<{ title: string; subtitle: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, bgcolor: 'background.default' }}>
    <Box
      sx={{
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 6,
        color: '#fff',
        background: `radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 40%), ${brand.gradient}`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Logo size={36} light />
      <Box sx={{ maxWidth: 440 }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.15 }}>
          Level up your problem-solving, one challenge at a time.
        </Typography>
        <Typography sx={{ opacity: 0.85, mb: 5 }}>
          Practice data structures and algorithms in a gamified environment built for consistent progress.
        </Typography>
        <Stack spacing={2.5}>
          {features.map((f) => (
            <Box key={f.title} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>
                {f.icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{f.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>{f.text}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>
      <Typography variant="caption" sx={{ opacity: 0.7 }}>© {new Date().getFullYear()} Algonix</Typography>
    </Box>

    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2.5, sm: 4 } }}>
      <Box sx={{ width: '100%', maxWidth: 440 }}>
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}><Logo size={32} /></Box>
        <Typography variant="h4" component="h1" sx={{ mb: 1 }}>{title}</Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>{subtitle}</Typography>
        {children}
      </Box>
    </Box>
  </Box>
);

export default AuthLayout;
