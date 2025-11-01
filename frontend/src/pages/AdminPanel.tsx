import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AdminPanelSettings,
  Assessment,
  People,
  Code,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
  </div>
);

const AdminPanel: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [challengeDialog, setChallengeDialog] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [challengeForm, setChallengeForm] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    points: 100,
    timeLimit: 60,
    memoryLimit: 128,
    category: '',
    tags: '',
    constraints: '',
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    starterCode: {
      javascript: '',
      python: '',
      java: '',
      cpp: '',
    },
  });

  const { data: challenges } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: adminAPI.getChallenges,
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminAPI.getUsers(),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminAPI.getStats,
  });

  const createChallengeMutation = useMutation({
    mutationFn: adminAPI.createChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      setChallengeDialog(false);
      resetChallengeForm();
    },
  });

  const updateChallengeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminAPI.updateChallenge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      setChallengeDialog(false);
      setEditingChallenge(null);
      resetChallengeForm();
    },
  });

  const deleteChallengeMutation = useMutation({
    mutationFn: adminAPI.deleteChallenge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
    },
  });

  const resetChallengeForm = () => {
    setChallengeForm({
      title: '',
      description: '',
      difficulty: 'Beginner',
      points: 100,
      timeLimit: 60,
      memoryLimit: 128,
      category: '',
      tags: '',
      constraints: '',
      examples: [{ input: '', output: '', explanation: '' }],
      testCases: [{ input: '', expectedOutput: '', isHidden: false }],
      starterCode: {
        javascript: '',
        python: '',
        java: '',
        cpp: '',
      },
    });
  };

  const handleEditChallenge = (challenge: any) => {
    setEditingChallenge(challenge);
    setChallengeForm({
      ...challenge,
      tags: challenge.tags.join(', '),
    });
    setChallengeDialog(true);
  };

  const handleSaveChallenge = () => {
    const formData = {
      ...challengeForm,
      tags: challengeForm.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      difficulty: challengeForm.difficulty as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
    };

    if (editingChallenge) {
      updateChallengeMutation.mutate({ id: editingChallenge._id, data: formData });
    } else {
      createChallengeMutation.mutate(formData);
    }
  };

  const addExample = () => {
    setChallengeForm({
      ...challengeForm,
      examples: [...challengeForm.examples, { input: '', output: '', explanation: '' }],
    });
  };

  const addTestCase = () => {
    setChallengeForm({
      ...challengeForm,
      testCases: [...challengeForm.testCases, { input: '', expectedOutput: '', isHidden: false }],
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Admin Panel 🛠️
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h4">{stats?.totalUsers || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Users
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Code sx={{ fontSize: 40, color: 'secondary.main' }} />
                <Box>
                  <Typography variant="h4">{stats?.totalChallenges || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Challenges
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assessment sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography variant="h4">{stats?.activeChallenges || 0}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Challenges
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab icon={<Code />} label="Challenges" iconPosition="start" />
          <Tab icon={<People />} label="Users" iconPosition="start" />
          <Tab icon={<Assessment />} label="Statistics" iconPosition="start" />
        </Tabs>

        {/* Challenges Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">Manage Challenges</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setChallengeDialog(true)}
            >
              Add Challenge
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {challenges?.map((challenge: any) => (
                  <TableRow key={challenge._id}>
                    <TableCell>{challenge.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={challenge.difficulty}
                        color={
                          challenge.difficulty === 'Beginner' ? 'success' :
                          challenge.difficulty === 'Intermediate' ? 'warning' :
                          challenge.difficulty === 'Advanced' ? 'error' : 'secondary'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{challenge.points}</TableCell>
                    <TableCell>
                      <Chip
                        label={challenge.isActive ? 'Active' : 'Inactive'}
                        color={challenge.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditChallenge(challenge)}>
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => deleteChallengeMutation.mutate(challenge._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Users Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Points</TableCell>
                  <TableCell>Admin</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users?.users?.map((user: any) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.stats.level}</TableCell>
                    <TableCell>{user.stats.totalPoints}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isAdmin ? 'Admin' : 'User'}
                        color={user.isAdmin ? 'secondary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Statistics Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="h6" gutterBottom>
            Platform Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Difficulty Distribution
                  </Typography>
                  {stats?.difficultyStats?.map((stat: any) => (
                    <Box key={stat._id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">{stat._id}</Typography>
                        <Typography variant="body2">{stat.count}</Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    User Level Distribution
                  </Typography>
                  {stats?.userLevelStats?.map((stat: any) => (
                    <Box key={stat._id} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Level {stat._id}</Typography>
                        <Typography variant="body2">{stat.count} users</Typography>
                      </Box>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Challenge Dialog */}
      <Dialog open={challengeDialog} onClose={() => setChallengeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              value={challengeForm.title}
              onChange={(e) => setChallengeForm({ ...challengeForm, title: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={challengeForm.description}
              onChange={(e) => setChallengeForm({ ...challengeForm, description: e.target.value })}
              multiline
              rows={4}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  value={challengeForm.difficulty}
                  label="Difficulty"
                  onChange={(e) => setChallengeForm({ ...challengeForm, difficulty: e.target.value })}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                  <MenuItem value="Expert">Expert</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Points"
                type="number"
                value={challengeForm.points}
                onChange={(e) => setChallengeForm({ ...challengeForm, points: parseInt(e.target.value) })}
              />
              <TextField
                label="Time Limit (s)"
                type="number"
                value={challengeForm.timeLimit}
                onChange={(e) => setChallengeForm({ ...challengeForm, timeLimit: parseInt(e.target.value) })}
              />
            </Box>
            <TextField
              label="Tags (comma separated)"
              value={challengeForm.tags}
              onChange={(e) => setChallengeForm({ ...challengeForm, tags: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChallengeDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveChallenge} variant="contained">
            {editingChallenge ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;