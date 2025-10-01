import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getPedidos, marcarBebidaEntregada } from '../api/mockPedidos';
import { Box, Typography, Card, CardContent, Grid, Chip, Button } from '@mui/material';

export default function Barra() {
  useEffect(() => {
    document.body.classList.add("bg-barra");
    return () => document.body.classList.remove("bg-barra");
  }, []);
  const [pedidos, setPedidos] = useState([]);


  const cargarPedidos = () => {
    getPedidos().then(setPedidos);
  };
  useEffect(() => {
    cargarPedidos();
  }, []);

  // Filtrar solo bebidas pendientes y usar la nueva estructura
  const bebidasPorMesa = pedidos
    .filter(p => p.estado !== 'pagado' && p.estado !== 'entregado-al-cliente')
    .map(p => ({
      id: p.id,
      mesa: p.mesa,
      bebidas: (p.bebidas || []),
      estado: p.estado
    }))
    .filter(p => p.bebidas.length > 0);

  return (
    <Layout title="Barra / Bar">
      <Typography variant="h5" sx={{ mb: 3 }}>Pedidos de bebidas</Typography>
      <Grid container spacing={2}>
        {bebidasPorMesa.length === 0 && (
          <Typography sx={{ color: '#888', ml: 2 }}>No hay bebidas pendientes.</Typography>
        )}
        {bebidasPorMesa.map(({ id, mesa, bebidas, estado }) => (
          <Grid item xs={12} md={6} key={mesa}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">Mesa {mesa}</Typography>
                <Box sx={{ mb: 1 }}>
                  <Chip label={estado} color={estado === 'entregado' ? 'success' : 'warning'} size="small" />
                </Box>
                <ul>
                  {bebidas.map((item, idxBebida) => (
                    Array.from({ length: item.cantidad }).map((_, idxUnidad) => (
                      <li key={idxBebida + '-' + idxUnidad} style={{ marginBottom: 8 }}>
                        1 x {item.producto.nombre}
                        {item.entregada && item.entregada[idxUnidad] ? (
                          <Chip label="Entregada" color="success" size="small" sx={{ ml: 1 }} />
                        ) : (
                          <>
                            <Chip label="Pendiente" color="warning" size="small" sx={{ ml: 1 }} />
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              sx={{ ml: 1, minWidth: 0, px: 1, fontSize: 12 }}
                              onClick={async () => { await marcarBebidaEntregada(id, idxBebida, idxUnidad); cargarPedidos(); }}
                            >
                              Marcar entregada
                            </Button>
                          </>
                        )}
                      </li>
                    ))
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}
