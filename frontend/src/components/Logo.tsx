import React from 'react';
import { Typography } from '@mui/material';
import { fonts } from '../theme';

const Logo: React.FC<{ size?: number; onClick?: () => void }> = ({ size = 22, onClick }) => (
  <Typography
    component="span"
    onClick={onClick}
    sx={{ fontFamily: fonts.wordmark, fontSize: size, letterSpacing: '0.18em', fontWeight: 500, cursor: onClick ? 'pointer' : 'default', userSelect: 'none', lineHeight: 1 }}
  >
    ALGONIX
  </Typography>
);

export default Logo;
