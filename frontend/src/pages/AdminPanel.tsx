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
  EmojiEvents,
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

  const [certEmail, setCertEmail] = useState('');
  const [certType, setCertType] = useState('Beginner Mastery');

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

  const issueCertMutation = useMutation({
    mutationFn: ({ email, type }: { email: string; type: string }) => adminAPI.issueCertificate(email, type),
    onSuccess: (data: any) => {
      alert(data.message || 'Certificate issued successfully!');
      setCertEmail('');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      const errMsg = error.response?.data?.message || error.message || 'Failed to issue certificate';
      alert(errMsg);
    }
  });

  const handleIssueCertificate = () => {
    if (!certEmail.trim()) {
      alert('Please enter a student email.');
      return;
    }
    issueCertMutation.mutate({ email: certEmail, type: certType });
  };

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

  // Sample certificate HTML generator
  const generateSampleCertificateHTML = (user: any, certificate: any) => {
    const userName = `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() || user.username;
    const date = new Date(certificate.earnedAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Algonix Certificate</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            margin: 0;
            padding: 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate {
            background: white;
            padding: 60px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 800px;
            width: 100%;
            border: 8px solid #f8f9fa;
            position: relative;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 3px solid #667eea;
            border-radius: 10px;
          }
          .logo {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
          }
          .title {
            font-size: 36px;
            color: #2c3e50;
            margin-bottom: 20px;
          }
          .subtitle {
            font-size: 18px;
            color: #7f8c8d;
            margin-bottom: 40px;
          }
          .recipient {
            font-size: 32px;
            color: #2c3e50;
            margin-bottom: 30px;
            font-weight: bold;
          }
          .achievement {
            font-size: 24px;
            color: #667eea;
            margin-bottom: 40px;
            font-weight: bold;
          }
          .badge {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            border-radius: 25px;
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0;
          }
          .details {
            font-size: 16px;
            color: #7f8c8d;
            margin-bottom: 40px;
            line-height: 1.6;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #ecf0f1;
          }
          .date {
            font-size: 14px;
            color: #7f8c8d;
          }
          .signature {
            text-align: center;
          }
          .signature-line {
            border-top: 2px solid #2c3e50;
            width: 200px;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="logo">ALGONIX</div>
          <div class="title">Certificate of Achievement</div>
          <div class="subtitle">This is to certify that</div>
          
          <div class="recipient">${userName}</div>
          
          <div class="achievement">has successfully completed</div>
          
          <div class="badge">${certificate.name}</div>
          
          <div class="details">
            This certificate recognizes the completion of ${certificate.level} level challenges<br>
            and demonstrates proficiency in algorithmic problem solving and programming skills.
          </div>
          
          <div class="footer">
            <div class="date">Issued on ${date}</div>
            <div class="signature">
              <div class="signature-line"></div>
              <div>Algonix Platform</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
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
          <Tab icon={<EmojiEvents />} label="Certificates" iconPosition="start" />
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
                    <TableCell>{user.stats?.level ?? 1}</TableCell>
                    <TableCell>{user.stats?.totalPoints ?? 0}</TableCell>
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

        {/* Certificates Tab */}
        <TabPanel value={activeTab} index={3}>
          <Typography variant="h6" gutterBottom>
            Certificate Management
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sample Certificate Preview
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Preview how certificates look when issued to students.
                  </Typography>
                  
                  <Button 
                    variant="contained" 
                    startIcon={<EmojiEvents />}
                    onClick={() => {
                      const sampleCert = {
                        name: 'Beginner Mastery',
                        level: 'Beginner',
                        earnedAt: new Date()
                      };
                      
                      const sampleUser = {
                        username: 'sample_student',
                        profile: {
                          firstName: 'John',
                          lastName: 'Doe'
                        }
                      };
                      
                      const html = generateSampleCertificateHTML(sampleUser, sampleCert);
                      const newWindow = window.open('', '_blank');
                      if (newWindow) {
                        newWindow.document.write(html);
                        newWindow.document.close();
                      }
                    }}
                    fullWidth
                  >
                    Preview Sample Certificate
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Manual Certificate Issuance
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Manually award certificates to deserving students.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Student Email"
                      placeholder="student@example.com"
                      size="small"
                      fullWidth
                      value={certEmail}
                      onChange={(e) => setCertEmail(e.target.value)}
                    />
                    <FormControl size="small" fullWidth>
                      <InputLabel>Certificate Type</InputLabel>
                      <Select 
                        label="Certificate Type"
                        value={certType}
                        onChange={(e) => setCertType(e.target.value as string)}
                      >
                        <MenuItem value="Beginner Mastery">🥉 Beginner Mastery</MenuItem>
                        <MenuItem value="Intermediate Mastery">🥈 Intermediate Mastery</MenuItem>
                        <MenuItem value="Advanced Mastery">🥇 Advanced Mastery</MenuItem>
                      </Select>
                    </FormControl>
                    <Button 
                      variant="outlined" 
                      startIcon={<Add />}
                      fullWidth
                      onClick={handleIssueCertificate}
                    >
                      Issue Certificate
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Certificate Criteria & Auto-Awarding
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                Certificates are automatically awarded when students reach these milestones:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, border: 1, borderColor: 'success.main', borderRadius: 1 }}>
                    <Typography variant="subtitle1" color="success.main" gutterBottom>
                      🥉 Beginner Mastery
                    </Typography>
                    <Typography variant="body2">
                      Auto-awarded after solving 3 Beginner level problems
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, border: 1, borderColor: 'warning.main', borderRadius: 1 }}>
                    <Typography variant="subtitle1" color="warning.main" gutterBottom>
                      🥈 Intermediate Mastery
                    </Typography>
                    <Typography variant="body2">
                      Auto-awarded after solving 5 Intermediate level problems
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ p: 2, border: 1, borderColor: 'error.main', borderRadius: 1 }}>
                    <Typography variant="subtitle1" color="error.main" gutterBottom>
                      🥇 Advanced Mastery
                    </Typography>
                    <Typography variant="body2">
                      Auto-awarded after solving 10 Advanced level problems
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
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
            
            {/* Test Cases Section */}
            <Typography variant="h6" sx={{ mt: 2 }}>Test Cases</Typography>
            {challengeForm.testCases.map((testCase, index) => (
              <Box key={index} sx={{ border: 1, borderColor: 'grey.300', p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Test Case {index + 1}</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                  <TextField
                    label="Input"
                    value={testCase.input}
                    onChange={(e) => {
                      const newTestCases = [...challengeForm.testCases];
                      newTestCases[index].input = e.target.value;
                      setChallengeForm({ ...challengeForm, testCases: newTestCases });
                    }}
                    fullWidth
                  />
                  <TextField
                    label="Expected Output"
                    value={testCase.expectedOutput}
                    onChange={(e) => {
                      const newTestCases = [...challengeForm.testCases];
                      newTestCases[index].expectedOutput = e.target.value;
                      setChallengeForm({ ...challengeForm, testCases: newTestCases });
                    }}
                    fullWidth
                  />
                </Box>
              </Box>
            ))}
            <Button onClick={addTestCase} variant="outlined" size="small">
              Add Test Case
            </Button>
            
            {/* Starter Code Section */}
            <Typography variant="h6" sx={{ mt: 2 }}>Starter Code</Typography>
            <TextField
              label="JavaScript Starter Code"
              value={challengeForm.starterCode.javascript}
              onChange={(e) => setChallengeForm({ 
                ...challengeForm, 
                starterCode: { ...challengeForm.starterCode, javascript: e.target.value }
              })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              label="Python Starter Code"
              value={challengeForm.starterCode.python}
              onChange={(e) => setChallengeForm({ 
                ...challengeForm, 
                starterCode: { ...challengeForm.starterCode, python: e.target.value }
              })}
              multiline
              rows={3}
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