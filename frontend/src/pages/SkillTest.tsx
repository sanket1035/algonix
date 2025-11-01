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
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { Speed, CheckCircle, Lock } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { challengesAPI } from '../services/api';

const SkillTest: React.FC = () => {
  const [difficulty, setDifficulty] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<any>(null);

  const getTestMutation = useMutation({
    mutationFn: (difficulty: string) => challengesAPI.getSkillTest(difficulty),
    onSuccess: (data) => {
      console.log('Skill test data:', data);
      setTestQuestions(data.questions || data);
      setCurrentStep(1);
    },
  });

  const submitTestMutation = useMutation({
    mutationFn: ({ results, difficulty }: { results: any[]; difficulty: string }) =>
      challengesAPI.submitSkillTest(results, difficulty),
    onSuccess: (data) => {
      setResult(data);
      setCurrentStep(3);
    },
  });

  const handleStartTest = () => {
    if (!difficulty) return;
    getTestMutation.mutate(difficulty);
  };

  const handleAnswerChange = (questionIndex: number, answer: string) => {
    setAnswers({
      ...answers,
      [questionIndex]: answer,
    });
  };

  const handleSubmitTest = () => {
    const results = testQuestions.map((question, index) => {
      const selectedAnswer = parseInt(answers[index] || '-1');
      const isCorrect = selectedAnswer === question.correct;
      return {
        questionId: index,
        answer: selectedAnswer,
        correct: isCorrect
      };
    });

    submitTestMutation.mutate({ results, difficulty });
  };

  const canProceed = () => {
    return testQuestions.every((_, index) => answers[index]);
  };

  const steps = ['Select Difficulty', 'Take Test', 'Results'];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Skill Test 🚀
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Take a skill test to unlock challenges of a specific difficulty level
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: Select Difficulty */}
        {currentStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Difficulty Level
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Select the difficulty level you want to unlock. You'll need to answer 70% of questions correctly to pass.
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Difficulty Level</InputLabel>
              <Select
                value={difficulty}
                label="Difficulty Level"
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
                <MenuItem value="Expert">Expert</MenuItem>
              </Select>
            </FormControl>

            <Alert severity="info" sx={{ mb: 3 }}>
              The test will consist of 3 multiple-choice questions. You have unlimited time to complete it.
            </Alert>

            <Button
              variant="contained"
              size="large"
              startIcon={<Speed />}
              onClick={handleStartTest}
              disabled={!difficulty || getTestMutation.isPending}
              fullWidth
            >
              {getTestMutation.isPending ? <CircularProgress size={24} /> : 'Start Test'}
            </Button>
          </Box>
        )}

        {/* Step 1: Take Test */}
        {currentStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              {difficulty} Level Test
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Answer all questions to proceed. Choose the best answer for each question.
            </Typography>

            {testQuestions.map((question, index) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                    {question.question || question.title}
                  </Typography>

                  <FormControl component="fieldset">
                    <RadioGroup
                      value={answers[index] || ''}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                    >
                      {(question.options || []).map((option: string, optionIndex: number) => (
                        <FormControlLabel
                          key={optionIndex}
                          value={optionIndex.toString()}
                          control={<Radio />}
                          label={option}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            ))}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentStep(0)}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmitTest}
                disabled={!canProceed() || submitTestMutation.isPending}
                sx={{ flexGrow: 1 }}
              >
                {submitTestMutation.isPending ? <CircularProgress size={24} /> : 'Submit Test'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Step 2: Results */}
        {currentStep === 3 && result && (
          <Box sx={{ textAlign: 'center' }}>
            {result.passed ? (
              <Box>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  Congratulations! 🎉
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  You passed the {difficulty} level test with a score of {result.score}/{result.total}
                </Typography>
                <Alert severity="success" sx={{ mb: 3 }}>
                  You've unlocked {result.unlockedCount} new {difficulty} level challenges!
                </Alert>
              </Box>
            ) : (
              <Box>
                <Lock sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                  Test Not Passed
                </Typography>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  You scored {result.score}/{result.total}. You need at least {Math.ceil(result.total * 0.7)} correct answers to pass.
                </Typography>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Don't worry! You can retake the test anytime. Keep practicing and try again!
                </Alert>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentStep(0);
                  setResult(null);
                  setAnswers({});
                  setTestQuestions([]);
                  setDifficulty('');
                }}
              >
                Take Another Test
              </Button>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/challenges'}
              >
                View Challenges
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SkillTest;