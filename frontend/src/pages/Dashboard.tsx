import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Avatar,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  EmojiEvents,
  Code,
  Speed,
  Star,
  PlayArrow,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { difficultyLabel } from '../theme';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { challengesAPI, leaderboardAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: challenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => challengesAPI.getChallenges(),
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard-around-me'],
    queryFn: () => leaderboardAPI.getAroundMe('weekly'),
  });

  const getNextLevelProgress = () => {
    const levelThresholds = [0, 150, 550, 900]; // New point-based thresholds
    const currentPoints = user?.stats?.totalPoints || 0;
    const currentLevel = user?.stats?.level || 1;
    
    if (currentLevel >= levelThresholds.length) return 100;
    
    const currentLevelThreshold = levelThresholds[currentLevel - 1];
    const nextLevelThreshold = levelThresholds[currentLevel];
    const progress = ((currentPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  };

  const getRecentBadges = () => {
    // Add test badges if user has no badges but has solved problems
    const userBadges = user?.badges || [];
    if (userBadges.length === 0 && (user?.stats?.solvedProblems || 0) > 0) {
      return [
        { name: 'Starter', description: 'Solved 1 problem', icon: '', earnedAt: new Date() },
        { name: 'Beginner Solver', description: 'Solved 5 problems', icon: '', earnedAt: new Date() }
      ];
    }
    return userBadges.slice(-3);
  };

  const getDifficultyStats = () => {
    if (!Array.isArray(challenges) || !user) return {};
    
    const stats: Record<string, { solved: number; total: number }> = {};
    
    challenges.forEach((challenge) => {
      if (!stats[challenge.difficulty]) {
        stats[challenge.difficulty] = { solved: 0, total: 0 };
      }
      stats[challenge.difficulty].total++;
      if (challenge.isSolved) {
        stats[challenge.difficulty].solved++;
      }
    });
    
    return stats;
  };

  const difficultyStats = getDifficultyStats();
  const recentBadges = getRecentBadges();
  const nextLevelProgress = getNextLevelProgress();

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 }, px: { xs: 2, sm: 4 } }}>
      <PageHeader
        title={<>Welcome back, {user?.profile?.firstName || user?.username}</>}
        subtitle="Here's how your practice is going."
        action={<Button variant="contained" onClick={() => navigate('/challenges')} sx={{ px: 3, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>SOLVE A PROBLEM</Button>}
      />

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {/* Stats */}
        {[
          { label: 'Total points', value: user?.stats?.totalPoints ?? 0 },
          { label: 'Current level', value: user?.stats?.level ?? 1 },
          { label: 'Problems solved', value: user?.stats?.solvedProblems ?? 0 },
          { label: 'Day streak', value: user?.stats?.streak ?? 0 },
        ].map((stat) => (
          <Grid item xs={6} md={3} key={stat.label}>
            <Paper sx={{ p: 2.5, height: '100%' }}>
              <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
              <Typography sx={{ fontSize: { xs: 30, sm: 38 }, fontWeight: 500, letterSpacing: '-0.03em', mt: 0.5 }}>{stat.value}</Typography>
            </Paper>
          </Grid>
        ))}

        {/* Level Progress */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Level Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2">Level {user?.stats?.level ?? 1}</Typography>
              <LinearProgress
                variant="determinate"
                value={nextLevelProgress}
                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2">Level {(user?.stats?.level || 1) + 1}</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {Math.round(nextLevelProgress)}% to next level
              {user?.stats?.level === 1 && ` (${150 - (user?.stats?.totalPoints || 0)} points needed for Intermediate)`}
              {user?.stats?.level === 2 && ` (${550 - (user?.stats?.totalPoints || 0)} points needed for Advanced)`}
              {user?.stats?.level === 3 && ` (${900 - (user?.stats?.totalPoints || 0)} points needed for Expert)`}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Badges */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Recent Badges
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {recentBadges.length > 0 ? (
                recentBadges.map((badge, index) => (
                  <Chip
                    key={index}
                    icon={<WorkspacePremiumOutlined />}
                    label={badge.name}
                    variant="outlined"
                    size="small"
                  />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No badges earned yet. Problems solved: {user?.stats?.solvedProblems ?? 0}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Difficulty Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Progress by Difficulty
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(difficultyStats).map(([difficulty, stats]) => (
                <Box key={difficulty}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{difficultyLabel[difficulty] ?? difficulty}</Typography>
                    <Typography variant="body2">
                      {stats.solved}/{stats.total}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(stats.solved / stats.total) * 100}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => navigate('/challenges')}
                sx={{ justifyContent: 'flex-start' }}
              >
                Continue Solving Problems
              </Button>
              <Button
                variant="outlined"
                startIcon={<Speed />}
                onClick={() => navigate('/skill-test')}
                sx={{ justifyContent: 'flex-start' }}
              >
                Take Skill Test
              </Button>
              <Button
                variant="outlined"
                startIcon={<EmojiEvents />}
                onClick={() => navigate('/leaderboard')}
                sx={{ justifyContent: 'flex-start' }}
              >
                View Leaderboard
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const apiUrl = process.env.REACT_APP_API_URL || '/api';
                    const response = await fetch(`${apiUrl}/auth/fix-badges`, {
                      method: 'POST',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    const result = await response.json();
                    alert(`Badges fixed! You now have ${result.badges?.length || 0} badges.`);
                    window.location.reload();
                  } catch (error: any) {
                    alert('Error fixing badges: ' + error.message);
                  }
                }}
                sx={{ justifyContent: 'flex-start' }}
              >
                Recalculate my badges
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Weekly Ranking */}
        {leaderboardData && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Weekly Leaderboard Position
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`#${leaderboardData.currentUser?.rank || 'N/A'}`}
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                  You're ranked #{leaderboardData.currentUser?.rank || 'N/A'} this week with{' '}
                  {user?.stats?.weeklyPoints ?? 0} points
                </Typography>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard;