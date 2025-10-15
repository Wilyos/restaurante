import { useState, useEffect } from 'react';
import {
  Chip,
  Tooltip,
  Box,
  Typography
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

export default function SessionTimer() {
  const { getRemainingTime, isAuthenticated } = useAuth();
  const [remainingTime, setRemainingTime] = useState(0);
  const [sessionStatus, setSessionStatus] = useState('active');

  useEffect(() => {
    if (!isAuthenticated || !getRemainingTime) return;

    const updateTimer = () => {
      const remaining = getRemainingTime();
      if (remaining !== null) {
        setRemainingTime(remaining);
        
        // Determinar estado de la sesión
        if (remaining > 10 * 60 * 1000) { // Más de 10 minutos
          setSessionStatus('active');
        } else if (remaining > 5 * 60 * 1000) { // Entre 5-10 minutos
          setSessionStatus('warning');
        } else if (remaining > 0) { // Menos de 5 minutos
          setSessionStatus('critical');
        } else {
          setSessionStatus('expired');
        }
      }
    };

    // Actualizar inmediatamente
    updateTimer();

    // Actualizar cada segundo
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [getRemainingTime, isAuthenticated]);

  if (!isAuthenticated) return null;

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = () => {
    switch (sessionStatus) {
      case 'active': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      case 'expired': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = () => {
    switch (sessionStatus) {
      case 'active': return <CircleIcon sx={{ fontSize: 8, color: '#4caf50' }} />;
      case 'warning': return <CircleIcon sx={{ fontSize: 8, color: '#ff9800' }} />;
      case 'critical': return <CircleIcon sx={{ fontSize: 8, color: '#f44336' }} />;
      case 'expired': return <CircleIcon sx={{ fontSize: 8, color: '#f44336' }} />;
      default: return <CircleIcon sx={{ fontSize: 8 }} />;
    }
  };

  const getTooltipText = () => {
    switch (sessionStatus) {
      case 'active':
        return 'Sesión activa. Se cerrará automáticamente por inactividad después de 30 minutos.';
      case 'warning':
        return 'Su sesión expirará pronto. Realice alguna actividad para mantenerla activa.';
      case 'critical':
        return '⚠️ Su sesión expirará muy pronto. Haga clic en cualquier parte para renovarla.';
      case 'expired':
        return 'Sesión expirada. Será redirigido al login.';
      default:
        return 'Estado de sesión desconocido.';
    }
  };

  return (
    <Tooltip title={getTooltipText()} arrow>
      <Box>
        <Chip
          icon={<TimeIcon />}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getStatusIcon()}
              <Typography variant="caption" component="span">
                {formatTime(remainingTime)}
              </Typography>
            </Box>
          }
          variant="outlined"
          color={getStatusColor()}
          size="small"
          sx={{
            cursor: 'help',
            '& .MuiChip-icon': {
              fontSize: 16
            }
          }}
        />
      </Box>
    </Tooltip>
  );
}