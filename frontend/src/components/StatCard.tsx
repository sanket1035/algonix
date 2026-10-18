import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

type Tone = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

const StatCard: React.FC<{ label: string; value: React.ReactNode; icon: React.ReactNode; tone?: Tone; hint?: string }> = ({ label, value, icon, tone = 'primary', hint }) => {
  const theme = useTheme();
  const color = theme.palette[tone].main;
  return (
    <Card sx={{ height: '100%', '&:hover': { borderColor: alpha(color, 0.5) } }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>{label}</Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>{value}</Typography>
            {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: alpha(color, 0.12), color }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
