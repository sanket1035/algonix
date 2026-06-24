import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Badge,
  Chip,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  AccountCircle,
  Leaderboard,
  Code,
  Dashboard,
  AdminPanelSettings,
  Logout,
  EmojiEvents,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    setDrawerOpen(false);
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <Dashboard /> },
    { label: 'Challenges', path: '/challenges', icon: <Code /> },
    { label: 'Leaderboard', path: '/leaderboard', icon: <Leaderboard /> },
    { label: 'Contact', path: '/contact', icon: <AccountCircle /> },
  ];

  if (user?.isAdmin) {
    navItems.push({ label: 'Admin Panel', path: '/admin', icon: <AdminPanelSettings /> });
  }

  const handleNavClick = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 260, pt: 1 }} role="presentation">
      <Box sx={{ px: 2, py: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ALGONIX
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Chip
            icon={<EmojiEvents />}
            label={`Lv ${user?.stats?.level ?? 1}`}
            color="secondary"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`${user?.stats?.totalPoints ?? 0} pts`}
            color="secondary"
            size="small"
          />
        </Box>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavClick(item.path)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider sx={{ my: 1 }} />
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleNavClick('/profile')}>
            <ListItemIcon sx={{ minWidth: 40 }}><AccountCircle /></ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 40 }}><Logout /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1, sm: 2 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              aria-label="open navigation menu"
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: isMobile ? 1 : 0,
              mr: isMobile ? 0 : 4,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            onClick={() => navigate('/dashboard')}
          >
            ALGONIX
          </Typography>

          {!isMobile && (
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{ textTransform: 'none' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
            {!isMobile && (
              <>
                <Chip
                  icon={<EmojiEvents />}
                  label={`Level ${user?.stats?.level ?? 1}`}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
                <Badge badgeContent={user?.stats?.totalPoints ?? 0} color="secondary" max={9999}>
                  <Typography variant="body2" sx={{ color: 'white', mr: 1 }}>
                    Points
                  </Typography>
                </Badge>
              </>
            )}

            {isMobile && (
              <Chip
                label={`${user?.stats?.totalPoints ?? 0}`}
                color="secondary"
                size="small"
                sx={{ mr: 0.5, fontSize: '0.75rem' }}
              />
            )}

            <IconButton
              size={isMobile ? 'medium' : 'large'}
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {user?.profile?.avatar ? (
                <Avatar src={user?.profile?.avatar} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircle />
              )}
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                <AccountCircle sx={{ mr: 1 }} />
                Profile
              </MenuItem>
              {user?.isAdmin && (
                <MenuItem onClick={() => { navigate('/admin'); handleClose(); }}>
                  <AdminPanelSettings sx={{ mr: 1 }} />
                  Admin Panel
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;
