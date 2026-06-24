import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import { EmojiEvents, TrendingUp, Person } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Leaderboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  const { data: weeklyData } = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: () => leaderboardAPI.getWeeklyLeaderboard(),
  });

  const { data: allTimeData } = useQuery({
    queryKey: ['leaderboard', 'all-time'],
    queryFn: () => leaderboardAPI.getAllTimeLeaderboard(),
  });

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return 'transparent';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <EmojiEvents sx={{ color: getRankColor(rank) }} />;
    return <span>{rank}</span>;
  };

  const currentData = activeTab === 0 ? weeklyData : allTimeData;
  const pointsField = activeTab === 0 ? 'weeklyPoints' : 'totalPoints';

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: { xs: 2, sm: 4 }, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
        Leaderboard 🏆
      </Typography>

      {/* Current User Stats */}
      <Card sx={{ mb: { xs: 2, sm: 4 }, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'center', sm: 'flex-start' }, gap: 2, textAlign: { xs: 'center', sm: 'left' } }}>
            <Avatar sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, bgcolor: 'rgba(255,255,255,0.2)' }}>
              <Person />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {user?.profile?.firstName} {user?.profile?.lastName} (@{user?.username})
              </Typography>
              <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mt: 1, justifyContent: { xs: 'center', sm: 'flex-start' }, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Weekly Rank
                  </Typography>
                  <Typography variant="h6">
                    #{currentData?.currentUserRank || 'N/A'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Total Points
                  </Typography>
                  <Typography variant="h6">
                    {user?.stats?.totalPoints ?? 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Level
                  </Typography>
                  <Typography variant="h6">
                    {user?.stats?.level ?? 1}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
          variant="fullWidth"
        >
          <Tab
            icon={<TrendingUp />}
            label="Weekly"
            iconPosition="start"
          />
          <Tab
            icon={<EmojiEvents />}
            label="All Time"
            iconPosition="start"
          />
        </Tabs>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>User</TableCell>
                <TableCell align="right">Points</TableCell>
                <TableCell align="right">Level</TableCell>
                {activeTab === 1 && <TableCell align="right">Problems Solved</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData?.leaderboard?.map((entry: any) => (
                <TableRow
                  key={entry._id}
                  sx={{
                    backgroundColor: entry._id === user?.id ? 'rgba(103, 126, 234, 0.1)' : 'inherit',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getRankIcon(entry.rank)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
                      <Avatar
                        src={entry.profile?.avatar}
                        sx={{ width: { xs: 32, sm: 40 }, height: { xs: 32, sm: 40 } }}
                      >
                        {entry.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: { xs: '0.8rem', sm: '1rem' } }} noWrap>
                          {entry.profile?.firstName} {entry.profile?.lastName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" noWrap>
                          @{entry.username}
                        </Typography>
                      </Box>
                      {entry._id === user?.id && (
                        <Chip label="You" size="small" color="primary" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {entry.stats?.[pointsField] || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`Level ${entry.stats?.level ?? 1}`}
                      size="small"
                      color="secondary"
                    />
                  </TableCell>
                  {activeTab === 1 && (
                    <TableCell align="right">
                      <Typography variant="body2">
                        {entry.stats?.solvedProblems ?? 0}
                      </Typography>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {(!currentData?.leaderboard || currentData.leaderboard.length === 0) && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary">
              No rankings available yet
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Start solving problems to appear on the leaderboard!
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Leaderboard;