import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Fab,
  Tooltip
} from '@mui/material';
import {
  Loyalty as LoyaltyIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  AccountBalance as AccountBalanceIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Star as StarIcon,
  Stars as StarsIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  Diamond as DiamondIcon
} from '@mui/icons-material';
import Layout from '../components/Layout';
import LectorNFC from '../components/LectorNFC';
import InfoConfiguracion from '../components/InfoConfiguracion';
import GestionTarjetasNFC from '../components/GestionTarjetasNFC';
import ComparadorAlmacenamiento from '../components/ComparadorAlmacenamiento';
import {
  getClientesNFC,
  getEstadisticas,
  getTodasLasTransacciones,
  registrarClienteNFC,
  acumularPuntos,
  canjearPuntos,
  getConfiguracionPuntos
} from '../api/mockClientesNFC';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function SistemaPuntos() {
  useEffect(() => {
    document.body.classList.add("bg-admin");
    return () => document.body.classList.remove("bg-admin");
  }, []);

  const [tabValue, setTabValue] = useState(0);
  const [clientes, setClientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [transacciones, setTransacciones] = useState([]);
  const [configuracion, setConfiguracion] = useState({});
  const [loading, setLoading] = useState(true);
  const [nfcDetectado, setNfcDetectado] = useState(null);

  // Diálogos
  const [dialogRegistro, setDialogRegistro] = useState(false);
  const [dialogPuntos, setDialogPuntos] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);

  // Formularios
  const [formRegistro, setFormRegistro] = useState({
    nfcId: '',
    nombre: '',
    email: '',
    telefono: ''
  });

  const [formPuntos, setFormPuntos] = useState({
    accion: 'acumular', // 'acumular' o 'canjear'
    cantidad: '',
    concepto: ''
  });

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [clientesData, statsData, transaccionesData, configData] = await Promise.all([
        getClientesNFC(),
        getEstadisticas(),
        getTodasLasTransacciones(30),
        getConfiguracionPuntos()
      ]);
      
      setClientes(clientesData);
      setEstadisticas(statsData);
      setTransacciones(transaccionesData);
      setConfiguracion(configData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleClienteDetectado = (cliente, nfcId = null) => {
    setClienteSeleccionado(cliente);
    if (nfcId) {
      setNfcDetectado(nfcId);
    }
    setDialogPuntos(true);
    setFormPuntos({ accion: 'acumular', cantidad: '', concepto: '' });
  };

  const handleErrorNFC = (error) => {
    if (error.tipo === 'no_registrado') {
      setNfcDetectado(error.nfcId);
      setFormRegistro(prev => ({ ...prev, nfcId: error.nfcId }));
      setDialogRegistro(true);
    }
  };

  const registrarNuevoCliente = async () => {
    try {
      await registrarClienteNFC(formRegistro);
      setDialogRegistro(false);
      setFormRegistro({ nfcId: '', nombre: '', email: '', telefono: '' });
      cargarDatos();
      alert('Cliente registrado exitosamente');
    } catch (error) {
      alert(error.message);
    }
  };

  const procesarPuntos = async () => {
    try {
      if (formPuntos.accion === 'acumular') {
        await acumularPuntos(
          clienteSeleccionado.nfcId, 
          parseInt(formPuntos.cantidad), 
          formPuntos.concepto
        );
      } else {
        await canjearPuntos(
          clienteSeleccionado.nfcId, 
          parseInt(formPuntos.cantidad)
        );
      }
      
      setDialogPuntos(false);
      setClienteSeleccionado(null);
      setFormPuntos({ accion: 'acumular', cantidad: '', concepto: '' });
      cargarDatos();
      alert(`Puntos ${formPuntos.accion === 'acumular' ? 'acumulados' : 'canjeados'} exitosamente`);
    } catch (error) {
      alert(error.message);
    }
  };

  const getNivelIcon = (nivel) => {
    switch (nivel) {
      case 'Diamante': return <DiamondIcon sx={{ color: '#e1f5fe' }} />;
      case 'Oro': return <WorkspacePremiumIcon sx={{ color: '#ffd700' }} />;
      case 'Plata': return <StarsIcon sx={{ color: '#c0c0c0' }} />;
      default: return <StarIcon sx={{ color: '#cd7f32' }} />;
    }
  };

  const getNivelColor = (nivel) => {
    switch (nivel) {
      case 'Diamante': return '#e1f5fe';
      case 'Oro': return '#fff8e1';
      case 'Plata': return '#fafafa';
      default: return '#efebe9';
    }
  };

  if (loading) {
    return (
      <Layout title="Sistema de Puntos NFC">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Cargando sistema de puntos...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Sistema de Puntos NFC">
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', color: '#1976d2', fontWeight: 'bold' }}>
        🎯 Sistema de Puntos con NFC
      </Typography>

      {/* Información de configuración */}
      <InfoConfiguracion />

      <Tabs 
        value={tabValue} 
        onChange={(e, newValue) => setTabValue(newValue)} 
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="Lector NFC" icon={<LoyaltyIcon />} />
        <Tab label="Estadísticas" icon={<TrendingUpIcon />} />
        <Tab label="Clientes" icon={<GroupIcon />} />
        <Tab label="Transacciones" icon={<HistoryIcon />} />
        <Tab label="Tarjetas NFC" icon={<PersonAddIcon />} />
        <Tab label="Comparador" icon={<AccountBalanceIcon />} />
      </Tabs>

      {/* Tab 0: Lector NFC */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <LectorNFC 
              onClienteDetectado={handleClienteDetectado}
              onError={handleErrorNFC}
            />
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LoyaltyIcon sx={{ mr: 1 }} />
                Configuración del Sistema
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Puntos por peso gastado:</Typography>
                  <Chip label={`${configuracion.puntosPerPeso} punto(s)`} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Valor del punto:</Typography>
                  <Chip label={`$${configuracion.valorPunto}`} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Mínimo para canjear:</Typography>
                  <Chip label={`${configuracion.puntosMinimosCanjeables} puntos`} />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Bonificación bienvenida:</Typography>
                  <Chip label={`${configuracion.bonificacionBienvenida} puntos`} />
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                Instrucciones de uso:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1. Presione "Leer Tarjeta" en el lector NFC<br/>
                2. Acerque la tarjeta del cliente al lector<br/>
                3. Si es un cliente nuevo, complete el registro<br/>
                4. Si es un cliente existente, gestione sus puntos
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1: Estadísticas */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <GroupIcon sx={{ mr: 2, color: '#1976d2', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                      {estadisticas.totalClientes}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Clientes activos
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ bgcolor: '#e8f5e8', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LoyaltyIcon sx={{ mr: 2, color: '#388e3c', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                      {estadisticas.puntosEnCirculacion?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Puntos en circulación
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalanceIcon sx={{ mr: 2, color: '#f57c00', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                      {estadisticas.puntosAcumuladosTotal?.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total acumulado
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <Card sx={{ bgcolor: '#fce4ec', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ mr: 2, color: '#c2185b', fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" sx={{ color: '#c2185b', fontWeight: 'bold' }}>
                      {estadisticas.transaccionesHoy}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transacciones hoy
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Distribución por niveles */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Distribución de clientes por nivel
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(estadisticas.clientesPorNivel || {}).map(([nivel, cantidad]) => (
                    <Grid item xs={6} sm={3} key={nivel}>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          textAlign: 'center',
                          bgcolor: getNivelColor(nivel),
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ mb: 1 }}>
                          {getNivelIcon(nivel)}
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {cantidad}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {nivel}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 2: Clientes */}
      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setDialogRegistro(true)}
          >
            Registrar Cliente
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>NFC ID</TableCell>
                <TableCell align="right">Puntos</TableCell>
                <TableCell align="center">Nivel</TableCell>
                <TableCell>Última visita</TableCell>
                <TableCell align="center">Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {cliente.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cliente.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {cliente.nfcId}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {cliente.puntos.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={getNivelIcon(cliente.nivel)}
                      label={cliente.nivel}
                      size="small"
                      sx={{ 
                        bgcolor: getNivelColor(cliente.nivel),
                        border: '1px solid #ddd'
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {new Date(cliente.ultimaVisita).toLocaleDateString('es-ES')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={cliente.activo ? 'Activo' : 'Inactivo'}
                      color={cliente.activo ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab 3: Transacciones */}
      <TabPanel value={tabValue} index={3}>
        <List>
          {transacciones.map((transaccion) => {
            const cliente = clientes.find(c => c.id === transaccion.clienteId);
            return (
              <ListItem key={transaccion.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: transaccion.tipo === 'acumulacion' ? '#4caf50' : 
                             transaccion.tipo === 'canje' ? '#ff9800' : '#2196f3'
                  }}>
                    {transaccion.tipo === 'acumulacion' ? '+' : 
                     transaccion.tipo === 'canje' ? '-' : '★'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {cliente?.nombre || 'Cliente no encontrado'}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold',
                          color: transaccion.puntos > 0 ? '#4caf50' : '#ff9800'
                        }}
                      >
                        {transaccion.puntos > 0 ? '+' : ''}{transaccion.puntos} pts
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {transaccion.descripcion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(transaccion.fecha).toLocaleString('es-ES')}
                        {transaccion.montoCompra && ` • Compra: $${transaccion.montoCompra.toLocaleString()}`}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </TabPanel>

      {/* Tab 4: Gestión de Tarjetas NFC */}
      <TabPanel value={tabValue} index={4}>
        <GestionTarjetasNFC 
          nfcId={nfcDetectado}
          onOperacionCompleta={(operacion, resultado) => {
            console.log(`Operación ${operacion} completada:`, resultado);
            // Aquí podrías actualizar el estado de la aplicación si es necesario
            cargarDatos();
          }}
        />
      </TabPanel>

      {/* Tab 5: Comparador de Almacenamiento */}
      <TabPanel value={tabValue} index={5}>
        <ComparadorAlmacenamiento 
          nfcId={nfcDetectado}
          clienteDatabase={clienteSeleccionado}
        />
      </TabPanel>

      {/* FAB para acceso rápido al lector */}
      {tabValue !== 0 && (
        <Tooltip title="Ir al Lector NFC">
          <Fab
            color="primary"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => setTabValue(0)}
          >
            <LoyaltyIcon />
          </Fab>
        </Tooltip>
      )}

      {/* Diálogo de registro de cliente */}
      <Dialog open={dialogRegistro} onClose={() => setDialogRegistro(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="NFC ID"
              value={formRegistro.nfcId}
              onChange={(e) => setFormRegistro(prev => ({ ...prev, nfcId: e.target.value }))}
              fullWidth
              disabled
              helperText="Detectado automáticamente por el lector NFC"
            />
            <TextField
              label="Nombre completo"
              value={formRegistro.nombre}
              onChange={(e) => setFormRegistro(prev => ({ ...prev, nombre: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formRegistro.email}
              onChange={(e) => setFormRegistro(prev => ({ ...prev, email: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Teléfono"
              value={formRegistro.telefono}
              onChange={(e) => setFormRegistro(prev => ({ ...prev, telefono: e.target.value }))}
              fullWidth
            />
            <Alert severity="info">
              El cliente recibirá {configuracion.bonificacionBienvenida} puntos de bienvenida
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogRegistro(false)}>Cancelar</Button>
          <Button 
            onClick={registrarNuevoCliente} 
            variant="contained"
            disabled={!formRegistro.nombre || !formRegistro.email}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de gestión de puntos */}
      <Dialog open={dialogPuntos} onClose={() => setDialogPuntos(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Gestionar Puntos - {clienteSeleccionado?.nombre}
        </DialogTitle>
        <DialogContent>
          {clienteSeleccionado && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Alert severity="info">
                Puntos actuales: <strong>{clienteSeleccionado.puntos}</strong> puntos
              </Alert>
              
              <Tabs 
                value={formPuntos.accion} 
                onChange={(e, newValue) => setFormPuntos(prev => ({ ...prev, accion: newValue }))}
              >
                <Tab label="Acumular" value="acumular" />
                <Tab label="Canjear" value="canjear" />
              </Tabs>

              {formPuntos.accion === 'acumular' ? (
                <>
                  <TextField
                    label="Monto de compra"
                    type="number"
                    value={formPuntos.cantidad}
                    onChange={(e) => setFormPuntos(prev => ({ ...prev, cantidad: e.target.value }))}
                    fullWidth
                    helperText={`Ganará ${Math.floor((formPuntos.cantidad || 0) * configuracion.puntosPerPeso)} puntos`}
                  />
                  <TextField
                    label="Concepto (opcional)"
                    value={formPuntos.concepto}
                    onChange={(e) => setFormPuntos(prev => ({ ...prev, concepto: e.target.value }))}
                    fullWidth
                    placeholder="Ej: Pedido #123, Compra especial..."
                  />
                </>
              ) : (
                <>
                  <TextField
                    label="Puntos a canjear"
                    type="number"
                    value={formPuntos.cantidad}
                    onChange={(e) => setFormPuntos(prev => ({ ...prev, cantidad: e.target.value }))}
                    fullWidth
                    helperText={`Descuento: $${((formPuntos.cantidad || 0) * configuracion.valorPunto).toLocaleString()}`}
                    inputProps={{ 
                      min: configuracion.puntosMinimosCanjeables, 
                      max: clienteSeleccionado.puntos 
                    }}
                  />
                  <Alert severity="warning">
                    Mínimo {configuracion.puntosMinimosCanjeables} puntos para canjear
                  </Alert>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogPuntos(false)}>Cancelar</Button>
          <Button 
            onClick={procesarPuntos} 
            variant="contained"
            disabled={!formPuntos.cantidad || formPuntos.cantidad <= 0}
          >
            {formPuntos.accion === 'acumular' ? 'Acumular' : 'Canjear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}