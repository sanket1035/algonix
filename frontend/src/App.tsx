import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { AppThemeProvider } from './theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import SkillTestSimple from './pages/SkillTestSimple';
import Contact from './pages/Contact';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}><CircularProgress /></Box>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}><CircularProgress /></Box>;
  return user?.isAdmin ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {user && <Navbar />}
        <Box component="main" sx={{ flexGrow: 1, minWidth: 0, pt: user ? { xs: 7, sm: 8 } : 0, pb: { xs: 2, sm: 4 } }}>
          <Routes>
            <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/challenges" element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
            <Route path="/challenges/:id" element={<ProtectedRoute><ChallengeDetail /></ProtectedRoute>} />
            <Route path="/skill-test" element={<ProtectedRoute><SkillTestSimple /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </AppThemeProvider>
    </QueryClientProvider>
  );
};

export default App;