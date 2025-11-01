export interface User {
  id: string;
  username: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
  };
  stats: {
    totalPoints: number;
    weeklyPoints: number;
    level: number;
    solvedProblems: number;
    streak: number;
    lastSolveDate?: string;
  };
  badges: Badge[];
  certificates: Certificate[];
  solvedChallenges: string[];
  unlockedChallenges: string[];
  isAdmin?: boolean;
}

export interface Challenge {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category?: string;
  points: number;
  timeLimit: number;
  memoryLimit: number;
  testCases: TestCase[];
  starterCode: {
    javascript?: string;
    python?: string;
    java?: string;
    cpp?: string;
  };
  constraints?: string;
  examples: Example[];
  tags: string[];
  order: number;
  isActive: boolean;
  prerequisites: string[];
  fastTrackUnlock: boolean;
  isSolved?: boolean;
  isUnlocked?: boolean;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface Example {
  input: string;
  output: string;
  explanation: string;
}

export interface Submission {
  _id: string;
  user: string;
  challenge: Challenge;
  code: string;
  language: string;
  status: 'Pending' | 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error';
  executionTime?: number;
  memoryUsed?: number;
  testResults: TestResult[];
  score: number;
  pointsEarned: number;
  createdAt: string;
}

export interface TestResult {
  testCase: number;
  status: string;
  executionTime: number;
  memoryUsed: number;
  output: string;
  error?: string;
  expected?: string;
  passed: boolean;
}

export interface Badge {
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Certificate {
  _id: string;
  name: string;
  level: string;
  earnedAt: string;
  pdfUrl?: string;
}

export interface LeaderboardEntry {
  _id: string;
  username: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  stats: {
    totalPoints?: number;
    weeklyPoints?: number;
    level: number;
    solvedProblems?: number;
  };
  rank: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<User['profile']>) => Promise<void>;
  loading: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}