import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
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
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { challengesAPI, leaderboardAPI } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: challenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => challengesAPI.getChallenges(),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard-around-me'],
    queryFn: () => leaderboardAPI.getAroundMe('weekly'),
  });

  const getNextLevelProgress = () => {
    const levelThresholds = [0, 150, 550, 900]; // New point-based thresholds
    const currentPoints = user?.stats.totalPoints || 0;
    const currentLevel = user?.stats.level || 1;
    
    if (currentLevel >= levelThresholds.length) return 100;
    
    const currentLevelThreshold = levelThresholds[currentLevel - 1];
    const nextLevelThreshold = levelThresholds[currentLevel];
    const progress = ((currentPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;
    
    return Math.min(Math.max(progress, 0), 100);
  };

  const getRecentBadges = () => {
    // Add test badges if user has no badges but has solved problems
    const userBadges = user?.badges || [];
    if (userBadges.length === 0 && (user?.stats.solvedProblems || 0) > 0) {
      return [
        { name: 'Starter', description: 'Solved 1 problem', icon: '🌱', earnedAt: new Date() },
        { name: 'Beginner Solver', description: 'Solved 5 problems', icon: '📚', earnedAt: new Date() }
      ];
    }
    return userBadges.slice(-3);
  };

  const getDifficultyStats = () => {
    if (!challenges || !user) return {};
    
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Welcome back, {user?.profile.firstName || user?.username}! 👋
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {user?.stats.totalPoints}
                  </Typography>
                  <Typography variant="body2">Total Points</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {user?.stats.level}
                  </Typography>
                  <Typography variant="body2">Current Level</Typography>
                </Box>
                <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {user?.stats.solvedProblems}
                  </Typography>
                  <Typography variant="body2">Problems Solved</Typography>
                </Box>
                <Code sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {user?.stats.streak}
                  </Typography>
                  <Typography variant="body2">Day Streak</Typography>
                </Box>
                <Speed sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Level Progress */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Level Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body2">Level {user?.stats.level}</Typography>
              <LinearProgress
                variant="determinate"
                value={nextLevelProgress}
                sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2">Level {(user?.stats.level || 1) + 1}</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {Math.round(nextLevelProgress)}% to next level
              {user?.stats.level === 1 && ` (${150 - (user?.stats.totalPoints || 0)} points needed for Intermediate)`}
              {user?.stats.level === 2 && ` (${550 - (user?.stats.totalPoints || 0)} points needed for Advanced)`}
              {user?.stats.level === 3 && ` (${900 - (user?.stats.totalPoints || 0)} points needed for Expert)`}
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Badges */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Badges
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {recentBadges.length > 0 ? (
                recentBadges.map((badge, index) => (
                  <Chip
                    key={index}
                    icon={<span>{badge.icon}</span>}
                    label={badge.name}
                    variant="outlined"
                    size="small"
                  />
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No badges earned yet. Problems solved: {user?.stats.solvedProblems || 0}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Difficulty Progress */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progress by Difficulty
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {Object.entries(difficultyStats).map(([difficulty, stats]) => (
                <Box key={difficulty}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{difficulty}</Typography>
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
          <Paper sx={{ p: 3 }}>
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
                    const response = await fetch('/api/auth/fix-badges', {
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
                🏆 Fix My Badges
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Weekly Ranking */}
        {leaderboardData && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Weekly Leaderboard Position
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  label={`#${leaderboardData.currentUser?.rank || 'N/A'}`}
                  color="primary"
                  sx={{ fontWeight: 'bold' }}
                />
                <Typography variant="body2">
                  You're ranked #{leaderboardData.currentUser?.rank || 'N/A'} this week with{' '}
                  {user?.stats.weeklyPoints} points
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