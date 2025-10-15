import { useState, useEffect } from 'react';
import {
  Chip,
  Tooltip,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  LinearProgress
} from '@mui/material';
import {
  CloudDone as OnlineIcon,
  CloudOff as OfflineIcon,
  Sync as SyncIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Router as ServerIcon,
  Smartphone as DeviceIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { 
  getConnectivityStatus, 
  forceServerCheck, 
  syncAllData 
} from '../utils/dataManager';

export default function ConnectivityStatus() {
  const [status, setStatus] = useState({ serverAvailable: false });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const checkStatus = async () => {
    const currentStatus = getConnectivityStatus();
    setStatus(currentStatus);
    return currentStatus;
  };

  const handleRefresh = async () => {
    setSyncing(true);
    try {
      await forceServerCheck();
      await checkStatus();
      
      const newStatus = getConnectivityStatus();
      if (newStatus.serverAvailable) {
        const syncSuccess = await syncAllData();
        if (syncSuccess) {
          setLastSync(new Date().toISOString());
        }
      }
    } catch (error) {
      console.error('Error al actualizar conectividad:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Verificar estado cada 30 segundos
  useEffect(() => {
    checkStatus();
    
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    return status.serverAvailable ? 'success' : 'warning';
  };

  const getStatusIcon = () => {
    if (syncing) {
      return <SyncIcon sx={{ animation: 'spin 1s linear infinite' }} />;
    }
    return status.serverAvailable ? <OnlineIcon /> : <OfflineIcon />;
  };

  const getStatusText = () => {
    if (syncing) return 'Sincronizando...';
    return status.serverAvailable ? 'Online' : 'Solo Local';
  };

  return (
    <Box>
      <Tooltip title="Estado de conectividad - Click para más detalles">
        <Chip
          icon={getStatusIcon()}
          label={getStatusText()}
          color={getStatusColor()}
          variant="outlined"
          size="small"
          onClick={() => setDialogOpen(true)}
          sx={{
            cursor: 'pointer',
            '& .MuiChip-icon': {
              fontSize: 16,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              }
            }
          }}
        />
      </Tooltip>

      {/* Diálogo de Información de Conectividad */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon />
          Estado de Conectividad
          <Box sx={{ ml: 'auto' }}>
            <IconButton 
              onClick={handleRefresh} 
              disabled={syncing}
              size="small"
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {syncing && <LinearProgress sx={{ mb: 2 }} />}
          
          <Alert 
            severity={status.serverAvailable ? 'success' : 'warning'} 
            sx={{ mb: 3 }}
          >
            <Typography variant="body2">
              <strong>
                {status.serverAvailable ? 
                  '✅ Modo Online - Datos sincronizados con servidor' : 
                  '⚠️ Modo Solo Local - Datos guardados localmente'
                }
              </strong>
            </Typography>
            <Typography variant="caption">
              {status.serverAvailable ? 
                'Los datos se sincronizan automáticamente entre dispositivos' :
                'Los datos se guardarán solo en este dispositivo hasta que se restablezca la conexión'
              }
            </Typography>
          </Alert>

          <List>
            <ListItem>
              <ListItemIcon>
                <ServerIcon color={status.serverAvailable ? 'success' : 'disabled'} />
              </ListItemIcon>
              <ListItemText
                primary="Servidor Central"
                secondary={
                  status.serverAvailable ? 
                    'Conectado - http://localhost:3001' : 
                    'Desconectado - Usando datos locales'
                }
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <StorageIcon color="success" />
              </ListItemIcon>
              <ListItemText
                primary="Almacenamiento Local"
                secondary="Activo - Los datos se guardan en este dispositivo como respaldo"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <DeviceIcon color="info" />
              </ListItemIcon>
              <ListItemText
                primary="Acceso Multi-Dispositivo"
                secondary={
                  status.serverAvailable ? 
                    'Disponible - Puedes acceder desde otros dispositivos' :
                    'No disponible - Solo en este dispositivo'
                }
              />
            </ListItem>

            {lastSync && (
              <ListItem>
                <ListItemIcon>
                  <SyncIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Última Sincronización"
                  secondary={new Date(lastSync).toLocaleString('es-ES')}
                />
              </ListItem>
            )}
          </List>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              💡 ¿Cómo funciona?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • <strong>Modo Online:</strong> Los datos se guardan tanto localmente como en el servidor, 
              permitiendo acceso desde múltiples dispositivos.<br/>
              • <strong>Modo Local:</strong> Los datos se guardan solo en este dispositivo. 
              Cuando se restablezca la conexión, se sincronizarán automáticamente.<br/>
              • <strong>Sincronización:</strong> El sistema verifica la conexión cada 30 segundos 
              y sincroniza los cambios pendientes.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={handleRefresh} 
            disabled={syncing}
            startIcon={<RefreshIcon />}
          >
            Verificar Conexión
          </Button>
          <Button onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}