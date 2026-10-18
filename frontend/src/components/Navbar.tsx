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
  Chip,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  PersonOutline,
  LeaderboardOutlined,
  CodeRounded,
  SpaceDashboardOutlined,
  AdminPanelSettingsOutlined,
  Logout,
  MailOutline,
  Menu as MenuIcon,
  DarkModeOutlined,
  LightModeOutlined,
  BoltRounded,
  LocalFireDepartmentRounded,
  SpeedRounded,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useColorMode } from '../theme';
import Logo from './Logo';

export const SIDEBAR_WIDTH = 248;

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/challenges': 'Challenges',
  '/skill-test': 'Skill Test',
  '/leaderboard': 'Leaderboard',
  '/profile': 'Profile',
  '/admin': 'Admin Panel',
  '/contact': 'Contact',
};

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useColorMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
    setDrawerOpen(false);
    navigate('/login');
  };

  const mainItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <SpaceDashboardOutlined /> },
    { label: 'Challenges', path: '/challenges', icon: <CodeRounded /> },
    { label: 'Skill Test', path: '/skill-test', icon: <SpeedRounded /> },
    { label: 'Leaderboard', path: '/leaderboard', icon: <LeaderboardOutlined /> },
  ];
  const accountItems = [
    { label: 'Profile', path: '/profile', icon: <PersonOutline /> },
    { label: 'Contact', path: '/contact', icon: <MailOutline /> },
  ];
  if (user?.isAdmin) {
    accountItems.push({ label: 'Admin Panel', path: '/admin', icon: <AdminPanelSettingsOutlined /> });
  }

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const title = Object.entries(pageTitles).find(([p]) => isActive(p))?.[1] ?? 'Algonix';

  const handleNavClick = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const levelThresholds = [0, 150, 550, 900];
  const level = user?.stats?.level ?? 1;
  const points = user?.stats?.totalPoints ?? 0;
  const lo = levelThresholds[level - 1] ?? 0;
  const hi = levelThresholds[level];
  const levelProgress = hi ? Math.min(Math.max(((points - lo) / (hi - lo)) * 100, 0), 100) : 100;
  const initials = (user?.profile?.firstName?.[0] || user?.username?.[0] || '?').toUpperCase();

  const navSection = (label: string, items: typeof mainItems) => (
    <>
      <Typography sx={{ px: 2.5, pt: 2, pb: 0.75, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'text.secondary', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <List disablePadding sx={{ px: 1.5 }}>
        {items.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={active}
              onClick={() => handleNavClick(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.25,
                py: 0.9,
                color: active ? 'primary.main' : 'text.secondary',
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14) },
                '&:hover': { color: 'text.primary' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit', '& svg': { fontSize: 20 } }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 600 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>
    </>
  );

  const sidebar = (
    <Box sx={{ width: SIDEBAR_WIDTH, height: '100%', display: 'flex', flexDirection: 'column' }} role="navigation">
      <Box sx={{ px: 2.5, height: 64, display: 'flex', alignItems: 'center' }}>
        <Logo size={30} onClick={() => handleNavClick('/dashboard')} />
      </Box>
      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {navSection('Practice', mainItems)}
        {navSection('Account', accountItems)}
      </Box>
      <Box sx={{ p: 2 }}>
        <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: alpha(theme.palette.primary.main, 0.07), border: 1, borderColor: alpha(theme.palette.primary.main, 0.15) }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>Level {level}</Typography>
            <Typography variant="caption" color="text.secondary">{points} pts</Typography>
          </Box>
          <LinearProgress variant="determinate" value={levelProgress} sx={{ height: 6 }} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {hi ? `${Math.max(hi - points, 0)} pts to Level ${level + 1}` : 'Max level reached'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { md: `${SIDEBAR_WIDTH}px` },
          bgcolor: alpha(theme.palette.background.default, 0.8),
          backdropFilter: 'blur(12px)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 3 }, gap: 1 }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setDrawerOpen(true)} aria-label="open navigation menu">
              <MenuIcon />
            </IconButton>
          )}
          {isMobile ? (
            <Box sx={{ flexGrow: 1 }}><Logo size={26} onClick={() => navigate('/dashboard')} /></Box>
          ) : (
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>{title}</Typography>
          )}

          <Chip
            icon={<BoltRounded />}
            label={isMobile ? points : `${points} pts`}
            size="small"
            sx={{ bgcolor: alpha(theme.palette.warning.main, 0.12), color: 'warning.main', '& .MuiChip-icon': { color: 'inherit' } }}
          />
          {!isMobile && (
            <Chip
              icon={<LocalFireDepartmentRounded />}
              label={`${user?.stats?.streak ?? 0} day streak`}
              size="small"
              sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', '& .MuiChip-icon': { color: 'inherit' } }}
            />
          )}
          <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
            <IconButton onClick={toggleColorMode} aria-label="toggle color mode">
              {mode === 'dark' ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
            </IconButton>
          </Tooltip>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} aria-label="account of current user" aria-haspopup="true" sx={{ p: 0.5 }}>
            <Avatar src={user?.profile?.avatar || undefined} sx={{ width: 32, height: 32, fontSize: '0.9rem', fontWeight: 700, bgcolor: 'primary.main' }}>
              {initials}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            slotProps={{ paper: { sx: { mt: 1, minWidth: 200 } } }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{user?.profile?.firstName || user?.username}</Typography>
              <Typography variant="caption" color="text.secondary">@{user?.username}</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
              <PersonOutline fontSize="small" sx={{ mr: 1.5 }} /> Profile
            </MenuItem>
            {user?.isAdmin && (
              <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                <AdminPanelSettingsOutlined fontSize="small" sx={{ mr: 1.5 }} /> Admin Panel
              </MenuItem>
            )}
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Logout fontSize="small" sx={{ mr: 1.5 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: SIDEBAR_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} ModalProps={{ keepMounted: true }}>
            {sidebar}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            PaperProps={{ sx: { borderRight: 1, borderColor: 'divider', bgcolor: 'background.paper' } }}
          >
            {sidebar}
          </Drawer>
        )}
      </Box>
    </>
  );
};

export default Navbar;
