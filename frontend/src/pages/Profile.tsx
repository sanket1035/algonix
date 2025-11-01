import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  TextField,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Edit,
  EmojiEvents,
  TrendingUp,
  Code,
  Download,
  Star,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useMutation, useQuery } from '@tanstack/react-query';
import { certificatesAPI } from '../services/api';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.profile.firstName || '',
    lastName: user?.profile.lastName || '',
    bio: user?.profile.bio || '',
  });

  const { data: certificates } = useQuery({
    queryKey: ['certificates'],
    queryFn: certificatesAPI.getMyCertificates,
  });

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setEditMode(false);
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleDownloadCertificate = async (certificateId: string, certificateName: string) => {
    try {
      const blob = await certificatesAPI.generateCertificate(certificateId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${certificateName.replace(/\s+/g, '_')}_Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const getNextLevelProgress = () => {
    const levelThresholds = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000, 17000, 25000];
    const currentPoints = user?.stats.totalPoints || 0;
    const currentLevel = user?.stats.level || 1;
    
    if (currentLevel >= levelThresholds.length) return 100;
    
    const currentLevelThreshold = levelThresholds[currentLevel - 1];
    const nextLevelThreshold = levelThresholds[currentLevel];
    const progress = ((currentPoints - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;
    
    return Math.min(progress, 100);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Header */}
        <Grid item xs={12}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Avatar
                src={user?.profile.avatar}
                sx={{ width: 100, height: 100, fontSize: '2rem' }}
              >
                {user?.username[0].toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {user?.profile.firstName} {user?.profile.lastName}
                </Typography>
                <Typography variant="h6" color="textSecondary">
                  @{user?.username}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {user?.profile.bio || 'No bio available'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Chip
                    icon={<EmojiEvents />}
                    label={`Level ${user?.stats.level}`}
                    color="primary"
                  />
                  <Chip
                    icon={<TrendingUp />}
                    label={`${user?.stats.totalPoints} Points`}
                    color="secondary"
                  />
                  <Chip
                    icon={<Code />}
                    label={`${user?.stats.solvedProblems} Solved`}
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Level Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="body2">Level {user?.stats.level}</Typography>
                <LinearProgress
                  variant="determinate"
                  value={getNextLevelProgress()}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2">Level {(user?.stats.level || 1) + 1}</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {Math.round(getNextLevelProgress())}% to next level
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Streak
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {user?.stats.streak}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                days in a row
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weekly Points
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {user?.stats.weeklyPoints}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                this week
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Badges */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Badges ({user?.badges.length || 0})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {user?.badges.map((badge, index) => (
                <Card key={index} sx={{ minWidth: 200 }}>
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {badge.icon}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {badge.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {badge.description}
                    </Typography>
                  </CardContent>
                </Card>
              )) || (
                <Typography variant="body2" color="textSecondary">
                  No badges earned yet. Start solving problems to earn badges!
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Certificates */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Certificates ({certificates?.length || 0})
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {certificates?.map((certificate: any) => (
                <Card key={certificate._id}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {certificate.name}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {certificate.level} Level
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Earned on {new Date(certificate.earnedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Download />}
                        onClick={() => handleDownloadCertificate(certificate._id, certificate.name)}
                      >
                        Download
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              )) || (
                <Typography variant="body2" color="textSecondary">
                  No certificates earned yet. Complete milestone challenges to earn certificates!
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="First Name"
              value={profileData.firstName}
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Last Name"
              value={profileData.lastName}
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              fullWidth
            />
            <TextField
              label="Bio"
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditMode(false)}>Cancel</Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            disabled={updateProfileMutation.isPending}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;