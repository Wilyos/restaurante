import { useState } from 'react';
import {
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import { 
  Nfc as NfcIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { simularLecturaNFC, getClienteByNFC } from '../api/mockClientesNFC';

export default function LectorNFC({ onClienteDetectado, onError, disabled = false }) {
  const [leyendo, setLeyendo] = useState(false);
  const [ultimaLectura, setUltimaLectura] = useState(null);
  const [error, setError] = useState(null);

  const leerTarjeta = async () => {
    setLeyendo(true);
    setError(null);
    setUltimaLectura(null);

    try {
      // Simular lectura NFC
      const { nfcId } = await simularLecturaNFC();
      
      try {
        // Buscar cliente por NFC ID
        const cliente = await getClienteByNFC(nfcId);
        setUltimaLectura({ nfcId, cliente, registrado: true });
        onClienteDetectado && onClienteDetectado(cliente, nfcId);
      } catch (clienteError) {
        // Tarjeta detectada pero no registrada
        setUltimaLectura({ nfcId, registrado: false });
        onError && onError({
          tipo: 'no_registrado',
          mensaje: 'Tarjeta NFC detectada pero no registrada',
          nfcId
        });
      }
    } catch (lecturaError) {
      setError(lecturaError.message);
      onError && onError({
        tipo: 'lectura_error',
        mensaje: lecturaError.message
      });
    } finally {
      setLeyendo(false);
    }
  };

  const resetear = () => {
    setError(null);
    setUltimaLectura(null);
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 3, 
        textAlign: 'center',
        background: leyendo 
          ? 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)'
          : ultimaLectura?.registrado 
            ? 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)'
            : error || (ultimaLectura && !ultimaLectura.registrado)
              ? 'linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%)'
              : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
        border: leyendo 
          ? '2px solid #2196f3'
          : ultimaLectura?.registrado 
            ? '2px solid #4caf50'
            : error || (ultimaLectura && !ultimaLectura.registrado)
              ? '2px solid #f44336'
              : '2px solid #9e9e9e',
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animación de fondo para lectura */}
      {leyendo && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.3) 50%, rgba(33, 150, 243, 0.1) 100%)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      )}

      <Stack spacing={3} sx={{ position: 'relative', zIndex: 1 }}>
        {/* Icono principal */}
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {leyendo ? (
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress size={80} thickness={4} sx={{ color: '#2196f3' }} />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <NfcIcon sx={{ fontSize: 40, color: '#2196f3' }} />
              </Box>
            </Box>
          ) : ultimaLectura?.registrado ? (
            <CheckIcon sx={{ fontSize: 80, color: '#4caf50' }} />
          ) : error || (ultimaLectura && !ultimaLectura.registrado) ? (
            <ErrorIcon sx={{ fontSize: 80, color: '#f44336' }} />
          ) : (
            <NfcIcon 
              sx={{ 
                fontSize: 80, 
                color: disabled ? '#bdbdbd' : '#2196f3',
                opacity: disabled ? 0.5 : 1
              }} 
            />
          )}
        </Box>

        {/* Estado y título */}
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {leyendo ? 'Leyendo tarjeta NFC...' :
             ultimaLectura?.registrado ? '¡Cliente identificado!' :
             error ? 'Error de lectura' :
             ultimaLectura && !ultimaLectura.registrado ? 'Tarjeta no registrada' :
             'Lector NFC listo'}
          </Typography>

          {leyendo && (
            <Typography variant="body2" color="text.secondary">
              Acerque la tarjeta al lector
            </Typography>
          )}
        </Box>

        {/* Información del cliente o error */}
        {ultimaLectura?.cliente && (
          <Alert severity="success" variant="filled">
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              {ultimaLectura.cliente.nombre}
            </Typography>
            <Typography variant="body2">
              Puntos disponibles: <strong>{ultimaLectura.cliente.puntos}</strong>
            </Typography>
            <Typography variant="caption" display="block">
              Nivel: {ultimaLectura.cliente.nivel} | NFC: {ultimaLectura.cliente.nfcId}
            </Typography>
          </Alert>
        )}

        {ultimaLectura && !ultimaLectura.registrado && (
          <Alert severity="warning" variant="filled">
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
              Tarjeta detectada
            </Typography>
            <Typography variant="body2">
              NFC ID: {ultimaLectura.nfcId}
            </Typography>
            <Typography variant="caption">
              Esta tarjeta no está registrada en el sistema
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" variant="filled">
            <Typography variant="body1">{error}</Typography>
            <Typography variant="caption">
              Verifique que el lector esté conectado y la tarjeta esté cerca
            </Typography>
          </Alert>
        )}

        {/* Botones de acción */}
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            onClick={leerTarjeta}
            disabled={disabled || leyendo}
            startIcon={leyendo ? <CircularProgress size={20} color="inherit" /> : <NfcIcon />}
            sx={{ 
              minWidth: 150,
              bgcolor: '#2196f3',
              '&:hover': { bgcolor: '#1976d2' }
            }}
          >
            {leyendo ? 'Leyendo...' : 'Leer Tarjeta'}
          </Button>

          {(ultimaLectura || error) && (
            <Button
              variant="outlined"
              size="large"
              onClick={resetear}
              startIcon={<RefreshIcon />}
              sx={{ minWidth: 120 }}
            >
              Nuevo
            </Button>
          )}
        </Stack>

        {/* Información adicional */}
        {!leyendo && !ultimaLectura && !error && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Presione "Leer Tarjeta" para activar el lector NFC
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Las tarjetas deben estar a menos de 5cm del lector
            </Typography>
          </Box>
        )}

        {/* Indicadores de estado */}
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
          <Chip 
            label={disabled ? "Deshabilitado" : "Listo"}
            size="small"
            color={disabled ? "default" : "primary"}
            variant="outlined"
          />
          <Chip 
            label="NFC v2.0"
            size="small"
            variant="outlined"
          />
        </Stack>
      </Stack>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `}</style>
    </Paper>
  );
}