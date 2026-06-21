import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { authAPI } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const normalizeUser = (userData: any): User => ({
  ...userData,
  id: userData.id || userData._id,
  profile: {
    firstName: '',
    lastName: '',
    bio: '',
    avatar: '',
    ...userData.profile,
  },
  stats: {
    totalPoints: 0,
    weeklyPoints: 0,
    level: 1,
    solvedProblems: 0,
    streak: 0,
    ...userData.stats,
  },
  badges: Array.isArray(userData.badges) ? userData.badges : [],
  certificates: Array.isArray(userData.certificates) ? userData.certificates : [],
  solvedChallenges: Array.isArray(userData.solvedChallenges) ? userData.solvedChallenges : [],
  unlockedChallenges: Array.isArray(userData.unlockedChallenges) ? userData.unlockedChallenges : [],
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await Promise.race([
            authAPI.getCurrentUser(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 8000)
            )
          ]);
          setUser(normalizeUser(userData));
        } catch (error: any) {
          if (error.message === 'timeout' || error.message?.includes('Network')) {
            // Backend sleeping (free tier) — keep token, don't logout
            console.log('Backend waking up, keeping session...');
          } else {
            // Real auth error (401) — clear token
            localStorage.removeItem('token');
            setToken(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      const { token: newToken, user: userData } = response;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(normalizeUser(userData));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authAPI.register(userData);
      const { token: newToken, user: newUser } = response;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(normalizeUser(newUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (profileData: Partial<User['profile']>) => {
    try {
      const updatedUser = await authAPI.updateProfile(profileData);
      setUser(normalizeUser(updatedUser));
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Profile update failed');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};