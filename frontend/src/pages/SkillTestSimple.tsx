import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { challengesAPI } from '../services/api';

const SkillTestSimple: React.FC = () => {
  const [difficulty, setDifficulty] = useState('');
  const [step, setStep] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<any>(null);

  const getTest = useMutation({
    mutationFn: (difficulty: string) => challengesAPI.getSkillTest(difficulty),
    onSuccess: (data) => {
      const qs = Array.isArray(data) ? data : Array.isArray(data?.questions) ? data.questions : [];
      setQuestions(qs);
      setStep(1);
    },
  });

  const submitTest = useMutation({
    mutationFn: ({ results, difficulty }: { results: any[]; difficulty: string }) =>
      challengesAPI.submitSkillTest(results, difficulty),
    onSuccess: (data) => {
      setResult(data);
      setStep(2);
    },
  });

  const handleSubmit = () => {
    const results = questions.map((q, i) => ({
      questionId: i,
      answer: answers[i] ?? -1,
      correct: answers[i] !== undefined && answers[i] === q.correct
    }));
    submitTest.mutate({ results, difficulty });
  };

  const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i] !== undefined);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Skill Test 🚀</Typography>

      {step === 0 && (
        <Paper sx={{ p: 4 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
              <MenuItem value="Expert">Expert</MenuItem>
            </Select>
          </FormControl>
          <Button 
            variant="contained" 
            onClick={() => getTest.mutate(difficulty)}
            disabled={!difficulty}
            fullWidth
          >
            Start Test
          </Button>
        </Paper>
      )}

      {step === 1 && (
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>{difficulty} Test</Typography>
          
          {questions.map((q, i) => (
            <Card key={i} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">Q{i + 1}: {q.question}</Typography>
                <RadioGroup
                  value={answers[i]?.toString() || ''}
                  onChange={(e) => setAnswers({...answers, [i]: parseInt(e.target.value)})}
                >
                  {(q.options || []).map((opt: string, j: number) => (
                    <FormControlLabel key={j} value={j.toString()} control={<Radio />} label={opt} />
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={() => setStep(0)}>Back</Button>
            <Button 
              variant="contained" 
              onClick={handleSubmit}
              disabled={!allAnswered || submitTest.isPending}
              sx={{ flexGrow: 1 }}
            >
              {submitTest.isPending ? 'Submitting...' : 'Submit Test'}
            </Button>
          </Box>
        </Paper>
      )}

      {step === 2 && result && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          {result.passed ? (
            <Box>
              <Typography variant="h5" color="success.main">Passed! 🎉</Typography>
              <Typography>Score: {result.score}/{result.total}</Typography>
              <Alert severity="success" sx={{ mt: 2 }}>
                Unlocked {result.unlockedCount} challenges!
              </Alert>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" color="error.main">Not Passed</Typography>
              <Typography>Score: {result.score}/{result.total}</Typography>
              <Typography>Need: {Math.ceil(result.total * 0.7)}/{result.total}</Typography>
            </Box>
          )}
          
          <Button 
            variant="contained" 
            onClick={() => {
              setStep(0);
              setResult(null);
              setAnswers({});
              setQuestions([]);
              setDifficulty('');
            }}
            sx={{ mt: 3 }}
          >
            Take Another Test
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default SkillTestSimple;