import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Alert,
  Collapse,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Star as StarIcon,
  Nfc as NfcIcon
} from '@mui/icons-material';
import { obtenerInfoConfiguracion } from '../utils/configuracionNFC';

export default function InfoConfiguracion({ mostrarCompleta = false }) {
  const [expanded, setExpanded] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const infoConfig = obtenerInfoConfiguracion();
    setConfig(infoConfig);
  }, []);

  if (!config) {
    return null;
  }

  const ConfigCard = ({ title, icon, children, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, color: `${color}.main` }}>
            {title}
          </Typography>
        </Box>
        {children}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Resumen rápido */}
      <Alert 
        severity="info" 
        sx={{ mb: 2, cursor: mostrarCompleta ? 'default' : 'pointer' }}
        onClick={() => !mostrarCompleta && setExpanded(!expanded)}
        action={
          !mostrarCompleta && (
            <IconButton
              aria-label="expandir"
              color="inherit"
              size="small"
              onClick={() => setExpanded(!expanded)}
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s'
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          )
        }
      >
        <Typography variant="body2">
          <strong>Configuración actual:</strong> {config.puntosPerPeso} pts/$1 • 
          Canje desde {config.puntosMinimos} pts • 
          Formato: {config.formatoNFC} • 
          {config.promocionesActivas ? '🎉 Promociones ON' : '⚪ Sin promociones'}
          {!mostrarCompleta && ' • Click para ver detalles'}
        </Typography>
      </Alert>

      {/* Información detallada */}
      <Collapse in={expanded || mostrarCompleta} timeout="auto" unmountOnExit>
        <Grid container spacing={2}>
          {/* Configuración de Puntos */}
          <Grid item xs={12} sm={6} md={3}>
            <ConfigCard
              title="Puntos"
              icon={<StarIcon color="primary" />}
              color="primary"
            >
              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Por peso gastado"
                    secondary={`${config.puntosPerPeso} punto${config.puntosPerPeso !== 1 ? 's' : ''}`}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Valor punto"
                    secondary={`$${config.valorPunto}`}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Mínimo canje"
                    secondary={`${config.puntosMinimos} pts`}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Bono nuevo"
                    secondary={`${config.bonusNuevos} pts`}
                  />
                </ListItem>
              </List>
            </ConfigCard>
          </Grid>

          {/* Configuración NFC */}
          <Grid item xs={12} sm={6} md={3}>
            <ConfigCard
              title="NFC"
              icon={<NfcIcon color="secondary" />}
              color="secondary"
            >
              <List dense>
                <ListItem disablePadding>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Formato tarjeta"
                    secondary={config.formatoNFC}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary="Tiempo lectura"
                    secondary={`${config.tiempoLectura}ms`}
                  />
                </ListItem>
                <ListItem disablePadding>
                  <ListItemIcon>
                    {config.seguridadActiva ? 
                      <CheckIcon fontSize="small" color="success" /> : 
                      <WarningIcon fontSize="small" color="warning" />
                    }
                  </ListItemIcon>
                  <ListItemText
                    primary="Seguridad"
                    secondary={config.seguridadActiva ? 'Activa' : 'Básica'}
                  />
                </ListItem>
              </List>
            </ConfigCard>
          </Grid>

          {/* Estado Promociones */}
          <Grid item xs={12} sm={6} md={3}>
            <ConfigCard
              title="Promociones"
              icon={<SpeedIcon color={config.promocionesActivas ? 'success' : 'disabled'} />}
              color={config.promocionesActivas ? 'success' : 'grey'}
            >
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Chip
                  label={config.promocionesActivas ? 'HABILITADAS' : 'DESHABILITADAS'}
                  color={config.promocionesActivas ? 'success' : 'default'}
                  variant={config.promocionesActivas ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {config.promocionesActivas 
                    ? 'Sistema de promociones activo'
                    : 'Sin promociones especiales'
                  }
                </Typography>
              </Box>
            </ConfigCard>
          </Grid>

          {/* Estado Seguridad */}
          <Grid item xs={12} sm={6} md={3}>
            <ConfigCard
              title="Seguridad"
              icon={<SecurityIcon color={config.seguridadActiva ? 'error' : 'disabled'} />}
              color={config.seguridadActiva ? 'error' : 'grey'}
            >
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Chip
                  label={config.seguridadActiva ? 'PROTEGIDO' : 'BÁSICO'}
                  color={config.seguridadActiva ? 'error' : 'default'}
                  variant={config.seguridadActiva ? 'filled' : 'outlined'}
                  sx={{ mb: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {config.seguridadActiva 
                    ? 'Bloqueo automático activo'
                    : 'Protección básica'
                  }
                </Typography>
              </Box>
            </ConfigCard>
          </Grid>
        </Grid>

        {mostrarCompleta && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              ✅ <strong>Sistema configurado correctamente.</strong> 
              Todas las configuraciones están cargadas y funcionando. 
              Los cambios se aplican automáticamente al guardar.
            </Typography>
          </Alert>
        )}
      </Collapse>
    </Box>
  );
}