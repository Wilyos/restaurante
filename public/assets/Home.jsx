import { useEffect, useState } from 'react';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { getPedidos } from '../api/mockPedidos';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Layout from '../components/Layout';

export default function Home() {
  useEffect(() => {
    document.body.classList.add("bg-home");
    return () => document.body.classList.remove("bg-home");
  }, []);
  const [pedidos, setPedidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  useEffect(() => {
    let activo = true;
    const fetchPedidos = () => getPedidos().then(data => { if (activo) setPedidos(data); });
    fetchPedidos();
    const interval = setInterval(fetchPedidos, 3000);
    return () => { activo = false; clearInterval(interval); };
  }, []);

  // Obtener todos los estados únicos presentes en los pedidos
  const estados = Array.from(new Set(pedidos.map(p => p.estado)));
  const pedidosFiltrados = filtroEstado === 'todos' ? pedidos : pedidos.filter(p => p.estado === filtroEstado);


  // Colores para los estados
  const colorEstado = estado => {
    switch (estado) {
      case 'pendiente': return 'default';
      case 'en preparación': return 'warning';
      case 'preparado': return 'info';
      case 'entregado': return 'success';
      case 'entregado-al-cliente': return 'primary';
      case 'pagado': return 'secondary';
      default: return 'default';
    }
  };

  const labelEstado = estado => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en preparación': return 'En preparación';
      case 'preparado': return 'Preparado';
      case 'entregado': return 'Entregado';
      case 'entregado-al-cliente': return 'Entregado al cliente';
      case 'pagado': return 'Pagado';
      default: return estado;
    }
  };

  return (
    <Layout title="Inicio">
      <Paper sx={{ p: 3, maxWidth: 800, margin: '32px auto', backgroundColor: 'rgba(255,255,255,0.85)' }}>
        <Typography variant="h4" align="center" gutterBottom>
          Bienvenido!
        </Typography>
        <Typography variant="h6" align="center" gutterBottom>
          Lista de pedidos y su estado
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, justifyContent: 'center' }}>
          <Chip label="Pendiente" color="default" size="small" />
          <Chip label="En preparación" color="warning" size="small" />
          <Chip label="Preparado" color="info" size="small" />
          <Chip label="Entregado" color="success" size="small" />
          <Chip label="Entregado al cliente" color="primary" size="small" />
          <Chip label="Pagado" color="secondary" size="small" />
        </Box>
        <FormControl sx={{ minWidth: 200, mb: 2 }} size="small">
          <InputLabel id="filtro-estado-label">Filtrar por estado</InputLabel>
          <Select
            labelId="filtro-estado-label"
            value={filtroEstado}
            label="Filtrar por estado"
            onChange={e => setFiltroEstado(e.target.value)}
          >
            <MenuItem value="todos">Todos</MenuItem>
          {estados.map(e => (
            <MenuItem key={e} value={e}>{labelEstado(e)}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
               <TableCell>Mesa</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Detalle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No hay pedidos</TableCell>
              </TableRow>
            ) : (
              pedidosFiltrados.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.mesa || '-'}</TableCell>
                  <TableCell align="center">
                    <Chip label="" color={colorEstado(p.estado)} size="small" sx={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #222' }} />
                  </TableCell>
                  <TableCell>
                    {p.items && p.items.length > 0 && (
                      <>
                        <b>Comidas/Bebidas:</b> {p.items.map(i => `${i.cantidad}x ${i.producto.nombre}`).join(', ')}
                      </>
                    )}
                    {p.bebidasSinPreparar && p.bebidasSinPreparar.length > 0 && (
                      <>
                        <br /><b>Bebidas sin preparación:</b> {p.bebidasSinPreparar.map(b => `${b.cantidad}x ${b.producto.nombre}`).join(', ')}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>
    </Layout>
  );
}
