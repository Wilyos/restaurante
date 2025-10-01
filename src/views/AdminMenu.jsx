import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } from '../api/mockMenu';
import {
  Paper, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox,
  Select, MenuItem, InputLabel, FormControl, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AdminMenu() {
  useEffect(() => {
    document.body.classList.add('bg-admin');
    return () => document.body.classList.remove('bg-admin');
  }, []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', tipo: 'comida', requierePreparacion: true, precio: 0, disponible: true });

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getMenu();
      setItems(data);
    } catch (e) {
      setError('No se pudo cargar el menú');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    return items.filter(i => (filtroTipo === 'todos' || i.tipo === filtroTipo) && i.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  }, [items, filtroTipo, busqueda]);

  const openNew = () => {
    setEditing(null);
    setForm({ nombre: '', tipo: 'comida', requierePreparacion: true, precio: 0, disponible: true });
    setOpenForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ nombre: item.nombre, tipo: item.tipo, requierePreparacion: !!item.requierePreparacion, precio: item.precio, disponible: !!item.disponible });
    setOpenForm(true);
  };

  const saveForm = async () => {
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    try {
      if (editing) {
        await updateMenuItem(editing.id, form);
      } else {
        await addMenuItem(form);
      }
      setOpenForm(false);
      setEditing(null);
      setForm({ nombre: '', tipo: 'comida', requierePreparacion: true, precio: 0, disponible: true });
      loadData();
    } catch (e) {
      setError('No se pudo guardar el ítem');
    }
  };

  const removeItem = async (id) => {
    if (!confirm('¿Eliminar este ítem?')) return;
    await deleteMenuItem(id);
    loadData();
  };

  return (
    <Layout title="Administrar menú">
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>Ítems del menú</Typography>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="filtro-tipo">Tipo</InputLabel>
            <Select labelId="filtro-tipo" label="Tipo" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <MenuItem value="todos">Todos</MenuItem>
              <MenuItem value="entrada">Entradas</MenuItem>
              <MenuItem value="comida">Plato fuerte</MenuItem>
              <MenuItem value="postre">Postres</MenuItem>
              <MenuItem value="bebida">Bebidas</MenuItem>
            </Select>
          </FormControl>
          <TextField size="small" label="Buscar" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <Button variant="contained" onClick={openNew}>Nuevo</Button>
        </Box>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        {loading ? (
          <Typography>Cargando…</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell>Prep.</TableCell>
                  <TableCell>Disp.</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center">Sin resultados</TableCell></TableRow>
                ) : filtered.map(item => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>{item.tipo}</TableCell>
                    <TableCell align="right">${item.precio?.toLocaleString() || 0}</TableCell>
                    <TableCell>{item.requierePreparacion ? <Chip size="small" label="Sí" color="warning" /> : <Chip size="small" label="No" color="success" />}</TableCell>
                    <TableCell>{item.disponible ? <Chip size="small" label="Sí" color="success" /> : <Chip size="small" label="No" />}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(item)}><EditIcon /></IconButton>
                      <IconButton size="small" color="error" onClick={() => removeItem(item.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={openForm} onClose={() => setOpenForm(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Editar ítem' : 'Nuevo ítem'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
            <TextField label="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} autoFocus />
            <FormControl fullWidth>
              <InputLabel id="tipo">Tipo</InputLabel>
              <Select labelId="tipo" label="Tipo" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="comida">Plato fuerte</MenuItem>
                <MenuItem value="postre">Postre</MenuItem>
                <MenuItem value="bebida">Bebida</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Precio" type="number" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: Number(e.target.value) }))} inputProps={{ min: 0 }} />
            <FormControlLabel control={<Checkbox checked={form.requierePreparacion} onChange={e => setForm(f => ({ ...f, requierePreparacion: e.target.checked }))} />} label="Requiere preparación" />
            <FormControlLabel control={<Checkbox checked={form.disponible} onChange={e => setForm(f => ({ ...f, disponible: e.target.checked }))} />} label="Disponible" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenForm(false)}>Cancelar</Button>
          <Button variant="contained" onClick={saveForm}>{editing ? 'Guardar' : 'Crear'}</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
