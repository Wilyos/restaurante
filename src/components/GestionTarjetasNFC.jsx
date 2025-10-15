import { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  TextField
} from '@mui/material';
import {
  Nfc as NfcIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Memory as MemoryIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import {
  escribirDatosEnTarjeta,
  leerDatosDeTarjeta,
  inicializarTarjetaNFC,
  actualizarPuntosEnTarjeta,
  verificarEstadoTarjeta,
  borrarTarjetaNFC,
  obtenerInfoTecnicaTarjeta
} from '../utils/escrituraNFC';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`nfc-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function GestionTarjetasNFC({ nfcId, onOperacionCompleta, disabled = false }) {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [datosLectura, setDatosLectura] = useState(null);
  const [infoTecnica, setInfoTecnica] = useState(null);
  
  // Formulario para escritura manual
  const [datosEscritura, setDatosEscritura] = useState({
    nombre: '',
    puntos: 0,
    nivel: 'Bronce',
    email: '',
    telefono: ''
  });

  const leerTarjeta = async () => {
    if (!nfcId) {
      setError('No hay tarjeta NFC detectada');
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const [lectura, info, estado] = await Promise.all([
        leerDatosDeTarjeta(nfcId),
        obtenerInfoTecnicaTarjeta(nfcId),
        verificarEstadoTarjeta(nfcId)
      ]);

      setDatosLectura({ ...lectura, estado });
      setInfoTecnica(info);
      
      if (lectura.tarjetaVacia) {
        setResultado({
          tipo: 'info',
          mensaje: 'Tarjeta NFC vacía - Lista para programar'
        });
      } else {
        setResultado({
          tipo: 'success',
          mensaje: `Tarjeta leída correctamente - Cliente: ${lectura.datos.nombre}`
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const escribirTarjeta = async () => {
    if (!nfcId) {
      setError('No hay tarjeta NFC detectada');
      return;
    }

    if (!datosEscritura.nombre.trim()) {
      setError('El nombre del cliente es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const datos = {
        clienteId: Math.floor(Math.random() * 10000),
        nombre: datosEscritura.nombre.trim(),
        puntos: parseInt(datosEscritura.puntos) || 0,
        nivel: datosEscritura.nivel,
        email: datosEscritura.email.trim(),
        telefono: datosEscritura.telefono.trim()
      };

      const resultado = await escribirDatosEnTarjeta(nfcId, datos);
      
      setResultado({
        tipo: 'success',
        mensaje: `Datos escritos correctamente en la tarjeta`,
        detalles: `${resultado.tamanoDatos} bytes usados, ${resultado.espacioRestante} bytes libres`
      });

      // Actualizar lectura
      await leerTarjeta();
      onOperacionCompleta && onOperacionCompleta('escritura', resultado);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const actualizarPuntos = async () => {
    if (!datosLectura || datosLectura.tarjetaVacia) {
      setError('No hay datos en la tarjeta para actualizar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nuevosPuntos = parseInt(datosEscritura.puntos) || 0;
      const resultado = await actualizarPuntosEnTarjeta(nfcId, nuevosPuntos, datosEscritura.nivel);
      
      setResultado({
        tipo: 'success',
        mensaje: `Puntos actualizados: ${resultado.puntosAnteriores} → ${resultado.puntosNuevos}`
      });

      // Actualizar lectura
      await leerTarjeta();
      onOperacionCompleta && onOperacionCompleta('actualizacion', resultado);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const borrarTarjeta = async () => {
    if (!confirm('¿Está seguro de borrar completamente la tarjeta NFC?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const resultado = await borrarTarjetaNFC(nfcId);
      
      setResultado({
        tipo: 'warning',
        mensaje: 'Tarjeta NFC borrada completamente'
      });

      setDatosLectura(null);
      setInfoTecnica(null);
      onOperacionCompleta && onOperacionCompleta('borrado', resultado);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'activa': return 'success';
      case 'poco_uso': return 'warning';
      case 'inactiva': return 'error';
      case 'vacia': return 'info';
      default: return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'activa': return <CheckIcon />;
      case 'poco_uso': return <WarningIcon />;
      case 'inactiva': return <ErrorIcon />;
      case 'vacia': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <NfcIcon sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Gestión de Almacenamiento en Tarjeta NFC
        </Typography>
      </Box>

      {!nfcId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Primero debe detectar una tarjeta NFC para gestionar su almacenamiento
        </Alert>
      )}

      {nfcId && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Tarjeta detectada:</strong> {nfcId}
          </Typography>
          <Typography variant="caption">
            Esta interfaz permite leer y escribir datos directamente en la tarjeta NFC física
          </Typography>
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {resultado && (
        <Alert severity={resultado.tipo} sx={{ mb: 2 }}>
          <Typography variant="body2">{resultado.mensaje}</Typography>
          {resultado.detalles && (
            <Typography variant="caption" display="block">
              {resultado.detalles}
            </Typography>
          )}
        </Alert>
      )}

      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Leer Datos" icon={<RefreshIcon />} disabled={!nfcId} />
        <Tab label="Escribir Datos" icon={<SaveIcon />} disabled={!nfcId} />
        <Tab label="Info Técnica" icon={<MemoryIcon />} disabled={!nfcId} />
      </Tabs>

      {/* Tab 0: Leer Datos */}
      <TabPanel value={tabValue} index={0}>
        <Stack spacing={3}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={leerTarjeta}
            disabled={!nfcId || loading}
            size="large"
          >
            Leer Datos de la Tarjeta
          </Button>

          {datosLectura && (
            <Grid container spacing={2}>
              {datosLectura.tarjetaVacia ? (
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <InfoIcon sx={{ fontSize: 64, color: 'info.main', mb: 2 }} />
                      <Typography variant="h6">Tarjeta NFC Vacía</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Esta tarjeta no contiene datos de cliente.
                        Está lista para ser programada por primera vez.
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader 
                        title="Datos del Cliente"
                        avatar={
                          <Chip
                            icon={getEstadoIcon(datosLectura.estado?.estado)}
                            label={datosLectura.estado?.estado || 'Desconocido'}
                            color={getEstadoColor(datosLectura.estado?.estado)}
                          />
                        }
                      />
                      <CardContent>
                        <List dense>
                          <ListItem>
                            <ListItemText
                              primary="Nombre"
                              secondary={datosLectura.datos.nombre}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Puntos Actuales"
                              secondary={`${datosLectura.datos.puntos} puntos`}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText
                              primary="Nivel"
                              secondary={datosLectura.datos.nivel}
                            />
                          </ListItem>
                          {datosLectura.datos.email && (
                            <ListItem>
                              <ListItemText
                                primary="Email"
                                secondary={datosLectura.datos.email}
                              />
                            </ListItem>
                          )}
                          {datosLectura.datos.telefono && (
                            <ListItem>
                              <ListItemText
                                primary="Teléfono"
                                secondary={datosLectura.datos.telefono}
                              />
                            </ListItem>
                          )}
                          <ListItem>
                            <ListItemText
                              primary="Última Actualización"
                              secondary={new Date(datosLectura.datos.fechaUltimaActualizacion).toLocaleString('es-ES')}
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardHeader title="Estado de la Tarjeta" />
                      <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Chip
                            icon={getEstadoIcon(datosLectura.estado?.estado)}
                            label={datosLectura.estado?.mensaje}
                            color={getEstadoColor(datosLectura.estado?.estado)}
                            sx={{ mb: 2 }}
                          />
                        </Box>
                        
                        {datosLectura.estado?.datos && (
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="Días sin uso"
                                secondary={`${datosLectura.estado.datos.diasSinUso} días`}
                              />
                            </ListItem>
                          </List>
                        )}

                        <Box sx={{ mt: 2 }}>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={borrarTarjeta}
                            fullWidth
                          >
                            Borrar Tarjeta
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </Stack>
      </TabPanel>

      {/* Tab 1: Escribir Datos */}
      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3}>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>⚠️ Importante:</strong> Escribir datos sobrescribirá completamente 
              la información existente en la tarjeta NFC.
            </Typography>
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre del Cliente"
                value={datosEscritura.nombre}
                onChange={(e) => setDatosEscritura(prev => ({ ...prev, nombre: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={datosEscritura.email}
                onChange={(e) => setDatosEscritura(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Puntos Iniciales"
                type="number"
                value={datosEscritura.puntos}
                onChange={(e) => setDatosEscritura(prev => ({ ...prev, puntos: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={datosEscritura.telefono}
                onChange={(e) => setDatosEscritura(prev => ({ ...prev, telefono: e.target.value }))}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={escribirTarjeta}
              disabled={!nfcId || loading || !datosEscritura.nombre.trim()}
              size="large"
            >
              Escribir en Tarjeta
            </Button>

            {datosLectura && !datosLectura.tarjetaVacia && (
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={actualizarPuntos}
                disabled={!nfcId || loading}
                size="large"
              >
                Solo Actualizar Puntos
              </Button>
            )}
          </Stack>
        </Stack>
      </TabPanel>

      {/* Tab 2: Info Técnica */}
      <TabPanel value={tabValue} index={2}>
        <Stack spacing={3}>
          <Button
            variant="outlined"
            startIcon={<MemoryIcon />}
            onClick={leerTarjeta}
            disabled={!nfcId || loading}
          >
            Actualizar Información
          </Button>

          {infoTecnica && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Memoria de la Tarjeta" />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Espacio Total"
                          secondary={`${infoTecnica.espacioTotal} bytes (4 KB)`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Espacio Usado"
                          secondary={`${infoTecnica.espacioUsado} bytes`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Espacio Libre"
                          secondary={`${infoTecnica.espacioLibre} bytes`}
                        />
                      </ListItem>
                    </List>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" display="block" gutterBottom>
                        Uso de memoria: {infoTecnica.porcentajeUso}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={infoTecnica.porcentajeUso}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardHeader title="Información Técnica" />
                  <CardContent>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="ID de Tarjeta"
                          secondary={infoTecnica.nfcId}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Contiene Datos"
                          secondary={infoTecnica.tieneCreditos ? 'Sí' : 'No'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Versión de Datos"
                          secondary={infoTecnica.version || 'N/A'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Checksum"
                          secondary={infoTecnica.checksum || 'N/A'}
                        />
                      </ListItem>
                      {infoTecnica.ultimaEscritura && (
                        <ListItem>
                          <ListItemText
                            primary="Última Escritura"
                            secondary={new Date(infoTecnica.ultimaEscritura).toLocaleString('es-ES')}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          <Alert severity="info">
            <Typography variant="body2">
              <strong>ℹ️ Información técnica:</strong> Las tarjetas NFC típicamente tienen 
              4KB-8KB de memoria disponible. Los datos se almacenan con checksum para 
              verificar integridad y detectar corrupción.
            </Typography>
          </Alert>
        </Stack>
      </TabPanel>
    </Paper>
  );
}