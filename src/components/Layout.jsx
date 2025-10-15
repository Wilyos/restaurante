import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import KitchenIcon from '@mui/icons-material/Kitchen';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LoginIcon from '@mui/icons-material/Login';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import TuneIcon from '@mui/icons-material/Tune';
import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { Link, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SessionTimer from './SessionTimer';
import ConnectivityStatus from './ConnectivityStatus';

export default function Layout({ title, children }) {
  const { rol, user } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Verificar si estamos en una página de admin
  const isAdminPage = location.pathname.startsWith('/admin/');
  
  const activeStyle = {
    bgcolor: '#43a047',
    color: 'white',
    fontWeight: 700,
    pointerEvents: 'none',
    boxShadow: 2
  };
  
  const navLinks = [
    { icon: <HomeIcon fontSize="medium" />, to: '/' },
    ...(rol === 'mesero' || rol === 'admin' ? [{ icon: <RestaurantMenuIcon fontSize="medium" />, to: '/mesero' }] : []),
    ...(rol === 'barra' || rol === 'admin' ? [{ icon: <LocalBarIcon fontSize="medium" />, to: '/barra' }] : []),
    ...(rol === 'cocina' || rol === 'admin' ? [{ icon: <KitchenIcon fontSize="medium" />, to: '/cocina' }] : []),
    ...(rol === 'caja' || rol === 'admin' ? [{ icon: <PointOfSaleIcon fontSize="medium" />, to: '/caja' }] : []),
    ...(rol === 'caja' || rol === 'admin' ? [{ icon: <LoyaltyIcon fontSize="medium" />, to: '/admin/puntos' }] : []),
    ...(rol === 'admin' ? [{ icon: <SettingsIcon fontSize="medium" />, to: '/admin/menu' }] : []),
    { icon: <LoginIcon fontSize="medium" />, to: '/login' },
  ];

  // Tabs de administración
  const adminTabs = [
    { label: 'Menú', value: '/admin/menu', icon: <SettingsIcon /> },
    { label: 'Usuarios', value: '/admin/users', icon: <PeopleIcon /> },
    { label: 'Puntos NFC', value: '/admin/puntos', icon: <LoyaltyIcon /> },
    { label: 'Config. NFC', value: '/admin/config-nfc', icon: <TuneIcon /> }
  ];
  return (
    <Box sx={{ flexGrow: 1 }}>
  <AppBar position="static" sx={{ mb: 4, bgcolor: 'rgba(0,0,0,0.85)', boxShadow: 'none', backdropFilter: 'blur(4px)', borderRadius: 3, mt: 2, mx: 'auto', width: { xs: '98%', sm: '95%', md: '50vw', lg: '50vw' } }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography variant="h6" component="div" sx={{ color: '#fff', fontWeight: 700 }}>
                Restaurante NFC
              </Typography>
              {user && (
                <Typography variant="caption" sx={{ color: '#a0a0a0', fontSize: '0.75rem' }}>
                  Bienvenido, {user.name}
                </Typography>
              )}
            </Box>
            {user && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ConnectivityStatus />
                <SessionTimer />
              </Box>
            )}
          </Box>
          {isMobile ? (
            <>
              <IconButton edge="end" color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
                PaperProps={{ sx: { bgcolor: '#000' } }}>
                <Box sx={{ width: 60, bgcolor: '#fafafa', height: '100%' }} role="presentation" onClick={() => setDrawerOpen(false)}>
                  <List>
                    {navLinks.map(link => (
                      <ListItem key={link.to} disablePadding>
                        <ListItemButton component={Link} to={link.to} selected={location.pathname === link.to} sx={location.pathname === link.to ? { ...activeStyle, color: '#43a047' } : { color: '#000' }}>
                          {link.icon}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <Box>
              {navLinks.map(link => (
                <Button
                  key={link.to}
                  component={Link}
                  to={link.to}
                  sx={location.pathname === link.to ? { ...activeStyle, mr: 2 } : { color: '#fff', mr: 2 }}
                >
                  {link.icon}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Tabs de administración */}
      {isAdminPage && rol === 'admin' && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Container maxWidth="lg">
            <Tabs 
              value={location.pathname} 
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{ minHeight: 48 }}
            >
              {adminTabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  icon={tab.icon}
                  iconPosition={isMobile ? "top" : "start"}
                  component={Link}
                  to={tab.value}
                  sx={{ 
                    minHeight: 48,
                    fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    '&.Mui-selected': {
                      color: '#43a047',
                      fontWeight: 'bold'
                    }
                  }}
                />
              ))}
            </Tabs>
          </Container>
        </Box>
      )}

      <Container maxWidth={isAdminPage ? "lg" : "sm"} sx={{ mt: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          align="center"
          sx={
            title === 'Inicio'
              ? {}
              : {
                  color: '#111',
                  fontWeight: 700,
                  textShadow:
                    '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 0 2px 8px #fff',
                }
          }
        >
          {title}
        </Typography>
        {children}
      </Container>
    </Box>
  );
}
