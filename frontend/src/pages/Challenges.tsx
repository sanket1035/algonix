import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Lock,
  CheckCircle,
  PlayArrow,
  Search,
  FilterList,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { challengesAPI } from '../services/api';
import { Challenge } from '../types';

const Challenges: React.FC = () => {
  const navigate = useNavigate();
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['challenges', difficultyFilter],
    queryFn: () => challengesAPI.getChallenges(difficultyFilter),
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Advanced':
        return 'error';
      case 'Expert':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const filteredChallenges = challenges?.filter((challenge: Challenge) =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const groupedChallenges = filteredChallenges.reduce((acc: Record<string, Challenge[]>, challenge: Challenge) => {
    if (!acc[challenge.difficulty]) {
      acc[challenge.difficulty] = [];
    }
    acc[challenge.difficulty].push(challenge);
    return acc;
  }, {});

  const difficultyOrder = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography>Loading challenges...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Coding Challenges
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Sharpen your skills with our curated collection of programming problems
        </Typography>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search challenges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 300 }}
          />
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficultyFilter}
              label="Difficulty"
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
              <MenuItem value="Expert">Expert</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => navigate('/skill-test')}
          >
            Take Skill Test
          </Button>
        </Box>
      </Box>

      {/* Challenge Groups */}
      {difficultyOrder.map((difficulty) => {
        const challengesInDifficulty = groupedChallenges[difficulty];
        if (!challengesInDifficulty || challengesInDifficulty.length === 0) return null;

        return (
          <Box key={difficulty} sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              {difficulty} ({challengesInDifficulty.length})
            </Typography>
            
            <Grid container spacing={3}>
              {challengesInDifficulty.map((challenge: Challenge) => (
                <Grid item xs={12} sm={6} md={4} key={challenge._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      opacity: challenge.isUnlocked ? 1 : 0.6,
                      border: challenge.isSolved ? '2px solid #4caf50' : 'none',
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                          {challenge.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {challenge.isSolved && (
                            <Tooltip title="Solved">
                              <CheckCircle color="success" />
                            </Tooltip>
                          )}
                          {!challenge.isUnlocked && (
                            <Tooltip title="Locked">
                              <Lock color="disabled" />
                            </Tooltip>
                          )}
                        </Box>
                      </Box>

                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {challenge.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={challenge.difficulty}
                          color={getDifficultyColor(challenge.difficulty) as any}
                          size="small"
                        />
                        <Chip
                          label={`${challenge.points} pts`}
                          variant="outlined"
                          size="small"
                        />
                        {challenge.tags.slice(0, 2).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>

                      <Button
                        variant={challenge.isSolved ? 'outlined' : 'contained'}
                        startIcon={challenge.isUnlocked ? <PlayArrow /> : <Lock />}
                        onClick={() => challenge.isUnlocked && navigate(`/challenges/${challenge._id}`)}
                        disabled={!challenge.isUnlocked}
                        fullWidth
                      >
                        {challenge.isSolved ? 'View Solution' : challenge.isUnlocked ? 'Solve' : 'Locked'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}

      {filteredChallenges.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary">
            No challenges found matching your criteria
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Challenges;