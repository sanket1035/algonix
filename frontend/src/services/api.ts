import axios from 'axios';
import { User, Challenge, Submission, LeaderboardEntry, RegisterData } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: RegisterData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData: Partial<User['profile']>) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },
};

// Challenges API
export const challengesAPI = {
  getChallenges: async (difficulty?: string, category?: string): Promise<Challenge[]> => {
    const params = new URLSearchParams();
    if (difficulty) params.append('difficulty', difficulty);
    if (category) params.append('category', category);
    
    const response = await api.get(`/challenges?${params.toString()}`);
    return response.data;
  },

  getChallenge: async (id: string): Promise<Challenge> => {
    const response = await api.get(`/challenges/${id}`);
    return response.data;
  },

  submitSkillTest: async (results: any[], difficulty: string) => {
    const response = await api.post('/challenges/skill-test/submit', { results, difficulty });
    return response.data;
  },

  getSkillTest: async (difficulty: string) => {
    const response = await api.post('/challenges/skill-test', { difficulty });
    return response.data;
  },
};

// Submissions API
export const submissionsAPI = {
  submitSolution: async (challengeId: string, code: string, language: string) => {
    const response = await api.post('/submissions', { challengeId, code, language });
    return response.data;
  },

  getMySubmissions: async (page = 1, limit = 20) => {
    const response = await api.get(`/submissions/my-submissions?page=${page}&limit=${limit}`);
    return response.data;
  },

  getSubmission: async (id: string): Promise<Submission> => {
    const response = await api.get(`/submissions/${id}`);
    return response.data;
  },
};

// Leaderboard API
export const leaderboardAPI = {
  getWeeklyLeaderboard: async (page = 1, limit = 50) => {
    const response = await api.get(`/leaderboard/weekly?page=${page}&limit=${limit}`);
    return response.data;
  },

  getAllTimeLeaderboard: async (page = 1, limit = 50) => {
    const response = await api.get(`/leaderboard/all-time?page=${page}&limit=${limit}`);
    return response.data;
  },

  getAroundMe: async (type = 'weekly') => {
    const response = await api.get(`/leaderboard/around-me?type=${type}`);
    return response.data;
  },
};

// Certificates API
export const certificatesAPI = {
  getMyCertificates: async () => {
    const response = await api.get('/certificates/my-certificates');
    return response.data;
  },

  generateCertificate: async (certificateId: string) => {
    const response = await api.get(`/certificates/generate/${certificateId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getChallenges: async () => {
    const response = await api.get('/admin/challenges');
    return response.data;
  },

  createChallenge: async (challengeData: Partial<Challenge>) => {
    const response = await api.post('/admin/challenges', challengeData);
    return response.data;
  },

  updateChallenge: async (id: string, challengeData: Partial<Challenge>) => {
    const response = await api.put(`/admin/challenges/${id}`, challengeData);
    return response.data;
  },

  deleteChallenge: async (id: string) => {
    const response = await api.delete(`/admin/challenges/${id}`);
    return response.data;
  },

  getUsers: async (page = 1, limit = 20, search = '') => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${search}`);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  resetWeeklyLeaderboard: async () => {
    const response = await api.post('/admin/reset-weekly');
    return response.data;
  },
};

export default api;