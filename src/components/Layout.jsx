import HomeIcon from '@mui/icons-material/Home';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import KitchenIcon from '@mui/icons-material/Kitchen';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import LoginIcon from '@mui/icons-material/Login';
import SettingsIcon from '@mui/icons-material/Settings';
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

export default function Layout({ title, children }) {
  const { rol } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
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
    ...(rol === 'admin' ? [{ icon: <SettingsIcon fontSize="medium" />, to: '/admin/menu' }] : []),
    { icon: <LoginIcon fontSize="medium" />, to: '/login' },
  ];
  return (
    <Box sx={{ flexGrow: 1 }}>
  <AppBar position="static" sx={{ mb: 4, bgcolor: 'rgba(0,0,0,0.85)', boxShadow: 'none', backdropFilter: 'blur(4px)', borderRadius: 3, mt: 2, mx: 'auto', width: { xs: '98%', sm: '95%', md: '50vw', lg: '50vw' } }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div" sx={{ color: '#fff', fontWeight: 700 }}>
            Restaurante NFC
          </Typography>
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
      <Container maxWidth="sm" sx={{ mt: 4 }}>
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
