import React, { useState } from 'react';
import axios from 'axios';
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
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Send, CheckCircle, Error as ErrorIcon, Description, Code as CodeIcon } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
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

type Language = 'javascript' | 'python' | 'java' | 'cpp';

const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [activeTab, setActiveTab] = useState(0);
  const [mobileView, setMobileView] = useState<'problem' | 'code'>('problem');
  const [codesByLanguage, setCodesByLanguage] = useState<Record<Language, string>>({
    javascript: '',
    python: '',
    java: '',
    cpp: '',
  });
  const [language, setLanguage] = useState<Language>('javascript');
  const [submissionResult, setSubmissionResult] = useState<any>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const { data: challenge, isLoading, error } = useQuery({
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
    onError: (error: any) => {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : error instanceof Error
        ? error.message
        : 'Submission failed';
      setSubmissionError(message);
    },
  });

  const getDefaultStarterCode = (lang: Language) => {
    const templates: Record<Language, string> = {
      javascript: `// Write your JavaScript solution here\nfunction solve(nums, target) {\n  // TODO: implement solution\n  return [];\n}`,
      python: `# Write your Python solution here\ndef solve(nums, target):\n    # TODO: implement solution\n    pass`,
      java: `// Write your Java solution here\nimport java.util.*;\npublic class Solution {\n    public static int[] solve(int[] nums, int target) {\n        // TODO: implement solution\n        return new int[0];\n    }\n}`,
      cpp: `// Write your C++ solution here\n#include <vector>\nusing namespace std;\nvector<int> solve(vector<int>& nums, int target) {\n    // TODO: implement solution\n    return {};\n}`,
    };
    return templates[lang] || templates.javascript;
  };

  React.useEffect(() => {
    if (!challenge) return;

    const nextCodes: Record<Language, string> = {
      javascript: challenge.starterCode?.javascript || getDefaultStarterCode('javascript'),
      python: challenge.starterCode?.python || getDefaultStarterCode('python'),
      java: challenge.starterCode?.java || getDefaultStarterCode('java'),
      cpp: challenge.starterCode?.cpp || getDefaultStarterCode('cpp'),
    };

    setCodesByLanguage((prev) => ({
      javascript: prev.javascript || nextCodes.javascript,
      python: prev.python || nextCodes.python,
      java: prev.java || nextCodes.java,
      cpp: prev.cpp || nextCodes.cpp,
    }));
  }, [challenge]);

  const code = codesByLanguage[language] || '';
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const handleCodeChange = (value: string | undefined) => {
    setCodesByLanguage((prev) => ({
      ...prev,
      [language]: value || '',
    }));
  };

  const isPlaceholderCode = (source: string) => {
    const stripped = source
      .replace(/\/\/.*$/gm, '')
      .replace(/#.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//gm, '')
      .replace(/\s+/g, '')
      .toLowerCase();

    return (
      !stripped ||
      stripped === 'pass' ||
      stripped.includes('todo') ||
      stripped === 'return;' ||
      stripped === 'return' ||
      stripped === 'thrownewerror();' ||
      stripped === 'thrownewerror'
    );
  };

  const handleClearCode = () => {
    setCodesByLanguage((prev) => ({
      ...prev,
      [language]: '',
    }));
    setCopyMessage(null);
    setSubmissionError(null);
  };

  const handleCopyStarterCode = async () => {
    const starterCode = challenge?.starterCode?.[language] || getDefaultStarterCode(language);
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API unavailable');
      }
      await navigator.clipboard.writeText(starterCode);
      setCopyMessage('Starter code copied to clipboard.');
    } catch (err) {
      setCopyMessage('Unable to copy starter code.');
    }
  };

  const handleSubmit = () => {
    if (!id) return;
    if (!challenge?.isUnlocked) {
      setSubmissionError('This challenge is locked. Unlock it before submitting.');
      return;
    }
    if (!code.trim() || isPlaceholderCode(code)) {
      setSubmissionError('Please write a valid solution before submitting.');
      return;
    }

    const PLACEHOLDER_PATTERNS = [
      '// TODO: implement solution',
      '// Write your',
      'return [];',
    ];

    const isPlaceholder = PLACEHOLDER_PATTERNS.some(p => code.includes(p)) 
      || code.trim().length < 50;

    if (isPlaceholder) {
      setSubmissionError('Please write your actual solution before submitting!');
      return;
    }

    setSubmissionError(null);
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

  if (error) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || error.message
      : error instanceof Error
      ? error.message
      : 'Unable to load challenge';

    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">{errorMessage}</Alert>
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

  const panelHeight = isMobile ? 'auto' : 'calc(100vh - 150px)';
  const editorMinHeight = isMobile ? 350 : undefined;

  const problemPanel = (
    <Paper sx={{ height: panelHeight, minHeight: isMobile ? 300 : undefined, overflow: 'auto' }}>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            {challenge.title}
          </Typography>
          {challenge.isSolved && <CheckCircle color="success" />}
        </Box>

        {!challenge.isUnlocked && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This challenge is locked. Solve the prerequisite challenges or take the skill test to unlock it.
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          <Chip
            label={challenge.difficulty}
            color={getDifficultyColor(challenge.difficulty) as any}
            size={isMobile ? 'small' : 'medium'}
          />
          <Chip label={`${challenge.points} points`} variant="outlined" size={isMobile ? 'small' : 'medium'} />
          <Chip label={`${challenge.timeLimit}s`} variant="outlined" size={isMobile ? 'small' : 'medium'} />
          <Chip label={`${challenge.memoryLimit}MB`} variant="outlined" size={isMobile ? 'small' : 'medium'} />
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
        >
          <Tab label="Description" />
          <Tab label="Examples" />
          <Tab label="Constraints" />
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {challenge.description}
          </Typography>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {(Array.isArray(challenge.examples) ? challenge.examples : []).map((example, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
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
                      fontSize: '0.8rem',
                      overflow: 'auto',
                      maxWidth: '100%',
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
                      fontSize: '0.8rem',
                      overflow: 'auto',
                      maxWidth: '100%',
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
  );

  const codePanel = (
    <Paper sx={{ height: panelHeight, minHeight: editorMinHeight, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: { xs: 1.5, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {(['javascript', 'python', 'java', 'cpp'] as Language[]).map((lang) => (
              <Button
                key={lang}
                variant={language === lang ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setLanguage(lang)}
                sx={{ fontSize: { xs: '0.7rem', sm: '0.8125rem' }, px: { xs: 1, sm: 1.5 } }}
              >
                {isMobile ? lang.slice(0, 2).toUpperCase() : lang.toUpperCase()}
              </Button>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
            <Button variant="outlined" size="small" onClick={handleClearCode} sx={{ flex: { xs: 1, sm: 'none' } }}>
              Clear
            </Button>
            <Button variant="outlined" size="small" onClick={handleCopyStarterCode} sx={{ flex: { xs: 1, sm: 'none' } }}>
              {isMobile ? 'Copy' : 'Copy starter code'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={submitMutation.isPending || !code.trim() || !challenge?.isUnlocked}
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              {submitMutation.isPending ? <CircularProgress size={20} /> : 'Submit'}
            </Button>
          </Box>
        </Box>
        {(copyMessage || !challenge?.isUnlocked || !code.trim()) && (
          <Box sx={{ mt: 1 }}>
            {!challenge?.isUnlocked ? (
              <Alert severity="warning">This challenge is locked. Unlock it before submitting.</Alert>
            ) : copyMessage ? (
              <Alert severity={copyMessage.includes('Unable') ? 'error' : 'success'}>{copyMessage}</Alert>
            ) : (
              <Alert severity="info">Enter your solution code before submitting.</Alert>
            )}
          </Box>
        )}
        {submissionResult && submissionResult.status && (
          <Box sx={{ mt: 1 }}>
            <Alert severity={submissionResult.status === 'Accepted' ? 'success' : 'info'}>
              Last submission: {submissionResult.status}. Score: {submissionResult.score ?? 'N/A'}%.
            </Alert>
          </Box>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: editorMinHeight || 0 }}>
        <Editor
          key={language}
          height={isMobile ? '350px' : '100%'}
          language={getLanguageId(language)}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: isMobile ? 13 : 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </Box>

      {submissionError && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Alert severity="error">{submissionError}</Alert>
        </Box>
      )}

      {submissionResult && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Alert
            severity={submissionResult.judgeServiceUnavailable ? 'warning' : submissionResult.status === 'Accepted' ? 'success' : 'error'}
            icon={submissionResult.judgeServiceUnavailable ? <ErrorIcon /> : submissionResult.status === 'Accepted' ? <CheckCircle /> : <ErrorIcon />}
          >
            <Typography variant="subtitle2">
              {submissionResult.message} - Score: {submissionResult.score}%
            </Typography>
            {submissionResult.judgeServiceUnavailable && (
              <Typography variant="body2">
                Judge service unavailable. Submission could not be verified. Please try again later.
              </Typography>
            )}
            {submissionResult.pointsEarned > 0 && (
              <Typography variant="body2">
                Points earned: {submissionResult.pointsEarned}
              </Typography>
            )}
          </Alert>

          {Array.isArray(submissionResult.testResults) && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Test Results:</Typography>
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
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 3 } }}>
      {isMobile && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={mobileView}
            exclusive
            onChange={(_, val) => val && setMobileView(val)}
            size="small"
            fullWidth
            sx={{ maxWidth: 400 }}
          >
            <ToggleButton value="problem" sx={{ flex: 1, textTransform: 'none' }}>
              <Description sx={{ mr: 0.5, fontSize: 18 }} />
              Problem
            </ToggleButton>
            <ToggleButton value="code" sx={{ flex: 1, textTransform: 'none' }}>
              <CodeIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Code
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {isMobile ? (
          <Grid item xs={12}>
            {mobileView === 'problem' ? problemPanel : codePanel}
          </Grid>
        ) : (
          <>
            <Grid item xs={12} md={6}>
              {problemPanel}
            </Grid>
            <Grid item xs={12} md={6}>
              {codePanel}
            </Grid>
          </>
        )}
      </Grid>
    </Container>
  );
};

export default ChallengeDetail;