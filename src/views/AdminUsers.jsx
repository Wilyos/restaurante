import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { getUsers, addUser, updateUser, deleteUser, resetUsers, getRoles } from '../api/mockUsers';
import {
  Paper, Typography, Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControlLabel, Checkbox,
  Select, MenuItem, InputLabel, FormControl, IconButton, Card, CardContent, Stack, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function AdminUsers() {
  useEffect(() => {
    document.body.classList.add('bg-admin');
    return () => document.body.classList.remove('bg-admin');
  }, []);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [filtroRole, setFiltroRole] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    username: '',
    password: '',
    name: '',
    role: 'mesero',
    active: true
  });
  const [snack, setSnack] = useState('');

  const roles = getRoles();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (e) {
      setError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return users.filter(u =>
      (filtroRole === 'todos' || u.role === filtroRole) &&
      (u.name.toLowerCase().includes(busqueda.toLowerCase()) ||
       u.username.toLowerCase().includes(busqueda.toLowerCase()))
    );
  }, [users, filtroRole, busqueda]);

  const openNew = () => {
    setEditing(null);
    setForm({
      username: '',
      password: '',
      name: '',
      role: 'mesero',
      active: true
    });
    setFormErrors({});
    setOpenForm(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      username: user.username,
      password: '', // No mostrar contraseña actual
      name: user.name,
      role: user.role,
      active: user.active
    });
    setFormErrors({});
    setOpenForm(true);
  };

  const validate = () => {
    const errs = {};
    
    if (!form.username.trim()) {
      errs.username = 'El nombre de usuario es obligatorio';
    }
    
    if (!form.name.trim()) {
      errs.name = 'El nombre es obligatorio';
    }
    
    // Validar contraseña solo si es nuevo usuario o se está cambiando
    if (!editing && !form.password.trim()) {
      errs.password = 'La contraseña es obligatoria para usuarios nuevos';
    } else if (form.password && form.password.length < 6) {
      errs.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveForm = async () => {
    setError('');
    if (!validate()) return;

    try {
      const userData = {
        username: form.username,
        name: form.name,
        role: form.role,
        active: form.active,
        ...(form.password && { password: form.password })
      };

      if (editing) {
        await updateUser(editing.id, userData);
        setSnack('Usuario actualizado correctamente');
      } else {
        await addUser(userData);
        setSnack('Usuario creado correctamente');
      }

      setOpenForm(false);
      setEditing(null);
      setForm({
        username: '',
        password: '',
        name: '',
        role: 'mesero',
        active: true
      });
      setFormErrors({});
      loadData();
    } catch (e) {
      setError(e.message || 'No se pudo guardar el usuario');
    }
  };

  const removeUser = async (id, username) => {
    if (!confirm(`¿Eliminar el usuario "${username}"?`)) return;
    
    try {
      await deleteUser(id);
      setSnack('Usuario eliminado correctamente');
      loadData();
    } catch (e) {
      setError(e.message || 'No se pudo eliminar el usuario');
    }
  };

  const handleResetUsers = async () => {
    if (!confirm('¿Seguro que quieres resetear todos los usuarios a los valores por defecto?')) return;
    
    try {
      await resetUsers();
      setSnack('Usuarios reseteados a valores por defecto');
      loadData();
    } catch (e) {
      setError('No se pudieron resetear los usuarios');
    }
  };

  const getRoleLabel = (role) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj ? roleObj.label : role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      mesero: 'primary',
      cocina: 'warning',
      barra: 'info',
      caja: 'secondary'
    };
    return colors[role] || 'default';
  };

  return (
    <Layout title="Gestionar Usuarios">
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header responsive */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonIcon color="primary" />
            <Typography variant="h6" sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              Gestión de Usuarios
            </Typography>
          </Box>
          
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
                <InputLabel id="filtro-role">Rol</InputLabel>
                <Select 
                  labelId="filtro-role" 
                  label="Rol" 
                  value={filtroRole} 
                  onChange={e => setFiltroRole(e.target.value)}
                >
                  <MenuItem value="todos">Todos los roles</MenuItem>
                  {roles.map(role => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField 
                size="small" 
                label="Buscar usuario" 
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
                startIcon={<PersonAddIcon />}
                onClick={openNew}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Nuevo Usuario
              </Button>
              <Button 
                variant="outlined" 
                color="warning"
                startIcon={<RefreshIcon />}
                onClick={handleResetUsers}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Resetear Usuarios
              </Button>
            </Box>
          </Stack>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        {loading ? (
          <Typography>Cargando usuarios…</Typography>
        ) : isMobile ? (
          // Vista móvil con Cards
          <Stack spacing={2}>
            {filtered.length === 0 ? (
              <Card elevation={1}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    {users.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron usuarios'}
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              filtered.map(user => (
                <Card key={user.id} elevation={2} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    {/* Header del usuario */}
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      mb: 2 
                    }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{user.username}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip 
                          label={getRoleLabel(user.role)}
                          color={getRoleColor(user.role)}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="caption" sx={{ display: 'block' }}>
                          {user.active ? (
                            <Chip label="Activo" color="success" size="small" variant="outlined" />
                          ) : (
                            <Chip label="Inactivo" color="default" size="small" variant="outlined" />
                          )}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Información adicional */}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Creado: {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>

                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => openEdit(user)}
                        sx={{ flex: 1 }}
                      >
                        Editar
                      </Button>
                      {user.username !== 'admin' && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => removeUser(user.id, user.username)}
                          sx={{ flex: 1 }}
                        >
                          Eliminar
                        </Button>
                      )}
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
                  <TableCell>Usuario</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell>Creado</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {users.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron usuarios'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(user => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>@{user.username}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getRoleLabel(user.role)} 
                          color={getRoleColor(user.role)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="center">
                        {user.active ? (
                          <Chip label="Activo" color="success" size="small" />
                        ) : (
                          <Chip label="Inactivo" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => openEdit(user)}>
                          <EditIcon />
                        </IconButton>
                        {user.username !== 'admin' && (
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => removeUser(user.id, user.username)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Snackbar de notificaciones */}
      {snack && (
        <Box sx={{ position: 'fixed', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Box 
            sx={{ 
              bgcolor: '#323232', 
              color: '#fff', 
              px: 3, 
              py: 1.5, 
              borderRadius: 1,
              boxShadow: 3
            }} 
            onAnimationEnd={() => setSnack('')}
          >
            {snack}
          </Box>
        </Box>
      )}

      {/* Dialog del formulario */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        fullWidth 
        maxWidth="sm"
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          textAlign: { xs: 'center', sm: 'left' },
          pb: { xs: 1, sm: 2 }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonIcon />
            {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField 
              label="Nombre completo" 
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
              error={!!formErrors.name} 
              helperText={formErrors.name}
              fullWidth
              autoFocus
            />
            
            <TextField 
              label="Nombre de usuario" 
              value={form.username} 
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} 
              error={!!formErrors.username} 
              helperText={formErrors.username}
              fullWidth
            />
            
            <TextField 
              label={editing ? "Nueva contraseña (opcional)" : "Contraseña"} 
              type="password"
              value={form.password} 
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} 
              error={!!formErrors.password} 
              helperText={formErrors.password || (editing ? "Déjalo vacío para mantener la contraseña actual" : "")}
              fullWidth
            />
            
            <FormControl fullWidth>
              <InputLabel id="role-select">Rol</InputLabel>
              <Select 
                labelId="role-select" 
                label="Rol" 
                value={form.role} 
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              >
                {roles.map(role => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={form.active} 
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} 
                />
              } 
              label="Usuario activo"
            />
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
          <Button 
            variant="contained" 
            onClick={saveForm}
            disabled={!form.username.trim() || !form.name.trim() || (!editing && !form.password.trim())}
            sx={{ 
              order: { xs: 1, sm: 2 },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {editing ? 'Guardar Cambios' : 'Crear Usuario'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}