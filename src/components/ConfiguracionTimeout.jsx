import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Info as InfoIcon
} from '@mui/icons-material';

const TIMEOUT_PRESETS = [
  { label: '5 minutos', value: 5 * 60 * 1000, description: 'Muy seguro - Para terminales públicas' },
  { label: '15 minutos', value: 15 * 60 * 1000, description: 'Seguro - Para uso compartido' },
  { label: '30 minutos', value: 30 * 60 * 1000, description: 'Equilibrado - Recomendado' },
  { label: '1 hora', value: 60 * 60 * 1000, description: 'Cómodo - Para uso personal' },
  { label: '2 horas', value: 2 * 60 * 60 * 1000, description: 'Extendido - Para jornadas largas' },
  { label: 'Sin timeout', value: 0, description: '⚠️ No recomendado - Solo para desarrollo' }
];

const WARNING_PRESETS = [
  { label: '30 segundos', value: 30 * 1000 },
  { label: '1 minuto', value: 60 * 1000 },
  { label: '2 minutos', value: 2 * 60 * 1000 },
  { label: '5 minutos', value: 5 * 60 * 1000 },
  { label: '10 minutos', value: 10 * 60 * 1000 }
];

export default function ConfiguracionTimeout() {
  const [config, setConfig] = useState({
    sessionTimeout: 30 * 60 * 1000, // 30 minutos por defecto
    warningTime: 5 * 60 * 1000, // 5 minutos de advertencia
    enabled: true,
    customTimeout: false,
    customTimeoutValue: 30,
    customTimeoutUnit: 'minutes'
  });

  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar configuración guardada
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('timeout.config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error cargando configuración de timeout:', error);
    }
  }, []);

  const saveConfiguration = async () => {
    setLoading(true);
    try {
      const configToSave = {
        ...config,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem('timeout.config', JSON.stringify(configToSave));
      
      setMensaje({
        tipo: 'success',
        texto: 'Configuración guardada correctamente. Los cambios se aplicarán en la próxima sesión.'
      });

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setMensaje(null), 3000);
      
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: 'Error al guardar la configuración: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    setConfig({
      sessionTimeout: 30 * 60 * 1000,
      warningTime: 5 * 60 * 1000,
      enabled: true,
      customTimeout: false,
      customTimeoutValue: 30,
      customTimeoutUnit: 'minutes'
    });
    
    setMensaje({
      tipo: 'info',
      texto: 'Configuración restablecida a valores por defecto'
    });
  };

  const handlePresetSelect = (preset) => {
    setConfig(prev => ({
      ...prev,
      sessionTimeout: preset.value,
      customTimeout: false
    }));
  };

  const handleCustomTimeoutChange = () => {
    const { customTimeoutValue, customTimeoutUnit } = config;
    let timeoutMs = 0;
    
    switch (customTimeoutUnit) {
      case 'seconds':
        timeoutMs = customTimeoutValue * 1000;
        break;
      case 'minutes':
        timeoutMs = customTimeoutValue * 60 * 1000;
        break;
      case 'hours':
        timeoutMs = customTimeoutValue * 60 * 60 * 1000;
        break;
    }
    
    setConfig(prev => ({
      ...prev,
      sessionTimeout: timeoutMs
    }));
  };

  useEffect(() => {
    if (config.customTimeout) {
      handleCustomTimeoutChange();
    }
  }, [config.customTimeoutValue, config.customTimeoutUnit, config.customTimeout]);

  const formatTime = (ms) => {
    if (ms === 0) return 'Sin timeout';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      const remainingMins = minutes % 60;
      return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
    } else if (minutes > 0) {
      const remainingSecs = seconds % 60;
      return remainingSecs > 0 ? `${minutes}m ${remainingSecs}s` : `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  };

  const getCurrentPreset = () => {
    return TIMEOUT_PRESETS.find(preset => preset.value === config.sessionTimeout);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SecurityIcon sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Configuración de Timeout de Sesión
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Seguridad por Inactividad:</strong> Configure el tiempo máximo de inactividad 
          antes de cerrar automáticamente la sesión para proteger el sistema.
        </Typography>
      </Alert>

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mb: 3 }}>
          {mensaje.texto}
        </Alert>
      )}

      <Stack spacing={4}>
        {/* Estado General */}
        <Card>
          <CardHeader 
            title="Estado del Sistema"
            avatar={<TimeIcon />}
          />
          <CardContent>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label={
                <Box>
                  <Typography variant="body1">
                    Timeout de Sesión Habilitado
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {config.enabled ? 
                      'Las sesiones se cerrarán automáticamente por inactividad' :
                      '⚠️ Las sesiones no tendrán límite de tiempo (no recomendado)'
                    }
                  </Typography>
                </Box>
              }
            />
          </CardContent>
        </Card>

        {/* Configuración de Tiempo */}
        {config.enabled && (
          <Card>
            <CardHeader 
              title="Configuración de Tiempo"
              subheader="Seleccione el tiempo de inactividad permitido"
            />
            <CardContent>
              <Stack spacing={3}>
                {/* Presets Rápidos */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Configuraciones Predefinidas:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {TIMEOUT_PRESETS.map((preset) => (
                      <Chip
                        key={preset.value}
                        label={preset.label}
                        onClick={() => handlePresetSelect(preset)}
                        color={config.sessionTimeout === preset.value ? 'primary' : 'default'}
                        variant={config.sessionTimeout === preset.value ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                  {getCurrentPreset() && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {getCurrentPreset().description}
                    </Typography>
                  )}
                </Box>

                <Divider />

                {/* Configuración Personalizada */}
                <Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.customTimeout}
                        onChange={(e) => setConfig(prev => ({ ...prev, customTimeout: e.target.checked }))}
                      />
                    }
                    label="Configuración Personalizada"
                  />

                  {config.customTimeout && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        label="Tiempo"
                        type="number"
                        value={config.customTimeoutValue}
                        onChange={(e) => setConfig(prev => ({ 
                          ...prev, 
                          customTimeoutValue: Math.max(1, parseInt(e.target.value) || 1)
                        }))}
                        inputProps={{ min: 1 }}
                        sx={{ width: 120 }}
                      />
                      <FormControl sx={{ width: 140 }}>
                        <InputLabel>Unidad</InputLabel>
                        <Select
                          value={config.customTimeoutUnit}
                          onChange={(e) => setConfig(prev => ({ ...prev, customTimeoutUnit: e.target.value }))}
                          label="Unidad"
                        >
                          <MenuItem value="seconds">Segundos</MenuItem>
                          <MenuItem value="minutes">Minutos</MenuItem>
                          <MenuItem value="hours">Horas</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </Box>

                {/* Configuración de Advertencia */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Tiempo de Advertencia:
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 1 }}>
                    <InputLabel>Advertir antes de cerrar sesión</InputLabel>
                    <Select
                      value={config.warningTime}
                      onChange={(e) => setConfig(prev => ({ ...prev, warningTime: e.target.value }))}
                      label="Advertir antes de cerrar sesión"
                    >
                      {WARNING_PRESETS.map((preset) => (
                        <MenuItem key={preset.value} value={preset.value}>
                          {preset.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary">
                    Se mostrará una advertencia {formatTime(config.warningTime)} antes de cerrar la sesión
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Resumen de Configuración */}
        <Card>
          <CardHeader 
            title="Resumen de Configuración"
            avatar={<InfoIcon />}
          />
          <CardContent>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color={config.enabled ? 'success' : 'disabled'} />
                </ListItemIcon>
                <ListItemText
                  primary="Timeout de Sesión"
                  secondary={config.enabled ? 
                    `Habilitado - ${formatTime(config.sessionTimeout)}` : 
                    'Deshabilitado'
                  }
                />
              </ListItem>
              {config.enabled && (
                <ListItem>
                  <ListItemIcon>
                    <WarningIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Advertencia Previa"
                    secondary={`Se mostrará ${formatTime(config.warningTime)} antes`}
                  />
                </ListItem>
              )}
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Nivel de Seguridad"
                  secondary={
                    config.sessionTimeout === 0 ? 'Sin protección' :
                    config.sessionTimeout <= 5 * 60 * 1000 ? 'Muy alto' :
                    config.sessionTimeout <= 15 * 60 * 1000 ? 'Alto' :
                    config.sessionTimeout <= 30 * 60 * 1000 ? 'Medio' : 'Bajo'
                  }
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={resetToDefaults}
            disabled={loading}
          >
            Restablecer
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveConfiguration}
            disabled={loading}
          >
            Guardar Configuración
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}