import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getPedidos, marcarBebidaEntregada } from '../api/mockPedidos';
import { Box, Typography, Card, CardContent, Grid, Chip, Button, Paper, Stack } from '@mui/material';

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
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>🥤 Pedidos de bebidas</Typography>
      
      {bebidasPorMesa.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5' }}>
          <Typography variant="h6" color="text.secondary">
            📋 No hay bebidas pendientes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Cuando lleguen pedidos con bebidas aparecerán aquí
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {bebidasPorMesa.map(({ id, mesa, bebidas, estado }) => (
            <Grid item xs={12} md={6} key={id}>
              <Card elevation={3} sx={{ mb: 2, border: '2px solid', borderColor: estado === 'entregado' ? '#4caf50' : '#ff9800' }}>
                <CardContent sx={{ pb: 2 }}>
                  {/* Header de la mesa */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                      🪑 Mesa {mesa}
                    </Typography>
                    <Chip 
                      label={estado} 
                      color={estado === 'entregado' ? 'success' : 'warning'} 
                      size="small"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>

                  {/* Lista de bebidas */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: '#1976d2' }}>
                    Bebidas a preparar:
                  </Typography>
                  
                  <Stack spacing={1}>
                    {bebidas.map((item, idxBebida) => (
                      Array.from({ length: item.cantidad }).map((_, idxUnidad) => {
                        const entregada = item.entregada && item.entregada[idxUnidad];
                        return (
                          <Paper 
                            key={idxBebida + '-' + idxUnidad} 
                            elevation={1} 
                            sx={{ 
                              p: 2, 
                              bgcolor: entregada ? '#e8f5e8' : '#fff3e0',
                              border: '1px solid',
                              borderColor: entregada ? '#4caf50' : '#ff9800'
                            }}
                          >
                            <Stack 
                              direction={{ xs: 'column', sm: 'row' }} 
                              justifyContent="space-between" 
                              alignItems={{ xs: 'flex-start', sm: 'center' }} 
                              spacing={1}
                            >
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                  🥤 1x {item.producto.nombre}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: entregada ? 'success.main' : 'warning.main',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {entregada ? '✅ Entregada' : '⏳ Pendiente'}
                                </Typography>
                              </Box>
                              
                              {!entregada && (
                                <Button
                                  variant="contained"
                                  color="success"
                                  size="small"
                                  onClick={async () => { 
                                    await marcarBebidaEntregada(id, idxBebida, idxUnidad); 
                                    cargarPedidos(); 
                                  }}
                                  sx={{ 
                                    minWidth: { xs: '100%', sm: 'auto' },
                                    fontWeight: 'bold'
                                  }}
                                >
                                  ✅ Marcar entregada
                                </Button>
                              )}
                            </Stack>
                          </Paper>
                        );
                      })
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Layout>
  );
}
