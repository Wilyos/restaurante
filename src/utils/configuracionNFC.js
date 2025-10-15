// Utilidades para cargar y gestionar configuraciones del sistema NFC

// Configuración por defecto del sistema
const CONFIGURACION_DEFECTO = {
  // Configuración de puntos
  puntosPerPeso: 1,
  valorPunto: 1,
  puntosMinimosCanjeables: 100,
  bonificacionBienvenida: 50,
  
  // Configuración de niveles
  niveles: {
    bronce: { minPuntos: 0, multiplicador: 1.0, nombre: 'Bronce', color: '#cd7f32' },
    plata: { minPuntos: 500, multiplicador: 1.1, nombre: 'Plata', color: '#c0c0c0' },
    oro: { minPuntos: 1000, multiplicador: 1.2, nombre: 'Oro', color: '#ffd700' },
    diamante: { minPuntos: 2000, multiplicador: 1.5, nombre: 'Diamante', color: '#b9f2ff' }
  },
  
  // Configuración de tarjetas NFC
  nfcConfig: {
    formatoId: 'NFC############', 
    longitudId: 15,
    prefijo: 'NFC',
    validacionEstricta: true,
    tiempoLectura: 1500,
    intentosMaximos: 3,
    rangosFrecuencia: ['13.56 MHz'],
    protocolos: ['ISO14443A', 'ISO14443B', 'ISO15693']
  },
  
  // Configuración de promociones
  promociones: {
    habilitadas: true,
    puntosDobles: {
      activo: false,
      diasSemana: [6, 0], // Sábado y domingo
      horaInicio: '18:00',
      horaFin: '22:00'
    },
    bonusCumpleanos: {
      activo: true,
      puntosBonu: 200
    }
  },
  
  // Configuración de seguridad
  seguridad: {
    bloqueoTarjeta: true,
    intentosFallidosMax: 5,
    tiempoBloqueo: 30, // minutos
    validarEmail: true,
    validarTelefono: false,
    logTransacciones: true
  }
};

// Cargar configuración desde localStorage
export function cargarConfiguracion() {
  try {
    const configGuardada = localStorage.getItem('restaurante_config_nfc');
    if (configGuardada) {
      const config = JSON.parse(configGuardada);
      // Combinar con configuración por defecto para asegurar que todos los campos existen
      return { ...CONFIGURACION_DEFECTO, ...config };
    }
  } catch (error) {
    console.error('Error cargando configuración:', error);
  }
  
  return CONFIGURACION_DEFECTO;
}

// Guardar configuración en localStorage
export function guardarConfiguracion(config) {
  try {
    localStorage.setItem('restaurante_config_nfc', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error guardando configuración:', error);
    return false;
  }
}

// Determinar nivel del cliente basado en puntos acumulados y configuración actual
export function determinarNivelCliente(puntosAcumulados) {
  const config = cargarConfiguracion();
  const niveles = Object.entries(config.niveles)
    .sort((a, b) => b[1].minPuntos - a[1].minPuntos); // Ordenar de mayor a menor
  
  for (const [id, nivel] of niveles) {
    if (puntosAcumulados >= nivel.minPuntos) {
      return nivel.nombre;
    }
  }
  
  return 'Bronce'; // Por defecto
}

// Calcular puntos ganados considerando multiplicadores de nivel
export function calcularPuntosGanados(montoCompra, nivel = 'Bronce') {
  const config = cargarConfiguracion();
  const puntosBase = Math.floor(montoCompra * config.puntosPerPeso);
  
  // Buscar multiplicador del nivel
  let multiplicador = 1.0;
  for (const [id, nivelConfig] of Object.entries(config.niveles)) {
    if (nivelConfig.nombre === nivel) {
      multiplicador = nivelConfig.multiplicador;
      break;
    }
  }
  
  // Aplicar promociones si están activas
  if (config.promociones.habilitadas && estaEnHorarioPromocional()) {
    multiplicador *= 2; // Puntos dobles
  }
  
  return Math.floor(puntosBase * multiplicador);
}

// Verificar si estamos en horario promocional
function estaEnHorarioPromocional() {
  const config = cargarConfiguracion();
  
  if (!config.promociones.puntosDobles.activo) {
    return false;
  }
  
  const ahora = new Date();
  const diaSemana = ahora.getDay(); // 0 = domingo, 6 = sábado
  const horaActual = ahora.getHours() * 100 + ahora.getMinutes();
  
  // Verificar si es fin de semana (configurable)
  const esFinDeSemana = config.promociones.puntosDobles.diasSemana.includes(diaSemana);
  
  if (!esFinDeSemana) {
    return false;
  }
  
  // Convertir horas a formato numérico para comparar
  const [horaInicio] = config.promociones.puntosDobles.horaInicio.split(':').map(Number);
  const [horaFin] = config.promociones.puntosDobles.horaFin.split(':').map(Number);
  
  const inicioNum = horaInicio * 100;
  const finNum = horaFin * 100;
  
  return horaActual >= inicioNum && horaActual <= finNum;
}

// Validar formato de NFC ID según configuración
export function validarFormatoNFC(nfcId) {
  const config = cargarConfiguracion();
  
  if (!config.nfcConfig.validacionEstricta) {
    return true; // Validación deshabilitada
  }
  
  const patron = new RegExp(`^${config.nfcConfig.prefijo}[0-9]{${config.nfcConfig.longitudId - config.nfcConfig.prefijo.length}}$`);
  return patron.test(nfcId);
}

// Generar nuevo NFC ID según configuración
export function generarNuevoNFCId() {
  const config = cargarConfiguracion();
  const digitosNecesarios = config.nfcConfig.longitudId - config.nfcConfig.prefijo.length;
  
  let digitos = '';
  for (let i = 0; i < digitosNecesarios; i++) {
    digitos += Math.floor(Math.random() * 10);
  }
  
  return config.nfcConfig.prefijo + digitos;
}

// Validar email según configuración
export function validarEmail(email) {
  const config = cargarConfiguracion();
  
  if (!config.seguridad.validarEmail) {
    return true;
  }
  
  const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return patronEmail.test(email);
}

// Validar teléfono según configuración
export function validarTelefono(telefono) {
  const config = cargarConfiguracion();
  
  if (!config.seguridad.validarTelefono) {
    return true;
  }
  
  // Patrón básico para teléfonos colombianos (ajustar según necesidad)
  const patronTelefono = /^3[0-9]{9}$/;
  return patronTelefono.test(telefono.replace(/\s+/g, ''));
}

// Registrar log de transacción
export function registrarLog(transaccion) {
  const config = cargarConfiguracion();
  
  if (!config.seguridad.logTransacciones) {
    return;
  }
  
  try {
    const logs = JSON.parse(localStorage.getItem('restaurante_logs_nfc') || '[]');
    logs.push({
      ...transaccion,
      timestamp: new Date().toISOString(),
      ip: 'localhost', // En producción sería la IP real
      userAgent: navigator.userAgent
    });
    
    // Mantener solo los últimos 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('restaurante_logs_nfc', JSON.stringify(logs));
  } catch (error) {
    console.error('Error registrando log:', error);
  }
}

// Verificar si una tarjeta está bloqueada
export function esTarjetaBloqueada(nfcId) {
  const config = cargarConfiguracion();
  
  if (!config.seguridad.bloqueoTarjeta) {
    return false;
  }
  
  try {
    const bloqueos = JSON.parse(localStorage.getItem('restaurante_tarjetas_bloqueadas') || '{}');
    const bloqueo = bloqueos[nfcId];
    
    if (!bloqueo) {
      return false;
    }
    
    // Verificar si el bloqueo ha expirado
    const tiempoBloqueo = config.seguridad.tiempoBloqueo * 60 * 1000; // Convertir a milisegundos
    const tiempoExpiracion = new Date(bloqueo.fechaBloqueo).getTime() + tiempoBloqueo;
    
    if (Date.now() > tiempoExpiracion) {
      // Bloqueo expirado, remover
      delete bloqueos[nfcId];
      localStorage.setItem('restaurante_tarjetas_bloqueadas', JSON.stringify(bloqueos));
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verificando bloqueo:', error);
    return false;
  }
}

// Registrar intento fallido de lectura
export function registrarIntentoFallido(nfcId) {
  const config = cargarConfiguracion();
  
  if (!config.seguridad.bloqueoTarjeta) {
    return false;
  }
  
  try {
    const intentos = JSON.parse(localStorage.getItem('restaurante_intentos_fallidos') || '{}');
    
    if (!intentos[nfcId]) {
      intentos[nfcId] = { count: 0, ultimoIntento: Date.now() };
    }
    
    intentos[nfcId].count += 1;
    intentos[nfcId].ultimoIntento = Date.now();
    
    // Si excede el límite, bloquear tarjeta
    if (intentos[nfcId].count >= config.seguridad.intentosFallidosMax) {
      const bloqueos = JSON.parse(localStorage.getItem('restaurante_tarjetas_bloqueadas') || '{}');
      bloqueos[nfcId] = {
        fechaBloqueo: new Date().toISOString(),
        intentos: intentos[nfcId].count
      };
      localStorage.setItem('restaurante_tarjetas_bloqueadas', JSON.stringify(bloqueos));
      
      // Limpiar contador de intentos
      delete intentos[nfcId];
    }
    
    localStorage.setItem('restaurante_intentos_fallidos', JSON.stringify(intentos));
    return intentos[nfcId].count >= config.seguridad.intentosFallidosMax;
  } catch (error) {
    console.error('Error registrando intento fallido:', error);
    return false;
  }
}

// Obtener información de configuración para mostrar en UI
export function obtenerInfoConfiguracion() {
  const config = cargarConfiguracion();
  
  return {
    puntosPerPeso: config.puntosPerPeso,
    valorPunto: config.valorPunto,
    puntosMinimos: config.puntosMinimosCanjeables,
    bonusNuevos: config.bonificacionBienvenida,
    promocionesActivas: config.promociones.habilitadas,
    seguridadActiva: config.seguridad.bloqueoTarjeta,
    formatoNFC: `${config.nfcConfig.prefijo}${'#'.repeat(config.nfcConfig.longitudId - config.nfcConfig.prefijo.length)}`,
    tiempoLectura: config.nfcConfig.tiempoLectura
  };
}

export { CONFIGURACION_DEFECTO };