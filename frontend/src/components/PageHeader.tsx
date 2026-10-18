import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader: React.FC<{ title: React.ReactNode; subtitle?: React.ReactNode; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: { xs: 3, sm: 4 } }}>
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '1.875rem' } }}>{title}</Typography>
      {subtitle && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
    </Box>
    {action}
  </Box>
);

export default PageHeader;
