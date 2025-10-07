import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, resetMenu } from '../api/mockMenu';
import {
  Paper, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox,
  Select, MenuItem, InputLabel, FormControl, IconButton, Card, CardContent, Stack, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function AdminMenu() {
  useEffect(() => {
    document.body.classList.add('bg-admin');
    return () => document.body.classList.remove('bg-admin');
  }, []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', tipo: 'comida', requierePreparacion: true, precio: 0, disponible: true });
  const [snack, setSnack] = useState('');

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

  const validate = () => {
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (form.precio === '' || isNaN(Number(form.precio))) errs.precio = 'El precio es obligatorio';
    if (Number(form.precio) <= 0) errs.precio = 'El precio debe ser mayor a 0';
    const normalized = form.nombre.trim().toLowerCase();
    const dup = items.some(i => i.nombre.trim().toLowerCase() === normalized && (!editing || i.id !== editing.id));
    if (dup) errs.nombre = 'Ya existe un ítem con ese nombre';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveForm = async () => {
    setError('');
    if (!validate()) return;
    try {
      if (editing) {
        await updateMenuItem(editing.id, form);
      } else {
        await addMenuItem(form);
      }
      setOpenForm(false);
      setEditing(null);
      setForm({ nombre: '', tipo: 'comida', requierePreparacion: true, precio: 0, disponible: true });
      setFormErrors({});
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Layout title="Administrar menú">
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header responsive */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, textAlign: { xs: 'center', md: 'left' } }}>
            Ítems del menú
          </Typography>
          
          {/* Controles responsive */}
          <Stack spacing={2}>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap', 
              alignItems: 'center',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                <InputLabel id="filtro-tipo">Tipo</InputLabel>
                <Select labelId="filtro-tipo" label="Tipo" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="entrada">Entradas</MenuItem>
                  <MenuItem value="comida">Plato fuerte</MenuItem>
                  <MenuItem value="postre">Postres</MenuItem>
                  <MenuItem value="bebida">Bebidas</MenuItem>
                </Select>
              </FormControl>
              
              <TextField 
                size="small" 
                label="Buscar" 
                value={busqueda} 
                onChange={e => setBusqueda(e.target.value)}
                sx={{ minWidth: { xs: '100%', sm: 200 } }}
              />
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button 
                variant="contained" 
                onClick={openNew}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Nuevo
              </Button>
              <Button 
                variant="outlined" 
                color="warning" 
                onClick={async () => {
                  if (!confirm('¿Seguro que quieres resetear el menú a los valores por defecto?')) return;
                  await resetMenu();
                  setSnack('Menú reseteado');
                  loadData();
                }}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Resetear menú
              </Button>
            </Box>
          </Stack>
        </Box>

        {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
        
        {loading ? (
          <Typography>Cargando…</Typography>
        ) : isMobile ? (
          // Vista móvil con Cards
          <Stack spacing={2}>
            {filtered.length === 0 ? (
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    Sin resultados
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              filtered.map(item => (
                <Card key={item.id} elevation={2} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    {/* Header del item */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: 2 
                    }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {item.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                          {item.tipo}
                        </Typography>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        ${item.precio?.toLocaleString() || 0}
                      </Typography>
                    </Box>

                    {/* Estado y propiedades */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Chip 
                        size="small" 
                        label={item.requierePreparacion ? "Requiere prep." : "Sin prep."} 
                        color={item.requierePreparacion ? "warning" : "success"}
                        variant="outlined"
                      />
                      <Chip 
                        size="small" 
                        label={item.disponible ? "Disponible" : "No disponible"} 
                        color={item.disponible ? "success" : "default"}
                        variant="outlined"
                      />
                    </Box>

                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => openEdit(item)}
                        sx={{ flex: 1 }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => removeItem(item.id)}
                        sx={{ flex: 1 }}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        ) : (
          // Vista desktop con tabla
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
                    <TableCell sx={{ textTransform: 'capitalize' }}>{item.tipo}</TableCell>
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

      {snack && (
        <Box sx={{ position: 'fixed', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ bgcolor: '#323232', color: '#fff', px: 2, py: 1, borderRadius: 1 }} onAnimationEnd={() => setSnack('')}>
            {snack}
          </Box>
        </Box>
      )}

      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        fullWidth 
        maxWidth="xs"
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          textAlign: { xs: 'center', sm: 'left' },
          pb: { xs: 1, sm: 2 }
        }}>
          {editing ? 'Editar ítem' : 'Nuevo ítem'}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Nombre" 
              value={form.nombre} 
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} 
              autoFocus 
              error={!!formErrors.nombre} 
              helperText={formErrors.nombre}
              fullWidth
              size={isMobile ? "medium" : "small"}
            />
            
            <FormControl fullWidth>
              <InputLabel id="tipo">Tipo</InputLabel>
              <Select 
                labelId="tipo" 
                label="Tipo" 
                value={form.tipo} 
                onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                size={isMobile ? "medium" : "small"}
              >
                <MenuItem value="entrada">Entrada</MenuItem>
                <MenuItem value="comida">Plato fuerte</MenuItem>
                <MenuItem value="postre">Postre</MenuItem>
                <MenuItem value="bebida">Bebida</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              label="Precio" 
              type="number" 
              value={form.precio} 
              onChange={e => setForm(f => ({ ...f, precio: e.target.value }))} 
              inputProps={{ min: 1 }} 
              error={!!formErrors.precio} 
              helperText={formErrors.precio}
              fullWidth
              size={isMobile ? "medium" : "small"}
            />
            
            <Box>
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={form.requierePreparacion} 
                    onChange={e => setForm(f => ({ ...f, requierePreparacion: e.target.checked }))} 
                    size={isMobile ? "medium" : "small"}
                  />
                } 
                label="Requiere preparación"
                sx={{ display: 'block', mb: 1 }}
              />
              <FormControlLabel 
                control={
                  <Checkbox 
                    checked={form.disponible} 
                    onChange={e => setForm(f => ({ ...f, disponible: e.target.checked }))} 
                    size={isMobile ? "medium" : "small"}
                  />
                } 
                label="Disponible"
                sx={{ display: 'block' }}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 }, 
          pb: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={() => setOpenForm(false)}
            sx={{ 
              order: { xs: 2, sm: 1 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Cancelar
          </Button>
          {(() => {
            const nombreTrim = String(form.nombre || '').trim();
            const precioNum = Number(form.precio);
            const isPrecioValid = !Number.isNaN(precioNum) && precioNum > 0;
            const isNombreValid = nombreTrim.length > 0;
            const isDup = items.some(i => i.nombre.trim().toLowerCase() === nombreTrim.toLowerCase() && (!editing || i.id !== editing.id));
            const canSubmit = isPrecioValid && isNombreValid && !isDup;
            let tooltip = '';
            if (!isNombreValid) tooltip = 'El nombre es obligatorio';
            else if (isDup) tooltip = 'Ya existe un ítem con ese nombre';
            else if (!isPrecioValid) tooltip = 'El precio debe ser mayor a 0';
            return (
              <Tooltip title={!canSubmit ? tooltip : ''} arrow>
                <span style={{ 
                  order: isMobile ? 1 : 2,
                  width: isMobile ? '100%' : 'auto'
                }}>
                  <Button 
                    variant="contained" 
                    onClick={saveForm} 
                    disabled={!canSubmit}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    {editing ? 'Guardar' : 'Crear'}
                  </Button>
                </span>
              </Tooltip>
            );
          })()}
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
