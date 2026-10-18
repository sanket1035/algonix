import React from 'react';
import { Box, Typography } from '@mui/material';
import { brand } from '../theme';

const Logo: React.FC<{ size?: number; onClick?: () => void; light?: boolean }> = ({ size = 32, onClick, light }) => (
  <Box onClick={onClick} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, cursor: onClick ? 'pointer' : 'default', userSelect: 'none' }}>
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: size / 4,
        background: brand.gradient,
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        fontFamily: '"JetBrains Mono", monospace',
        fontWeight: 700,
        fontSize: size * 0.42,
        boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
      }}
    >
      {'</>'}
    </Box>
    <Typography sx={{ fontWeight: 800, fontSize: size * 0.6, letterSpacing: '-0.02em', color: light ? '#fff' : 'text.primary' }}>
      Algonix
    </Typography>
  </Box>
);

export default Logo;
