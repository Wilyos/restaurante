import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Stack,
  Alert,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Slider,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tabs,
  Tab
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  RestoreFromTrash as RestoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  MonetizationOn as MoneyIcon,
  Stars as StarsIcon,
  Nfc as NfcIcon,
  Info as InfoIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import ConfiguracionTimeout from '../components/ConfiguracionTimeout';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConfiguracionNFC() {
  const [tabValue, setTabValue] = useState(0);
  const [config, setConfig] = useState({
    // Configuración de puntos
    puntosPerPeso: 1,
    valorPunto: 1,
    puntosMinimosCanjeables: 100,
    bonificacionBienvenida: 50,
    
    // Configuración de niveles
    niveles: {
      bronce: { minPuntos: 0, multiplicador: 1.0, nombre: 'Bronce', color: '#cd7f32' },
      plata: { minPuntos: 500, multiplicador: 1.1, nombre: 'Plata', color: '#c0c0c0' },
      oro: { minPuntos: 1000, multiplicador: 1.2, nombre: 'Oro', color: '#ffd700' },
      diamante: { minPuntos: 2000, multiplicador: 1.5, nombre: 'Diamante', color: '#b9f2ff' }
    },
    
    // Configuración de tarjetas NFC
    nfcConfig: {
      formatoId: 'NFC############', // # = dígito
      longitudId: 15,
      prefijo: 'NFC',
      validacionEstricta: true,
      tiempoLectura: 1500,
      intentosMaximos: 3,
      rangosFrecuencia: ['13.56 MHz'], // NFC estándar
      protocolos: ['ISO14443A', 'ISO14443B', 'ISO15693']
    },
    
    // Configuración de promociones
    promociones: {
      habilitadas: true,
      puntosDobles: {
        activo: false,
        diasSemana: [6, 0], // Sábado y domingo
        horaInicio: '18:00',
        horaFin: '22:00'
      },
      bonusCumpleanos: {
        activo: true,
        puntosBbonus: 200
      }
    },
    
    // Configuración de seguridad
    seguridad: {
      bloqueoTarjeta: true,
      intentosFallidosMax: 5,
      tiempoBloqueo: 30, // minutos
      validarEmail: true,
      validarTelefono: false,
      logTransacciones: true
    }
  });

  const [dialogNivel, setDialogNivel] = useState(false);
  const [nivelEditando, setNivelEditando] = useState(null);
  const [mensajeGuardado, setMensajeGuardado] = useState('');

  // Cargar configuración al iniciar
  useEffect(() => {
    const configGuardada = localStorage.getItem('restaurante_config_nfc');
    if (configGuardada) {
      try {
        setConfig(JSON.parse(configGuardada));
      } catch (error) {
        console.error('Error cargando configuración:', error);
      }
    }
  }, []);

  const guardarConfiguracion = () => {
    try {
      localStorage.setItem('restaurante_config_nfc', JSON.stringify(config));
      setMensajeGuardado('Configuración guardada exitosamente');
      setTimeout(() => setMensajeGuardado(''), 3000);
    } catch (error) {
      setMensajeGuardado('Error al guardar la configuración');
      setTimeout(() => setMensajeGuardado(''), 3000);
    }
  };

  const restaurarDefecto = () => {
    if (confirm('¿Está seguro de restaurar la configuración por defecto?')) {
      localStorage.removeItem('restaurante_config_nfc');
      window.location.reload();
    }
  };

  const handleConfigChange = (seccion, campo, valor) => {
    setConfig(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: valor
      }
    }));
  };

  const editarNivel = (nivel) => {
    setNivelEditando({ ...config.niveles[nivel], id: nivel });
    setDialogNivel(true);
  };

  const guardarNivel = () => {
    if (nivelEditando) {
      setConfig(prev => ({
        ...prev,
        niveles: {
          ...prev.niveles,
          [nivelEditando.id]: {
            minPuntos: nivelEditando.minPuntos,
            multiplicador: nivelEditando.multiplicador,
            nombre: nivelEditando.nombre,
            color: nivelEditando.color
          }
        }
      }));
      setDialogNivel(false);
      setNivelEditando(null);
    }
  };

  const validarFormatoNFC = (formato) => {
    const regex = /^[A-Z]{2,5}[#]{8,15}$/;
    return regex.test(formato);
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <SettingsIcon sx={{ mr: 2, color: '#1976d2' }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Configuración del Sistema NFC
          </Typography>
        </Box>
        
        {mensajeGuardado && (
          <Alert severity={mensajeGuardado.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
            {mensajeGuardado}
          </Alert>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={guardarConfiguracion}
            color="primary"
          >
            Guardar Configuración
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={restaurarDefecto}
            color="warning"
          >
            Restaurar Defecto
          </Button>
        </Stack>
      </Paper>

      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="Puntos" icon={<MoneyIcon />} />
        <Tab label="Niveles" icon={<StarsIcon />} />
        <Tab label="Tarjetas NFC" icon={<NfcIcon />} />
        <Tab label="Promociones" icon={<SpeedIcon />} />
        <Tab label="Seguridad" icon={<SecurityIcon />} />
        <Tab label="Timeout" icon={<TimeIcon />} />
      </Tabs>

      {/* Tab 0: Configuración de Puntos */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="💰 Sistema de Puntos" />
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    label="Puntos por peso gastado"
                    type="number"
                    value={config.puntosPerPeso}
                    onChange={(e) => setConfig(prev => ({ ...prev, puntosPerPeso: parseFloat(e.target.value) }))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">pts/$</InputAdornment>
                    }}
                    helperText="¿Cuántos puntos gana el cliente por cada peso gastado?"
                  />
                  
                  <TextField
                    label="Valor del punto en pesos"
                    type="number"
                    value={config.valorPunto}
                    onChange={(e) => setConfig(prev => ({ ...prev, valorPunto: parseFloat(e.target.value) }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>
                    }}
                    helperText="¿Cuántos pesos vale cada punto al canjearlo?"
                  />
                  
                  <TextField
                    label="Puntos mínimos para canjear"
                    type="number"
                    value={config.puntosMinimosCanjeables}
                    onChange={(e) => setConfig(prev => ({ ...prev, puntosMinimosCanjeables: parseInt(e.target.value) }))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">pts</InputAdornment>
                    }}
                    helperText="Cantidad mínima de puntos que el cliente debe tener para canjear"
                  />
                  
                  <TextField
                    label="Bonificación de bienvenida"
                    type="number"
                    value={config.bonificacionBienvenida}
                    onChange={(e) => setConfig(prev => ({ ...prev, bonificacionBienvenida: parseInt(e.target.value) }))}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">pts</InputAdornment>
                    }}
                    helperText="Puntos que recibe un cliente al registrarse"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📊 Vista Previa" />
              <CardContent>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Ejemplo de funcionamiento:</Typography>
                </Alert>
                
                <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Cliente gasta $25,000:</strong>
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    → Gana: {(25000 * config.puntosPerPeso).toLocaleString()} puntos
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Cliente canjea {config.puntosMinimosCanjeables} puntos:</strong>
                  </Typography>
                  <Typography variant="body2" color="primary.main">
                    → Descuento: ${(config.puntosMinimosCanjeables * config.valorPunto).toLocaleString()}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Cliente nuevo se registra:</strong>
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    → Recibe: {config.bonificacionBienvenida} puntos gratis
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1: Configuración de Niveles */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardHeader 
            title="⭐ Configuración de Niveles de Cliente"
            subheader="Define los rangos de puntos y beneficios para cada nivel"
          />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nivel</TableCell>
                    <TableCell align="right">Puntos Mínimos</TableCell>
                    <TableCell align="right">Multiplicador</TableCell>
                    <TableCell align="center">Color</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(config.niveles).map(([id, nivel]) => (
                    <TableRow key={id}>
                      <TableCell>
                        <Chip 
                          label={nivel.nombre}
                          sx={{ 
                            bgcolor: nivel.color,
                            color: id === 'oro' ? '#000' : '#fff',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        {nivel.minPuntos.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        {nivel.multiplicador}x
                      </TableCell>
                      <TableCell align="center">
                        <Box 
                          sx={{ 
                            width: 30, 
                            height: 30, 
                            bgcolor: nivel.color,
                            borderRadius: '50%',
                            border: '2px solid #ddd',
                            margin: 'auto'
                          }} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          size="small" 
                          onClick={() => editarNivel(id)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Multiplicador:</strong> Afecta la acumulación de puntos. 
                Por ejemplo, con multiplicador 1.2x, un cliente Oro ganará 20% más puntos.
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2: Configuración de Tarjetas NFC */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="🔖 Formato de Tarjetas" />
              <CardContent>
                <Stack spacing={3}>
                  <TextField
                    label="Prefijo de ID"
                    value={config.nfcConfig.prefijo}
                    onChange={(e) => handleConfigChange('nfcConfig', 'prefijo', e.target.value.toUpperCase())}
                    helperText="Prefijo que tendrán todas las tarjetas (ej: NFC, REST, CARD)"
                    inputProps={{ maxLength: 5 }}
                  />
                  
                  <TextField
                    label="Longitud total del ID"
                    type="number"
                    value={config.nfcConfig.longitudId}
                    onChange={(e) => handleConfigChange('nfcConfig', 'longitudId', parseInt(e.target.value))}
                    helperText="Número total de caracteres del ID completo"
                    inputProps={{ min: 8, max: 20 }}
                  />
                  
                  <TextField
                    label="Tiempo de lectura (ms)"
                    type="number"
                    value={config.nfcConfig.tiempoLectura}
                    onChange={(e) => handleConfigChange('nfcConfig', 'tiempoLectura', parseInt(e.target.value))}
                    helperText="Tiempo que toma leer una tarjeta NFC"
                    inputProps={{ min: 500, max: 5000 }}
                  />
                  
                  <TextField
                    label="Intentos máximos de lectura"
                    type="number"
                    value={config.nfcConfig.intentosMaximos}
                    onChange={(e) => handleConfigChange('nfcConfig', 'intentosMaximos', parseInt(e.target.value))}
                    helperText="Cuántas veces reintenta leer una tarjeta antes de fallar"
                    inputProps={{ min: 1, max: 10 }}
                  />
                  
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.nfcConfig.validacionEstricta}
                        onChange={(e) => handleConfigChange('nfcConfig', 'validacionEstricta', e.target.checked)}
                      />
                    }
                    label="Validación estricta de formato"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="⚙️ Especificaciones Técnicas" />
              <CardContent>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Ejemplo de ID generado:
                    </Typography>
                    <Chip 
                      label={`${config.nfcConfig.prefijo}${'#'.repeat(config.nfcConfig.longitudId - config.nfcConfig.prefijo.length)}`}
                      variant="outlined"
                      sx={{ fontFamily: 'monospace' }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      # = dígito numérico (0-9)
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Protocolos soportados:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {config.nfcConfig.protocolos.map((protocolo) => (
                        <Chip key={protocolo} label={protocolo} size="small" />
                      ))}
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Frecuencia de operación:
                    </Typography>
                    <Chip label="13.56 MHz (Estándar NFC)" color="primary" size="small" />
                  </Box>

                  <Alert severity="warning">
                    <Typography variant="body2">
                      <strong>Nota:</strong> Los cambios en el formato de tarjetas solo afectan 
                      a nuevas tarjetas registradas. Las existentes mantendrán su formato original.
                    </Typography>
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 3: Promociones */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="🎉 Promociones Especiales" />
              <CardContent>
                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.promociones.habilitadas}
                        onChange={(e) => handleConfigChange('promociones', 'habilitadas', e.target.checked)}
                      />
                    }
                    label="Habilitar sistema de promociones"
                  />

                  <Divider />

                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Puntos dobles en horarios especiales
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.promociones.puntosDobles.activo}
                          onChange={(e) => handleConfigChange('promociones', 'puntosDobles', {
                            ...config.promociones.puntosDobles,
                            activo: e.target.checked
                          })}
                          disabled={!config.promociones.habilitadas}
                        />
                      }
                      label="Activar puntos dobles"
                    />

                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <TextField
                        label="Hora inicio"
                        type="time"
                        size="small"
                        value={config.promociones.puntosDobles.horaInicio}
                        onChange={(e) => handleConfigChange('promociones', 'puntosDobles', {
                          ...config.promociones.puntosDobles,
                          horaInicio: e.target.value
                        })}
                        disabled={!config.promociones.puntosDobles.activo}
                      />
                      <TextField
                        label="Hora fin"
                        type="time"
                        size="small"
                        value={config.promociones.puntosDobles.horaFin}
                        onChange={(e) => handleConfigChange('promociones', 'puntosDobles', {
                          ...config.promociones.puntosDobles,
                          horaFin: e.target.value
                        })}
                        disabled={!config.promociones.puntosDobles.activo}
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      Bonus de cumpleaños
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.promociones.bonusCumpleanos.activo}
                          onChange={(e) => handleConfigChange('promociones', 'bonusCumpleanos', {
                            ...config.promociones.bonusCumpleanos,
                            activo: e.target.checked
                          })}
                          disabled={!config.promociones.habilitadas}
                        />
                      }
                      label="Activar bonus de cumpleaños"
                    />

                    <TextField
                      label="Puntos bonus"
                      type="number"
                      size="small"
                      value={config.promociones.bonusCumpleanos.puntosBonu}
                      onChange={(e) => handleConfigChange('promociones', 'bonusCumpleanos', {
                        ...config.promociones.bonusCumpleanos,
                        puntosBonu: parseInt(e.target.value)
                      })}
                      disabled={!config.promociones.bonusCumpleanos.activo}
                      sx={{ mt: 1 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">pts</InputAdornment>
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Alert severity="info">
              <Typography variant="h6" sx={{ mb: 1 }}>
                <InfoIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Promociones Configuradas
              </Typography>
              
              {config.promociones.habilitadas ? (
                <Stack spacing={1}>
                  {config.promociones.puntosDobles.activo && (
                    <Typography variant="body2">
                      • <strong>Puntos dobles:</strong> {config.promociones.puntosDobles.horaInicio} - {config.promociones.puntosDobles.horaFin} (Fines de semana)
                    </Typography>
                  )}
                  {config.promociones.bonusCumpleanos.activo && (
                    <Typography variant="body2">
                      • <strong>Cumpleaños:</strong> {config.promociones.bonusCumpleanos.puntosBonu} puntos bonus
                    </Typography>
                  )}
                  {!config.promociones.puntosDobles.activo && !config.promociones.bonusCumpleanos.activo && (
                    <Typography variant="body2" color="text.secondary">
                      No hay promociones activas
                    </Typography>
                  )}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Sistema de promociones deshabilitado
                </Typography>
              )}
            </Alert>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 4: Seguridad */}
      <TabPanel value={tabValue} index={4}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="🔒 Configuración de Seguridad" />
              <CardContent>
                <Stack spacing={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.seguridad.bloqueoTarjeta}
                        onChange={(e) => handleConfigChange('seguridad', 'bloqueoTarjeta', e.target.checked)}
                      />
                    }
                    label="Bloquear tarjetas por intentos fallidos"
                  />

                  <TextField
                    label="Intentos fallidos máximos"
                    type="number"
                    value={config.seguridad.intentosFallidosMax}
                    onChange={(e) => handleConfigChange('seguridad', 'intentosFallidosMax', parseInt(e.target.value))}
                    disabled={!config.seguridad.bloqueoTarjeta}
                    helperText="Número de intentos antes de bloquear la tarjeta"
                  />

                  <TextField
                    label="Tiempo de bloqueo (minutos)"
                    type="number"
                    value={config.seguridad.tiempoBloqueo}
                    onChange={(e) => handleConfigChange('seguridad', 'tiempoBloqueo', parseInt(e.target.value))}
                    disabled={!config.seguridad.bloqueoTarjeta}
                    helperText="Duración del bloqueo temporal"
                  />

                  <Divider />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.seguridad.validarEmail}
                        onChange={(e) => handleConfigChange('seguridad', 'validarEmail', e.target.checked)}
                      />
                    }
                    label="Validar formato de email"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.seguridad.validarTelefono}
                        onChange={(e) => handleConfigChange('seguridad', 'validarTelefono', e.target.checked)}
                      />
                    }
                    label="Validar formato de teléfono"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={config.seguridad.logTransacciones}
                        onChange={(e) => handleConfigChange('seguridad', 'logTransacciones', e.target.checked)}
                      />
                    }
                    label="Registrar log de transacciones"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📋 Resumen de Seguridad" />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Bloqueo de tarjetas"
                      secondary={config.seguridad.bloqueoTarjeta 
                        ? `Activo - ${config.seguridad.intentosFallidosMax} intentos máx.`
                        : "Desactivado"
                      }
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={config.seguridad.bloqueoTarjeta ? "ON" : "OFF"}
                        color={config.seguridad.bloqueoTarjeta ? "success" : "default"}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Validación de email"
                      secondary="Verifica formato válido de correo electrónico"
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={config.seguridad.validarEmail ? "ON" : "OFF"}
                        color={config.seguridad.validarEmail ? "success" : "default"}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>

                  <ListItem>
                    <ListItemText
                      primary="Log de transacciones"
                      secondary="Registra todas las operaciones del sistema"
                    />
                    <ListItemSecondaryAction>
                      <Chip 
                        label={config.seguridad.logTransacciones ? "ON" : "OFF"}
                        color={config.seguridad.logTransacciones ? "success" : "default"}
                        size="small"
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Importante:</strong> Los cambios de seguridad se aplican inmediatamente 
                    y afectan a todas las operaciones futuras del sistema.
                  </Typography>
                </Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 5: Configuración de Timeout */}
      <TabPanel value={tabValue} index={5}>
        <ConfiguracionTimeout />
      </TabPanel>

      {/* Diálogo para editar niveles */}
      <Dialog open={dialogNivel} onClose={() => setDialogNivel(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Nivel: {nivelEditando?.nombre}</DialogTitle>
        <DialogContent>
          {nivelEditando && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Nombre del nivel"
                value={nivelEditando.nombre}
                onChange={(e) => setNivelEditando(prev => ({ ...prev, nombre: e.target.value }))}
                fullWidth
              />
              
              <TextField
                label="Puntos mínimos"
                type="number"
                value={nivelEditando.minPuntos}
                onChange={(e) => setNivelEditando(prev => ({ ...prev, minPuntos: parseInt(e.target.value) }))}
                fullWidth
              />
              
              <TextField
                label="Multiplicador de puntos"
                type="number"
                step="0.1"
                value={nivelEditando.multiplicador}
                onChange={(e) => setNivelEditando(prev => ({ ...prev, multiplicador: parseFloat(e.target.value) }))}
                fullWidth
                helperText="Ejemplo: 1.2 = 20% más puntos"
              />
              
              <TextField
                label="Color (hex)"
                value={nivelEditando.color}
                onChange={(e) => setNivelEditando(prev => ({ ...prev, color: e.target.value }))}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <Box 
                      sx={{ 
                        width: 20, 
                        height: 20, 
                        bgcolor: nivelEditando.color,
                        borderRadius: '50%',
                        mr: 1,
                        border: '1px solid #ccc'
                      }} 
                    />
                  )
                }}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogNivel(false)}>Cancelar</Button>
          <Button onClick={guardarNivel} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}