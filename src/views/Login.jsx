import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const roles = [
  { label: 'Mesero', value: 'mesero', path: '/mesero' },
  { label: 'Cocina', value: 'cocina', path: '/cocina' },
  { label: 'Barra', value: 'barra', path: '/barra' },
  { label: 'Caja', value: 'caja', path: '/caja' },
  { label: 'Admin', value: 'admin', path: '/admin/menu' },
];

export default function Login() {
  const { login, loading, error, setRol } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showLegacyLogin, setShowLegacyLogin] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      return;
    }

    try {
      const user = await login(formData.username, formData.password);
      
      // Navegar según el rol del usuario
      const roleRoute = {
        'mesero': '/mesero',
        'cocina': '/cocina',
        'barra': '/barra',
        'caja': '/caja',
        'admin': '/admin/menu'
      };

      navigate(roleRoute[user.role] || '/');
    } catch (err) {
      // El error ya se maneja en el contexto
      console.error('Error de login:', err);
    }
  };

  const handleLegacySelect = (rol, path) => {
    setRol(rol);
    navigate(path);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 2,
      bgcolor: '#f5f5f5'
    }}>
      <Paper sx={{ 
        p: { xs: 3, md: 4 }, 
        maxWidth: 400, 
        width: '100%',
        textAlign: 'center' 
      }}>
        <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
          Restaurante NFC
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'text.secondary' }}>
          Iniciar Sesión
        </Typography>

        {!showLegacyLogin ? (
          // Formulario de login principal
          <>
            <form onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField
                  name="username"
                  label="Usuario"
                  value={formData.username}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  autoComplete="username"
                  size={isMobile ? "medium" : "small"}
                />
                
                <TextField
                  name="password"
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  autoComplete="current-password"
                  size={isMobile ? "medium" : "small"}
                />

                {error && (
                  <Alert severity="error" sx={{ textAlign: 'left' }}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !formData.username.trim() || !formData.password.trim()}
                  sx={{ 
                    py: 1.5,
                    position: 'relative'
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Stack>
            </form>

            {/* Usuarios de ejemplo */}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 'bold' }}>
                👥 Usuarios de ejemplo:
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem' }}>
                admin/admin123 • mesero1/mesero123 • cocina1/cocina123
                <br />
                barra1/barra123 • caja1/caja123
              </Typography>
            </Box>
          </>
        ) : (
          // Sistema legacy para acceso rápido
          <>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Selecciona tu cargo para acceso directo
            </Typography>
            
            <Stack spacing={2}>
              {roles.map(r => (
                <Button 
                  key={r.value} 
                  variant="outlined" 
                  onClick={() => handleLegacySelect(r.value, r.path)}
                  size={isMobile ? "medium" : "small"}
                >
                  {r.label}
                </Button>
              ))}
            </Stack>

            <Button
              variant="text"
              size="small"
              onClick={() => setShowLegacyLogin(false)}
              sx={{ mt: 2, textDecoration: 'underline' }}
            >
              ← Volver al login
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
