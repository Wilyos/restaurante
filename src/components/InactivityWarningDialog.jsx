import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Stack,
  Chip
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  Logout as LogoutIcon,
  TouchApp as TouchIcon
} from '@mui/icons-material';

export default function InactivityWarningDialog({ 
  open, 
  onExtend, 
  onLogout, 
  remainingTime = 0,
  warningTime = 5 * 60 * 1000 // 5 minutos
}) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (open && remainingTime > 0) {
      setCountdown(Math.ceil(remainingTime / 1000));
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onLogout && onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [open, remainingTime, onLogout]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressValue = () => {
    if (!remainingTime || !warningTime) return 0;
    return ((warningTime - remainingTime) / warningTime) * 100;
  };

  const getUrgencyColor = () => {
    if (countdown > 120) return 'warning'; // Más de 2 minutos
    if (countdown > 60) return 'error'; // Más de 1 minuto
    return 'error'; // Menos de 1 minuto
  };

  return (
    <Dialog 
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: { 
          borderRadius: 2,
          border: countdown <= 60 ? '2px solid #f44336' : '2px solid #ff9800'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color={getUrgencyColor()} />
          <Typography variant="h6">
            Sesión por Expirar
          </Typography>
          <Chip 
            icon={<TimeIcon />}
            label={formatTime(countdown)}
            color={getUrgencyColor()}
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <Alert severity={getUrgencyColor()} variant="outlined">
            <Typography variant="body1">
              <strong>Su sesión expirará por inactividad</strong>
            </Typography>
            <Typography variant="body2">
              Por seguridad, se cerrará automáticamente si no hay actividad.
            </Typography>
          </Alert>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Tiempo restante:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {formatTime(countdown)}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={getProgressValue()} 
              color={getUrgencyColor()}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box sx={{ 
            bgcolor: 'background.paper', 
            p: 2, 
            borderRadius: 1, 
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <TouchIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
              Para mantener su sesión activa:
            </Typography>
            <Typography variant="body2">
              • Haga clic en "Continuar Sesión"<br/>
              • Mueva el mouse o toque la pantalla<br/>
              • Use cualquier función del sistema
            </Typography>
          </Box>

          {countdown <= 30 && (
            <Alert severity="error" variant="filled">
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                ⚠️ ¡CERRANDO SESIÓN EN {countdown} SEGUNDOS!
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
        >
          Cerrar Sesión
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<TouchIcon />}
          onClick={onExtend}
          sx={{ minWidth: 150 }}
        >
          Continuar Sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
}