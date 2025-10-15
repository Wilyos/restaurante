import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Box,
  Stack,
  Alert,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CloudSync as DatabaseIcon,
  Nfc as NfcIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  NetworkCheck as NetworkIcon,
  Backup as BackupIcon,
  Sync as SyncIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Compare as CompareIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { 
  getClienteByNFC,
  actualizarClienteNFC,
  getClientesNFC
} from '../api/mockClientesNFC';
import { leerDatosDeTarjeta, escribirDatosEnTarjeta } from '../utils/escrituraNFC';

export default function ComparadorAlmacenamiento({ nfcId, clienteDatabase = null }) {
  const [modoSeleccionado, setModoSeleccionado] = useState('database'); // 'database' | 'card' | 'hybrid'
  const [datosDatabase, setDatosDatabase] = useState(null);
  const [datosTarjeta, setDatosTarjeta] = useState(null);
  const [sincronizando, setSincronizando] = useState(false);
  const [dialogoComparacion, setDialogoComparacion] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [nfcId, clienteDatabase]);

  const cargarDatos = async () => {
    setLoading(true);
    
    try {
      // Cargar datos de base de datos
      if (clienteDatabase) {
        setDatosDatabase(clienteDatabase);
      } else if (nfcId) {
        const cliente = await getClienteByNFC(nfcId);
        setDatosDatabase(cliente);
      }

      // Cargar datos de tarjeta NFC
      if (nfcId) {
        try {
          const lectura = await leerDatosDeTarjeta(nfcId);
          setDatosTarjeta(lectura.tarjetaVacia ? null : lectura.datos);
        } catch (error) {
          console.log('Tarjeta sin datos:', error.message);
          setDatosTarjeta(null);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const sincronizarDatos = async (direccion) => {
    if (!nfcId) return;
    
    setSincronizando(true);
    
    try {
      if (direccion === 'db-to-card' && datosDatabase) {
        // Sincronizar de base de datos a tarjeta
        await escribirDatosEnTarjeta(nfcId, {
          clienteId: datosDatabase.id,
          nombre: datosDatabase.nombre,
          puntos: datosDatabase.puntos,
          nivel: datosDatabase.nivel,
          email: datosDatabase.email || '',
          telefono: datosDatabase.telefono || ''
        });
      } else if (direccion === 'card-to-db' && datosTarjeta) {
        // Sincronizar de tarjeta a base de datos
        const clienteActualizado = {
          ...datosDatabase,
          nombre: datosTarjeta.nombre,
          puntos: datosTarjeta.puntos,
          nivel: datosTarjeta.nivel,
          email: datosTarjeta.email,
          telefono: datosTarjeta.telefono
        };
        
        // Actualizar en mock (en producción sería API)
        await actualizarClienteNFC(datosDatabase.id, clienteActualizado);
      }
      
      // Recargar datos
      await cargarDatos();
      
    } catch (error) {
      console.error('Error sincronizando:', error);
    } finally {
      setSincronizando(false);
    }
  };

  const comparaciones = [
    {
      criterio: 'Velocidad de Acceso',
      database: { valor: 'Media', detalle: 'Requiere consulta a servidor/API', icon: <SpeedIcon /> },
      card: { valor: 'Rápida', detalle: 'Lectura directa inmediata', icon: <SpeedIcon color="success" /> },
      ganador: 'card'
    },
    {
      criterio: 'Disponibilidad Offline',
      database: { valor: 'No', detalle: 'Requiere conexión de red', icon: <NetworkIcon color="error" /> },
      card: { valor: 'Sí', detalle: 'Funciona sin conexión', icon: <CheckIcon color="success" /> },
      ganador: 'card'
    },
    {
      criterio: 'Capacidad de Almacenamiento',
      database: { valor: 'Ilimitada', detalle: 'Sin límites prácticos', icon: <StorageIcon color="success" /> },
      card: { valor: 'Limitada', detalle: '~4KB (datos básicos)', icon: <StorageIcon color="warning" /> },
      ganador: 'database'
    },
    {
      criterio: 'Backup y Recuperación',
      database: { valor: 'Excelente', detalle: 'Backups automáticos, recuperación fácil', icon: <BackupIcon color="success" /> },
      card: { valor: 'Limitada', detalle: 'Pérdida si tarjeta se daña', icon: <WarningIcon color="warning" /> },
      ganador: 'database'
    },
    {
      criterio: 'Seguridad Centralizada',
      database: { valor: 'Alta', detalle: 'Control de acceso centralizado', icon: <SecurityIcon color="success" /> },
      card: { valor: 'Básica', detalle: 'Seguridad en la tarjeta física', icon: <SecurityIcon color="warning" /> },
      ganador: 'database'
    },
    {
      criterio: 'Sincronización',
      database: { valor: 'Automática', detalle: 'Datos siempre sincronizados', icon: <SyncIcon color="success" /> },
      card: { valor: 'Manual', detalle: 'Requiere sincronización explícita', icon: <SyncIcon color="warning" /> },
      ganador: 'database'
    },
    {
      criterio: 'Portabilidad',
      database: { valor: 'Baja', detalle: 'Depende del sistema central', icon: <InfoIcon color="warning" /> },
      card: { valor: 'Alta', detalle: 'Cliente lleva sus datos', icon: <CheckIcon color="success" /> },
      ganador: 'card'
    }
  ];

  const detectarDiferencias = () => {
    if (!datosDatabase || !datosTarjeta) return [];
    
    const diferencias = [];
    
    if (datosDatabase.puntos !== datosTarjeta.puntos) {
      diferencias.push({
        campo: 'Puntos',
        database: datosDatabase.puntos,
        tarjeta: datosTarjeta.puntos
      });
    }
    
    if (datosDatabase.nivel !== datosTarjeta.nivel) {
      diferencias.push({
        campo: 'Nivel',
        database: datosDatabase.nivel,
        tarjeta: datosTarjeta.nivel
      });
    }
    
    return diferencias;
  };

  const diferencias = detectarDiferencias();

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CompareIcon sx={{ mr: 2, color: '#1976d2', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Comparador de Almacenamiento: Base de Datos vs Tarjeta NFC
          </Typography>
        </Box>

        {/* Selector de Modo */}
        <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Modo de Operación
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={modoSeleccionado === 'database'}
                    onChange={(e) => setModoSeleccionado(e.target.checked ? 'database' : 'card')}
                  />
                }
                label={modoSeleccionado === 'database' ? 'Base de Datos' : 'Tarjeta NFC'}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => setModoSeleccionado('hybrid')}
                startIcon={<SyncIcon />}
              >
                Modo Híbrido
              </Button>
            </Stack>
            
            <Alert severity="info" sx={{ mt: 2 }}>
              <strong>{modoSeleccionado === 'database' ? 'Modo Base de Datos:' : 
                      modoSeleccionado === 'card' ? 'Modo Tarjeta NFC:' : 'Modo Híbrido:'}</strong>
              {modoSeleccionado === 'database' && ' Los datos se almacenan y consultan únicamente en la base de datos central'}
              {modoSeleccionado === 'card' && ' Los datos se almacenan y consultan únicamente en la tarjeta NFC física'}
              {modoSeleccionado === 'hybrid' && ' Los datos se mantienen sincronizados entre base de datos y tarjeta NFC'}
            </Alert>
          </CardContent>
        </Card>

        {/* Estado Actual de los Datos */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Base de Datos"
                avatar={<DatabaseIcon color="primary" />}
              />
              <CardContent>
                {datosDatabase ? (
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Cliente" 
                        secondary={datosDatabase.nombre}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Puntos" 
                        secondary={`${datosDatabase.puntos} puntos`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Nivel" 
                        secondary={datosDatabase.nivel}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Estado" 
                        secondary={<Chip label="Disponible" color="success" size="small" />}
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay datos en la base de datos
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardHeader 
                title="Tarjeta NFC"
                avatar={<NfcIcon color="secondary" />}
              />
              <CardContent>
                {datosTarjeta ? (
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Cliente" 
                        secondary={datosTarjeta.nombre}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Puntos" 
                        secondary={`${datosTarjeta.puntos} puntos`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Nivel" 
                        secondary={datosTarjeta.nivel}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Estado" 
                        secondary={<Chip label="Con datos" color="success" size="small" />}
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tarjeta vacía o sin datos
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Diferencias Detectadas */}
        {diferencias.length > 0 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              ⚠️ Se detectaron diferencias entre base de datos y tarjeta:
            </Typography>
            {diferencias.map((diff, index) => (
              <Typography key={index} variant="body2">
                • <strong>{diff.campo}:</strong> DB: {diff.database} | Tarjeta: {diff.tarjeta}
              </Typography>
            ))}
            <Box sx={{ mt: 2 }}>
              <Button
                size="small"
                onClick={() => setDialogoComparacion(true)}
                variant="outlined"
                color="warning"
              >
                Ver Detalles y Sincronizar
              </Button>
            </Box>
          </Alert>
        )}

        {/* Acciones de Sincronización */}
        {modoSeleccionado === 'hybrid' && nfcId && (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Sincronización de Datos" />
            <CardContent>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<DatabaseIcon />}
                  onClick={() => sincronizarDatos('db-to-card')}
                  disabled={sincronizando || !datosDatabase}
                >
                  DB → Tarjeta
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<NfcIcon />}
                  onClick={() => sincronizarDatos('card-to-db')}
                  disabled={sincronizando || !datosTarjeta}
                >
                  Tarjeta → DB
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SyncIcon />}
                  onClick={cargarDatos}
                  disabled={loading}
                >
                  Actualizar
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Tabla de Comparación */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Comparación Técnica Detallada</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Criterio</strong></TableCell>
                    <TableCell align="center"><strong>Base de Datos</strong></TableCell>
                    <TableCell align="center"><strong>Tarjeta NFC</strong></TableCell>
                    <TableCell align="center"><strong>Ganador</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparaciones.map((comp, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {comp.database.icon}
                          <Typography sx={{ ml: 1 }}>{comp.criterio}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {comp.database.valor}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {comp.database.detalle}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {comp.card.valor}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {comp.card.detalle}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={comp.ganador === 'database' ? 'Base de Datos' : 'Tarjeta NFC'}
                          color={comp.ganador === 'database' ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Diálogo de Diferencias */}
      <Dialog 
        open={dialogoComparacion} 
        onClose={() => setDialogoComparacion(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Diferencias Detectadas entre Base de Datos y Tarjeta NFC
        </DialogTitle>
        <DialogContent>
          {diferencias.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Campo</TableCell>
                    <TableCell>Base de Datos</TableCell>
                    <TableCell>Tarjeta NFC</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {diferencias.map((diff, index) => (
                    <TableRow key={index}>
                      <TableCell>{diff.campo}</TableCell>
                      <TableCell>{diff.database}</TableCell>
                      <TableCell>{diff.tarjeta}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="small" 
                            onClick={() => sincronizarDatos('db-to-card')}
                            disabled={sincronizando}
                          >
                            Usar DB
                          </Button>
                          <Button 
                            size="small" 
                            onClick={() => sincronizarDatos('card-to-db')}
                            disabled={sincronizando}
                          >
                            Usar Tarjeta
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="success">
              Los datos están sincronizados correctamente
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogoComparacion(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}