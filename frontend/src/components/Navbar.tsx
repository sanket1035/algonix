import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Menu as MenuIcon, Logout, PersonOutline, AdminPanelSettingsOutlined } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { palette, fonts } from '../theme';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Problems', path: '/challenges' },
    { label: 'Skill test', path: '/skill-test' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Contact', path: '/contact' },
  ];
  if (user?.isAdmin) {
    navItems.push({ label: 'Admin', path: '/admin' });
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const initials = `${user?.profile?.firstName?.[0] ?? user?.username?.[0] ?? ''}${user?.profile?.lastName?.[0] ?? ''}`.toUpperCase();

  const go = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    go('/login');
  };

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ bgcolor: palette.sand, borderBottom: `1px solid ${palette.sandDeep}`, color: palette.ink }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, maxWidth: 1280, width: '100%', mx: 'auto', px: { xs: 2, sm: 4 }, gap: { xs: 1.5, md: 5 } }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(true)} aria-label="Open navigation menu">
              <MenuIcon />
            </IconButton>
          )}
          <Logo onClick={() => go('/dashboard')} size={isMobile ? 19 : 22} />

          {!isMobile && (
            <Box component="nav" aria-label="Main" sx={{ display: 'flex', gap: 3.5, alignSelf: 'stretch' }}>
              {navItems.map((item) => (
                <Box
                  key={item.path}
                  component="button"
                  onClick={() => go(item.path)}
                  sx={{
                    all: 'unset',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: 15,
                    fontWeight: isActive(item.path) ? 600 : 400,
                    color: isActive(item.path) ? palette.ink : palette.muted,
                    borderBottom: `2px solid ${isActive(item.path) ? palette.charcoal : 'transparent'}`,
                    '&:hover': { color: palette.ink },
                    '&:focus-visible': { outline: `2px solid ${palette.charcoal}`, outlineOffset: 4 },
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 2 }}>
            {!isMobile && (
              <Typography variant="body2" sx={{ color: palette.muted }}>
                {user?.stats?.streak ?? 0} day streak
              </Typography>
            )}
            <Box sx={{ fontFamily: fonts.mono, fontSize: 13, px: 1.5, py: 0.5, border: `1px solid ${palette.sandDeep}`, borderRadius: 99 }}>
              {user?.stats?.totalPoints ?? 0} pts
            </Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="Account menu" aria-haspopup="true" sx={{ p: 0 }}>
              <Avatar src={user?.profile?.avatar || undefined} sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 600, bgcolor: palette.charcoal, color: palette.page }}>
                {initials}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 210 } } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {[user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ') || user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Level {user?.stats?.level ?? 1} · @{user?.username}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => go('/profile')}>
              <PersonOutline fontSize="small" sx={{ mr: 1.5 }} /> Profile
            </MenuItem>
            {user?.isAdmin && (
              <MenuItem onClick={() => go('/admin')}>
                <AdminPanelSettingsOutlined fontSize="small" sx={{ mr: 1.5 }} /> Admin panel
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout}>
              <Logout fontSize="small" sx={{ mr: 1.5 }} /> Log out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { bgcolor: palette.page, width: 260 } }}>
        <Box sx={{ px: 3, py: 2.5 }}>
          <Logo size={20} />
        </Box>
        <Divider />
        <List sx={{ px: 1 }}>
          {[...navItems, { label: 'Profile', path: '/profile' }].map((item) => (
            <ListItemButton key={item.path} selected={isActive(item.path)} onClick={() => go(item.path)} sx={{ borderRadius: 2 }}>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive(item.path) ? 600 : 400 }} />
            </ListItemButton>
          ))}
          <Divider sx={{ my: 1 }} />
          <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
            <ListItemText primary="Log out" />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
