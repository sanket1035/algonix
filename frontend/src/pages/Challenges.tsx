import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  InputBase,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Search, LockOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { challengesAPI, leaderboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Challenge } from '../types';
import { palette, fonts, difficultyLabel, difficultyColor } from '../theme';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const card = { bgcolor: palette.card, border: `1px solid ${palette.line}`, borderRadius: '16px' };

const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => challengesAPI.getChallenges(),
  });

  const { data: weekly } = useQuery({
    queryKey: ['leaderboard', 'weekly'],
    queryFn: () => leaderboardAPI.getWeeklyLeaderboard(1, 5),
  });

  const all: Challenge[] = useMemo(
    () => (Array.isArray(challenges) ? [...challenges].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) : []),
    [challenges]
  );

  const term = searchTerm.toLowerCase();
  const filtered = all.filter(
    (c) =>
      (!difficultyFilter || c.difficulty === difficultyFilter) &&
      (c.title.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term) ||
        (c.tags || []).some((tag) => tag.toLowerCase().includes(term)))
  );

  const progress = DIFFICULTIES.map((d) => {
    const inLevel = all.filter((c) => c.difficulty === d);
    return { difficulty: d, solved: inLevel.filter((c) => c.isSolved).length, total: inLevel.length };
  }).filter((p) => p.total > 0);
  const solvedCount = all.filter((c) => c.isSolved).length;
  const nextUp = all.find((c) => c.isUnlocked && !c.isSolved);

  const open = (c: Challenge) => c.isUnlocked && navigate(`/challenges/${c._id}`);

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, sm: 4 }, py: { xs: 3, sm: 4 }, display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <Box sx={{ flex: '999 1 640px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ bgcolor: palette.sand, borderRadius: '16px', p: { xs: 3, sm: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 3, flexWrap: 'wrap' }}>
          <Box>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 1 }}>
              Hi {user?.profile?.firstName || user?.username}
            </Typography>
            <Typography component="h1" sx={{ fontSize: { xs: 26, sm: 34 }, lineHeight: 1.15, fontWeight: 500, letterSpacing: '-0.02em', maxWidth: 540 }}>
              {nextUp ? `Next up: ${nextUp.title}` : solvedCount ? 'Every unlocked problem is solved.' : 'Pick a problem and start solving.'}
            </Typography>
          </Box>
          {nextUp && (
            <Button variant="contained" onClick={() => open(nextUp)} sx={{ px: 3, py: 1.5, fontSize: 13, fontWeight: 700, letterSpacing: '0.06em' }}>
              CONTINUE SOLVING
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: palette.card, border: `1px solid ${palette.sandDeep}`, borderRadius: 99, px: 2, height: 44 }}>
            <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
            <InputBase
              placeholder="Search problems or topics"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              inputProps={{ 'aria-label': 'Search problems' }}
              sx={{ flex: 1, fontSize: 14 }}
            />
          </Box>
          {['', ...DIFFICULTIES].map((d) => {
            const active = difficultyFilter === d;
            return (
              <Button
                key={d || 'all'}
                onClick={() => setDifficultyFilter(d)}
                variant={active ? 'contained' : 'outlined'}
                sx={{ height: 44, fontWeight: active ? 600 : 500, ...(active ? {} : { bgcolor: palette.card, borderColor: palette.sandDeep, color: 'text.primary' }) }}
              >
                {d ? difficultyLabel[d] : 'All'}
              </Button>
            );
          })}
        </Box>

        <TableContainer sx={{ ...card }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Table sx={{ minWidth: { xs: 0, md: 600 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: { xs: 56, sm: 90 }, pl: { xs: 2, sm: 3 } }}>Status</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Topic</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell align="right" sx={{ pr: 3, display: { xs: 'none', sm: 'table-cell' } }}>Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((c, i) => (
                  <TableRow
                    key={c._id}
                    hover={c.isUnlocked}
                    onClick={() => open(c)}
                    sx={{ cursor: c.isUnlocked ? 'pointer' : 'default', bgcolor: i % 2 ? palette.stripe : 'transparent' }}
                  >
                    <TableCell sx={{ pl: { xs: 2, sm: 3 }, fontSize: 13, fontWeight: 600, color: palette.easy }}>
                      {c.isSolved ? 'Solved' : !c.isUnlocked ? <LockOutlined sx={{ fontSize: 16, color: '#8A7D75' }} titleAccess="Locked" /> : ''}
                    </TableCell>
                    <TableCell>
                      <Box
                        component="button"
                        disabled={!c.isUnlocked}
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); open(c); }}
                        sx={{ all: 'unset', cursor: c.isUnlocked ? 'pointer' : 'default', fontWeight: 500, fontSize: 14, color: c.isUnlocked ? 'text.primary' : '#8A7D75', '&:focus-visible': { outline: `2px solid ${palette.charcoal}` } }}
                      >
                        {all.indexOf(c) + 1}. {c.title}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', display: { xs: 'none', md: 'table-cell' } }}>
                      {[c.category, ...(c.tags || [])].filter(Boolean).slice(0, 2).join(', ')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: difficultyColor(c.difficulty) }}>
                      {difficultyLabel[c.difficulty] ?? c.difficulty}
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 3, fontFamily: fonts.mono, fontSize: 13, display: { xs: 'none', sm: 'table-cell' } }}>{c.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && filtered.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
              <Typography variant="h6">{all.length ? 'No problems match your filters' : 'No problems available yet'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {all.length ? 'Try a different search or difficulty.' : 'Check back soon.'}
              </Typography>
            </Box>
          )}
        </TableContainer>
      </Box>

      <Box component="aside" sx={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ ...card, p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" component="h2">Your progress</Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography sx={{ fontSize: 44, fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 1 }}>{solvedCount}</Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>of {all.length} solved</Typography>
          </Box>
          {progress.map((p) => (
            <Box key={p.difficulty}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, mb: 0.75 }}>
                <Box component="span" sx={{ fontWeight: 600, color: difficultyColor(p.difficulty) }}>{difficultyLabel[p.difficulty]}</Box>
                <Box component="span" sx={{ fontFamily: fonts.mono, color: 'text.secondary' }}>{p.solved} / {p.total}</Box>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(p.solved / p.total) * 100}
                sx={{ '& .MuiLinearProgress-bar': { bgcolor: difficultyColor(p.difficulty) } }}
              />
            </Box>
          ))}
        </Box>

        <Box sx={{ ...card, p: 3, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2">This week</Typography>
            <Button size="small" onClick={() => navigate('/leaderboard')} sx={{ minHeight: 0, color: 'text.secondary', fontWeight: 500 }}>Full board</Button>
          </Box>
          {(weekly?.leaderboard ?? []).slice(0, 5).map((e: any, i: number) => {
            const me = e._id === user?.id;
            return (
              <Box key={e._id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: 14, fontWeight: me ? 700 : 400 }}>
                <Box component="span" sx={{ fontFamily: fonts.mono, fontSize: 12, color: 'text.secondary', width: 22 }}>{String(e.rank ?? i + 1).padStart(2, '0')}</Box>
                <Box component="span" sx={{ flex: 1 }}>{me ? 'You' : [e.profile?.firstName, e.profile?.lastName].filter(Boolean).join(' ') || e.username}</Box>
                <Box component="span" sx={{ fontFamily: fonts.mono, fontSize: 13 }}>{e.stats?.weeklyPoints ?? 0}</Box>
              </Box>
            );
          })}
          {!weekly?.leaderboard?.length && <Typography variant="body2" color="text.secondary">No points scored this week yet.</Typography>}
        </Box>

        <Box sx={{ bgcolor: palette.charcoal, color: palette.page, borderRadius: '16px', p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ fontSize: 12, letterSpacing: '0.08em', color: '#C9BAAF' }}>SKILL TEST</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 500 }}>Skip ahead to harder problems</Typography>
          <Typography sx={{ fontSize: 13, color: '#C9BAAF' }}>Pass a short test to unlock the next difficulty level.</Typography>
          <Button
            onClick={() => navigate('/skill-test')}
            sx={{ alignSelf: 'flex-start', mt: 0.5, bgcolor: palette.sand, color: palette.ink, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', '&:hover': { bgcolor: '#EDE4DE' } }}
          >
            TAKE THE TEST
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Challenges;
