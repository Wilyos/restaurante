
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Layout from '../components/Layout';
import { getPedidos, cambiarEstadoPedido, marcarItemPreparado } from '../api/mockPedidos';

const estados = {
  pendiente: 'en preparación',
  'en preparación': 'preparado',
};

export default function Cocina() {
  useEffect(() => {
    document.body.classList.add("bg-cocina");
    return () => document.body.classList.remove("bg-cocina");
  }, []);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);

  const cargarPedidos = async () => {
    setLoading(true);
    const data = await getPedidos();
    setPedidos(data);
    setLoading(false);
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const avanzarEstado = async (id, estadoActual) => {
    const nuevoEstado = estados[estadoActual];
    if (!nuevoEstado) return;
    await cambiarEstadoPedido(id, nuevoEstado);
    cargarPedidos();
  };

  return (
    <Layout title="Cocina">
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          Pedidos pendientes y en preparación
        </Typography>
        {loading ? (
          <Typography>Cargando...</Typography>
        ) : (
          <List>
            {pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en preparación').length === 0 && (
              <Typography>No hay pedidos pendientes.</Typography>
            )}
            {pedidos.filter(p => p.estado === 'pendiente' || p.estado === 'en preparación' || p.estado === 'entregado').map(p => (
              <ListItem key={p.id} divider alignItems="flex-start" sx={{ flexDirection: 'column', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Pedido #{p.id} - Mesa {p.mesa || 'N/A'}
                </Typography>
                
                {/* Items de comida */}
                {p.items && p.items.filter(item => item.producto.tipo !== 'bebida').length > 0 && (
                  <div style={{ width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#d32f2f' }}>
                      🍽️ Comidas a preparar:
                    </Typography>
                    {p.items.flatMap((item, idx) => (
                      item.producto.tipo !== 'bebida'
                        ? Array.from({ length: item.cantidad }).map((_, subIdx) => (
                            <Paper key={idx + '-' + subIdx} elevation={1} sx={{ p: 2, mb: 1, bgcolor: item.preparado && item.preparado[subIdx] ? '#e8f5e8' : '#fff3e0' }}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1}>
                                <div>
                                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    1x {item.producto.nombre}
                                  </Typography>
                                  <Typography variant="caption" color={item.preparado && item.preparado[subIdx] ? 'success.main' : 'warning.main'}>
                                    {item.preparado && item.preparado[subIdx] ? '✅ Preparado' : '⏳ Pendiente'}
                                  </Typography>
                                </div>
                                {!(item.preparado && item.preparado[subIdx]) && (
                                  <Button 
                                    size="small" 
                                    color="success" 
                                    variant="contained" 
                                    onClick={async () => {
                                      await marcarItemPreparado(p.id, idx, subIdx);
                                      cargarPedidos();
                                    }}
                                    sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
                                  >
                                    ✅ Marcar preparado
                                  </Button>
                                )}
                              </Stack>
                            </Paper>
                          ))
                        : null
                    ))}
                  </div>
                )}

                {/* Bebidas sin preparar */}
                {p.bebidasSinPreparar && p.bebidasSinPreparar.length > 0 && (
                  <div style={{ width: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                      🥤 Bebidas (listas para barra):
                    </Typography>
                    {p.bebidasSinPreparar.map((b, idx) => (
                      <Paper key={idx} elevation={1} sx={{ p: 1.5, mb: 1, bgcolor: '#e3f2fd' }}>
                        <Typography variant="body2">
                          {b.cantidad}x {b.producto.nombre} - ✅ Listo para entregar
                        </Typography>
                      </Paper>
                    ))}
                  </div>
                )}

                {/* Estado y botón principal */}
                <div style={{ width: '100%' }}>
                  <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                    Estado: <strong>{p.estado === 'entregado' ? 'entregado (listo para cobrar)' : p.estado}</strong>
                  </Typography>
                </div>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: { xs: 1, sm: 0 }, minWidth: { xs: '100%', sm: 'auto' } }}>
                  {p.estado !== 'preparado' && (
                    <Button
                      variant="contained"
                      color={p.estado === 'pendiente' ? 'warning' : 'success'}
                      onClick={() => avanzarEstado(p.id, p.estado)}
                      disabled={
                        p.estado === 'en preparación' &&
                        p.items &&
                        p.items.filter(item => item.producto.tipo !== 'bebida').some(item =>
                          !Array.isArray(item.preparado) || item.preparado.some(val => !val)
                        )
                      }
                      sx={{ 
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        minWidth: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      {p.estado === 'pendiente' ? 'Marcar en preparación' : 'Marcar preparado'}
                    </Button>
                  )}
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Layout>
  );
}