
import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Layout from '../components/Layout';
import { getPedidos, cambiarEstadoPedido } from '../api/mockPedidos';

export default function Caja() {
  useEffect(() => {
    document.body.classList.add("bg-caja");
    return () => document.body.classList.remove("bg-caja");
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


  const marcarEntregado = async (id) => {
    await cambiarEstadoPedido(id, 'entregado');
    cargarPedidos();
  };

  const marcarPagado = async (id) => {
    await cambiarEstadoPedido(id, 'pagado');
    cargarPedidos();
  };

  // Función para calcular el total del pedido
  const calcularTotal = (pedido) => {
    let total = 0;
    if (pedido.items && pedido.items.length > 0) {
      total += pedido.items.reduce((acc, i) => acc + i.cantidad * (i.producto.precio || 0), 0);
    }
    if (pedido.bebidasSinPreparar && pedido.bebidasSinPreparar.length > 0) {
      total += pedido.bebidasSinPreparar.reduce((acc, b) => acc + b.cantidad * (b.producto.precio || 0), 0);
    }
    return total;
  };

  return (
    <Layout title="Caja">
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Typography variant="body1" gutterBottom>
          Pedidos listos para cobrar
        </Typography>
        {loading ? (
          <Typography>Cargando...</Typography>
        ) : (
          <List>
            {pedidos.filter(p => p.estado === 'entregado-al-cliente').length === 0 && (
              <Typography>No hay pedidos listos para cobrar.</Typography>
            )}
            {pedidos.filter(p => p.estado === 'entregado-al-cliente').map(p => (
              <ListItem key={p.id} divider alignItems="flex-start">
                <ListItemText
                  primary={`#${p.id} - ${p.nombre}`}
                  secondary={
                    <>
                      <b>Comidas y bebidas a cobrar:</b>
                      <List dense sx={{ pl: 2 }}>
                        {p.items && p.items.length > 0 ? p.items.map((item, idx) => (
                          <ListItem key={idx} disableGutters>
                            <ListItemText
                              primary={`${item.cantidad}x ${item.producto.nombre}`}
                              secondary={`$${item.producto.precio?.toLocaleString() || 0} c/u`}
                            />
                          </ListItem>
                        )) : <ListItem><ListItemText primary="No hay ítems." /></ListItem>}
                      </List>
                      {p.bebidasSinPreparar && p.bebidasSinPreparar.length > 0 && (
                        <>
                          <b>Bebidas sin preparación:</b>
                          <List dense sx={{ pl: 2 }}>
                            {p.bebidasSinPreparar.map((b, idx) => (
                              <ListItem key={idx} disableGutters>
                                <ListItemText
                                  primary={`${b.cantidad}x ${b.producto.nombre}`}
                                  secondary={`$${b.producto.precio?.toLocaleString() || 0} c/u`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}
                      <br />
                      <b>Total: ${calcularTotal(p).toLocaleString()}</b>
                      <br />
                      Estado: {p.estado}
                    </>
                  }
                />
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => marcarPagado(p.id)}
                  >
                    Cobrar
                  </Button>
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Layout>
  );
}