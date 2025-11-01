import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { PlayArrow, Send, CheckCircle, Error } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Editor from '@monaco-editor/react';
import { challengesAPI, submissionsAPI } from '../services/api';
import { Challenge } from '../types';

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

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const { data: challenge, isLoading } = useQuery({
    queryKey: ['challenge', id],
    queryFn: () => challengesAPI.getChallenge(id!),
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: ({ challengeId, code, language }: { challengeId: string; code: string; language: string }) =>
      submissionsAPI.submitSolution(challengeId, code, language),
    onSuccess: (data) => {
      setSubmissionResult(data);
      queryClient.invalidateQueries({ queryKey: ['challenge', id] });
    },
  });

  React.useEffect(() => {
    if (challenge?.starterCode) {
      setCode(challenge.starterCode[language as keyof typeof challenge.starterCode] || '');
    }
  }, [challenge, language]);

  const handleSubmit = () => {
    if (!id || !code.trim()) return;
    
    submitMutation.mutate({
      challengeId: id,
      code,
      language,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      case 'Expert': return 'secondary';
      default: return 'default';
    }
  };

  const getLanguageId = (lang: string) => {
    const map: Record<string, string> = {
      javascript: 'javascript',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
    };
    return map[lang] || 'javascript';
  };

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!challenge) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Challenge not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Problem Description */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: 'calc(100vh - 150px)', overflow: 'auto' }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                  {challenge.title}
                </Typography>
                {challenge.isSolved && <CheckCircle color="success" />}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip
                  label={challenge.difficulty}
                  color={getDifficultyColor(challenge.difficulty) as any}
                />
                <Chip label={`${challenge.points} points`} variant="outlined" />
                <Chip label={`${challenge.timeLimit}s`} variant="outlined" />
                <Chip label={`${challenge.memoryLimit}MB`} variant="outlined" />
              </Box>

              <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                <Tab label="Description" />
                <Tab label="Examples" />
                <Tab label="Constraints" />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                  {challenge.description}
                </Typography>
              </TabPanel>

              <TabPanel value={activeTab} index={1}>
                {challenge.examples.map((example, index) => (
                  <Card key={index} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Example {index + 1}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Input:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            backgroundColor: '#f5f5f5',
                            p: 1,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            overflow: 'auto',
                          }}
                        >
                          {example.input}
                        </Box>
                      </Box>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Output:
                        </Typography>
                        <Box
                          component="pre"
                          sx={{
                            backgroundColor: '#f5f5f5',
                            p: 1,
                            borderRadius: 1,
                            fontSize: '0.875rem',
                            overflow: 'auto',
                          }}
                        >
                          {example.output}
                        </Box>
                      </Box>
                      {example.explanation && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Explanation:
                          </Typography>
                          <Typography variant="body2">{example.explanation}</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabPanel>

              <TabPanel value={activeTab} index={2}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {challenge.constraints}
                </Typography>
              </TabPanel>
            </Box>
          </Paper>
        </Grid>

        {/* Code Editor */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ height: 'calc(100vh - 150px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['javascript', 'python', 'java', 'cpp'].map((lang) => (
                    <Button
                      key={lang}
                      variant={language === lang ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => setLanguage(lang)}
                    >
                      {lang.toUpperCase()}
                    </Button>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || !code.trim()}
                >
                  {submitMutation.isPending ? <CircularProgress size={20} /> : 'Submit'}
                </Button>
              </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }}>
              <Editor
                height="100%"
                language={getLanguageId(language)}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </Box>

            {/* Submission Result */}
            {submissionResult && (
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Alert
                  severity={submissionResult.status === 'Accepted' ? 'success' : 'error'}
                  icon={submissionResult.status === 'Accepted' ? <CheckCircle /> : <Error />}
                >
                  <Typography variant="subtitle2">
                    {submissionResult.status} - Score: {submissionResult.score}%
                  </Typography>
                  {submissionResult.pointsEarned > 0 && (
                    <Typography variant="body2">
                      Points earned: {submissionResult.pointsEarned}
                    </Typography>
                  )}
                </Alert>

                {submissionResult.testResults && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Test Results:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {submissionResult.testResults.map((result: any, index: number) => (
                        <Chip
                          key={index}
                          label={`Test ${result.testCase}`}
                          color={result.passed ? 'success' : 'error'}
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ChallengeDetail;