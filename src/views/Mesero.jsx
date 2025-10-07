

import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import PersonIcon from '@mui/icons-material/Person';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Layout from '../components/Layout';
import { getMenu } from '../api/mockMenu';
import { crearPedido, getPedidos, cambiarEstadoPedido } from '../api/mockPedidos';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function MenuGrid({ menu, onSelect }) {
  const categorias = [
    { label: 'Entradas', tipo: 'entrada' },
    { label: 'Plato fuerte', tipo: 'comida' },
    { label: 'Bebidas', tipo: 'bebida' },
    { label: 'Postres', tipo: 'postre' }
  ];
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {categorias.map(cat => {
        const items = menu.filter(m => m.tipo === cat.tipo);
        if (items.length === 0) return null;
        return (
          <Box key={cat.tipo} sx={{ mb: 3, width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>{cat.label}</Typography>
            <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
              {items.map(item => (
                <Grid item xs={6} sm={6} md={3} key={item.id} sx={{ display: 'flex', justifyContent: 'center' }}>
                  {(() => {
                    const disponible = item.disponible !== false;
                    return (
                      <Card
                        sx={{
                          cursor: disponible ? 'pointer' : 'not-allowed',
                          width: { xs: 140, sm: 160 },
                          height: { xs: 95, sm: 110 },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'box-shadow 0.2s, opacity 0.2s',
                          boxShadow: 3,
                          opacity: disponible ? 1 : 0.6,
                          '&:hover': { boxShadow: 8 }
                        }}
                        onClick={() => disponible && onSelect(item)}
                      >
                        <CardContent sx={{ textAlign: 'center', p: { xs: 0.5, sm: 1 } }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: { xs: 14, sm: 16 } }}>{item.nombre}</Typography>
                          <Typography variant="caption" sx={{ fontSize: { xs: 12, sm: 14 }, display: 'block' }}>${item.precio?.toLocaleString() || 0}</Typography>
                          <Chip
                            label={disponible ? 'Disponible' : 'No disponible'}
                            color={disponible ? 'success' : 'default'}
                            size="small"
                            sx={{ mt: 0.5, fontSize: { xs: 10, sm: 12 } }}
                          />
                        </CardContent>
                      </Card>
                    );
                  })()}
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
}

export default function Mesero() {
  useEffect(() => {
    document.body.classList.add("bg-mesero");
    return () => document.body.classList.remove("bg-mesero");
  }, []);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [mesasOcupadas, setMesasOcupadas] = useState({});
  const [numComensales, setNumComensales] = useState('');
  const [confirmarComensales, setConfirmarComensales] = useState(false);
  const [menu, setMenu] = useState([]);
  // Hooks para pedido y selección
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [itemsPedido, setItemsPedido] = useState([]);
  const [enviando, setEnviando] = useState(false);

  // Sincronizar mesas ocupadas con pedidos activos (no pagados)
  const [pedidosListos, setPedidosListos] = useState([]);
  useEffect(() => {
    let activo = true;
    const fetchPedidos = () => {
      getPedidos().then(pedidos => {
        if (!activo) return;
        const ocupadas = {};
        pedidos.forEach(p => {
          if (p.mesa && p.estado !== 'pagado') {
            ocupadas[p.mesa] = p.comensales || 1;
          }
        });
        setMesasOcupadas(ocupadas);
        setPedidosListos(pedidos.filter(p => p.estado === 'entregado'));
      });
    };
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 1500);
    return () => { activo = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (confirmarComensales) {
      getMenu().then(setMenu);
    }
  }, [confirmarComensales]);

  // Handlers
  const handleAgregar = () => {
    if (productoSeleccionado && cantidad > 0) {
      setItemsPedido(prev => {
        // Si ya existe el producto, suma la cantidad
        const idx = prev.findIndex(i => i.producto.id === productoSeleccionado.id);
        if (idx >= 0) {
          const nuevo = [...prev];
          nuevo[idx].cantidad += cantidad;
          return nuevo;
        }
        return [...prev, { producto: productoSeleccionado, cantidad }];
      });
      setProductoSeleccionado(null);
      setCantidad(1);
    }
  };

  const handleEnviarPedido = async () => {
    setEnviando(true);
    await crearPedido({
      mesa: mesaSeleccionada,
      comensales: mesasOcupadas[mesaSeleccionada],
      items: itemsPedido
    });
    setEnviando(false);
    setItemsPedido([]);
    setConfirmarComensales(false);
    // La mesa sigue ocupada, no se limpia numComensales ni se libera la mesa
  };

  if (!mesaSeleccionada) {
    const mesas = Array.from({ length: 12 }, (_, i) => i + 1);
    return (
      <Layout title="Mesero">
        <Typography variant="h6" sx={{ mb: 2 }}>Selecciona una mesa</Typography>
        <Grid container spacing={2} sx={{ mt: 2, mb: 2, minHeight: 320, justifyContent: 'center', alignItems: 'center' }}>
          {mesas.map(num => {
            const ocupada = !!mesasOcupadas[num];
            return (
              <Grid item xs={4} sm={3} md={2} key={num}>
                <Card sx={{ width: 100, height: 100, margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: ocupada ? '#ff5252' : 'background.paper', color: ocupada ? 'white' : '#1976d2', border: ocupada ? '2px solid #b71c1c' : '1px solid #e0e0e0', position: 'relative' }}>
                  <CardActionArea onClick={() => setMesaSeleccionada(num)} sx={{ width: '100%', height: '100%', cursor: ocupada ? 'pointer' : 'pointer' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 0 }}>
                      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: ocupada ? 0.5 : 0, color: ocupada ? 'white' : '#1976d2', textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, 0 0 6px #000, 0 2px 12px #fff' }}>{num}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: ocupada ? 0.5 : 1 }}>
                        <PersonIcon fontSize="small" sx={{ mr: 0.5, color: ocupada ? 'white' : '#1976d2' }} />
                        {ocupada && (
                          <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>{mesasOcupadas[num]}</Typography>
                        )}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        {/* Lista de pedidos listos para entregar */}
        {pedidosListos.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: '#4caf50', fontWeight: 'bold' }}>
              🛎️ Órdenes listas para entregar
            </Typography>
            {pedidosListos.filter(p => p.estado === 'entregado').map(p => (
              <Paper 
                key={p.id} 
                elevation={4} 
                sx={{ 
                  mb: 2, 
                  p: 3, 
                  border: '2px solid #4caf50',
                  borderRadius: 2,
                  bgcolor: '#f1f8e9'
                }}
              >
                {/* Header del pedido */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    🍽️ Pedido #{p.id}
                  </Typography>
                  <Chip 
                    label={`Mesa ${p.mesa}`}
                    color="success"
                    sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}
                  />
                </Box>

                {/* Items del pedido */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                  Items a entregar:
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  {/* Comidas */}
                  {p.items && p.items.filter(i => i.producto.tipo !== 'bebida').map((i, idx) => (
                    <Paper 
                      key={idx} 
                      elevation={1} 
                      sx={{ 
                        p: 1.5, 
                        mb: 1, 
                        bgcolor: '#fff',
                        border: '1px solid #c8e6c9'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        🍽️ {i.cantidad}x {i.producto.nombre}
                      </Typography>
                    </Paper>
                  ))}
                  
                  {/* Bebidas */}
                  {p.bebidas && p.bebidas.map((b, idx) => (
                    <Paper 
                      key={'b' + idx} 
                      elevation={1} 
                      sx={{ 
                        p: 1.5, 
                        mb: 1, 
                        bgcolor: '#e3f2fd',
                        border: '1px solid #90caf9'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        🥤 {b.cantidad}x {b.producto.nombre}
                      </Typography>
                    </Paper>
                  ))}
                </Box>

                {/* Botón de entrega */}
                <Button 
                  variant="contained" 
                  color="success" 
                  fullWidth
                  size="large"
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    py: 1.5
                  }}
                  onClick={async () => {
                    await cambiarEstadoPedido(p.id, 'entregado-al-cliente');
                    // Refrescar lista
                    getPedidos().then(pedidos => setPedidosListos(pedidos.filter(p => p.estado === 'entregado')));
                  }}
                >
                  ✅ Marcar como entregado a cliente
                </Button>
              </Paper>
            ))}
          </Box>
        )}
      </Layout>
    );
  }

  // Pantalla para ingresar número de comensales
  if (mesaSeleccionada && !confirmarComensales) {
    // Si la mesa ya está ocupada, mostrar opción de agregar productos sin pedir comensales de nuevo
    if (mesasOcupadas[mesaSeleccionada]) {
      return (
        <Layout title={`Mesa ${mesaSeleccionada} (${mesasOcupadas[mesaSeleccionada]} comensales)`}>
          <Typography variant="body1" sx={{ mb: 2 }}>La mesa ya está ocupada.</Typography>
          <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => setConfirmarComensales(true)}>
            Agregar productos
          </Button>
          <Button sx={{ width: '100%' }} onClick={() => setMesaSeleccionada(null)}>Volver a mesas</Button>
        </Layout>
      );
    }
    // Si la mesa no está ocupada, pedir número de comensales
    return (
      <Layout title={`Mesa ${mesaSeleccionada}`}>
        <Paper elevation={3} sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
          <Typography variant="h6" gutterBottom>¿Cuántos comensales hay en la mesa?</Typography>
          <TextField
            label="Número de comensales"
            type="number"
            value={numComensales}
            onChange={e => setNumComensales(e.target.value.replace(/[^0-9]/g, ''))}
            inputProps={{ min: 1 }}
            sx={{ mb: 2, width: '100%' }}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!numComensales || Number(numComensales) < 1}
            onClick={() => {
              setConfirmarComensales(true);
              setMesasOcupadas(prev => ({ ...prev, [mesaSeleccionada]: Number(numComensales) }));
            }}
            sx={{ width: '100%' }}
          >
            Continuar a tomar pedido
          </Button>
          <Button sx={{ mt: 1, width: '100%' }} onClick={() => { setMesaSeleccionada(null); setNumComensales(''); }}>Volver a mesas</Button>
        </Paper>
      </Layout>
    );
  }

  if (mesaSeleccionada && confirmarComensales) {
    return (
      <Layout title={`Mesa ${mesaSeleccionada} (${mesasOcupadas[mesaSeleccionada] || ''} comensales)`}>
        <Typography variant="h6" sx={{ mb: 2 }}>Selecciona productos para el pedido</Typography>
        <MenuGrid menu={menu} onSelect={setProductoSeleccionado} />

        {/* Diálogo para seleccionar cantidad */}
        <Dialog open={!!productoSeleccionado} onClose={() => setProductoSeleccionado(null)}>
          <DialogTitle>Agregar al pedido</DialogTitle>
          <DialogContent>
            <Typography>{productoSeleccionado?.nombre}</Typography>
            <TextField
              label="Cantidad"
              type="number"
              value={cantidad}
              onChange={e => setCantidad(Math.max(1, Number(e.target.value.replace(/[^0-9]/g, ''))))}
              inputProps={{ min: 1 }}
              sx={{ mt: 2, width: '100%' }}
              autoFocus
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProductoSeleccionado(null)}>Cancelar</Button>
            <Button variant="contained" onClick={handleAgregar} disabled={cantidad < 1}>Agregar</Button>
          </DialogActions>
        </Dialog>

        {/* Lista de ítems agregados */}
        <Paper elevation={3} sx={{ mt: 3, p: 2, bgcolor: '#f8f9fa', border: '2px solid #28a745' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#28a745', fontWeight: 'bold', textAlign: 'center' }}>
            🛒 Pedido actual
          </Typography>
          {itemsPedido.length === 0 ? (
            <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: '#fff', border: '1px dashed #ccc' }}>
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                📝 No hay productos agregados
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Selecciona productos del menú para agregar al pedido
              </Typography>
            </Paper>
          ) : (
            <>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {itemsPedido.map((item, idx) => (
                  <Paper 
                    key={item.producto.id} 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      bgcolor: '#fff',
                      border: '1px solid #e9ecef'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                          {item.producto.tipo === 'bebida' ? '🥤' : '🍽️'} {item.cantidad}x {item.producto.nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${item.producto.precio?.toLocaleString() || 0} c/u
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#28a745' }}>
                        ${(item.cantidad * (item.producto.precio || 0)).toLocaleString()}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
              
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  bgcolor: '#28a745', 
                  color: 'white',
                  border: '2px solid #1e7e34'
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    💰 TOTAL:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    ${itemsPedido.reduce((acc, it) => acc + (it.cantidad * (it.producto.precio || 0)), 0).toLocaleString()}
                  </Typography>
                </Box>
              </Paper>
            </>
          )}
        </Paper>

        <Button
          variant="contained"
          color={itemsPedido.length === 0 ? 'inherit' : 'success'}
          sx={{ mt: 2, mr: 2, bgcolor: itemsPedido.length === 0 ? '#333' : 'success.main', color: '#000', '&.Mui-disabled': { bgcolor: '#333', color: '#888' } }}
          disabled={itemsPedido.length === 0 || enviando}
          onClick={handleEnviarPedido}
        >
          {enviando ? 'Enviando...' : 'Enviar pedido a cocina'}
        </Button>
        <Button sx={{ mt: 2, color: '#90caf9' }} onClick={() => { setConfirmarComensales(false); setNumComensales(mesasOcupadas[mesaSeleccionada] || ''); }}>Volver a selección de comensales</Button>
      </Layout>
    );
  }
}