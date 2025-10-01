import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const roles = [
  { label: 'Mesero', value: 'mesero', path: '/mesero' },
  { label: 'Cocina', value: 'cocina', path: '/cocina' },
  { label: 'Barra', value: 'barra', path: '/barra' },
  { label: 'Caja', value: 'caja', path: '/caja' },
  { label: 'Admin', value: 'admin', path: '/admin/menu' },
];

export default function Login() {
  const { setRol } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (rol, path) => {
    setRol(rol);
    navigate(path);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, margin: '64px auto', textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Selecciona tu cargo</Typography>
      <Stack spacing={2} mt={3}>
        {roles.map(r => (
          <Button key={r.value} variant="contained" onClick={() => handleSelect(r.value, r.path)}>{r.label}</Button>
        ))}
      </Stack>
    </Paper>
  );
}
