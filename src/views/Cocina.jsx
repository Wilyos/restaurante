
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
              <ListItem key={p.id} divider alignItems="flex-start">
                <ListItemText
                  primary={`#${p.id} - ${p.nombre}`}
                  secondary={
                    <>
                      <b>Comidas y bebidas a preparar:</b>
                      <List dense sx={{ pl: 2 }}>
                        {p.items && p.items.filter(item => item.producto.tipo !== 'bebida').length > 0 ?
                          p.items.flatMap((item, idx) => (
                            item.producto.tipo !== 'bebida'
                              ? Array.from({ length: item.cantidad }).map((_, subIdx) => (
                                  <ListItem key={idx + '-' + subIdx} disableGutters>
                                    <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                      <ListItemText
                                        primary={`1x ${item.producto.nombre}`}
                                        secondary={item.preparado && item.preparado[subIdx] ? 'Preparado' : 'Pendiente'}
                                      />
                                      {!(item.preparado && item.preparado[subIdx]) && (
                                        <Button size="small" color="success" variant="outlined" onClick={async () => {
                                          await marcarItemPreparado(p.id, idx, subIdx);
                                          cargarPedidos();
                                        }}>Marcar preparado</Button>
                                      )}
                                    </Stack>
                                  </ListItem>
                                ))
                              : null
                          ))
                          : <ListItem><ListItemText primary="No hay ítems." /></ListItem>}
                      </List>
                      {p.bebidasSinPreparar && p.bebidasSinPreparar.length > 0 && (
                        <>
                          <b>Bebidas sin preparación:</b>
                          <List dense sx={{ pl: 2 }}>
                            {p.bebidasSinPreparar.map((b, idx) => (
                              <ListItem key={idx} disableGutters>
                                <ListItemText primary={`${b.cantidad}x ${b.producto.nombre}`} secondary="Listo para entregar" />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                      <br />
                      Estado general: {p.estado === 'entregado' ? 'entregado (listo para cobrar)' : p.estado}
                    </>
                  }
                />
                <Stack direction="row" spacing={1}>
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