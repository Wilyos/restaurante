// Mock API para gestión de clientes NFC y sistema de puntos
import { 
  cargarConfiguracion,
  determinarNivelCliente,
  calcularPuntosGanados,
  validarFormatoNFC,
  generarNuevoNFCId,
  validarEmail,
  validarTelefono,
  registrarLog,
  esTarjetaBloqueada,
  registrarIntentoFallido
} from '../utils/configuracionNFC';

const CLIENTES_NFC_KEY = 'restaurante_clientes_nfc';
const TRANSACCIONES_KEY = 'restaurante_transacciones_puntos';

// Clientes de ejemplo
const clientesDefault = [
  {
    id: 1,
    nfcId: 'NFC001234567890',
    nombre: 'Juan Pérez',
    email: 'juan.perez@email.com',
    telefono: '3001234567',
    puntos: 250,
    puntosAcumulados: 850, // Total histórico
    fechaRegistro: new Date('2024-01-15').toISOString(),
    ultimaVisita: new Date('2024-10-10').toISOString(),
    activo: true,
    nivel: 'Bronce' // Bronce, Plata, Oro, Diamante
  },
  {
    id: 2,
    nfcId: 'NFC098765432110',
    nombre: 'María García',
    email: 'maria.garcia@email.com',
    telefono: '3009876543',
    puntos: 540,
    puntosAcumulados: 1240,
    fechaRegistro: new Date('2024-02-20').toISOString(),
    ultimaVisita: new Date('2024-10-12').toISOString(),
    activo: true,
    nivel: 'Plata'
  },
  {
    id: 3,
    nfcId: 'NFC555666777888',
    nombre: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    telefono: '3005556666',
    puntos: 85,
    puntosAcumulados: 385,
    fechaRegistro: new Date('2024-03-10').toISOString(),
    ultimaVisita: new Date('2024-10-08').toISOString(),
    activo: true,
    nivel: 'Bronce'
  }
];

// Inicializar datos
function initClientesNFC() {
  const stored = localStorage.getItem(CLIENTES_NFC_KEY);
  if (!stored) {
    localStorage.setItem(CLIENTES_NFC_KEY, JSON.stringify(clientesDefault));
    return clientesDefault;
  }
  return JSON.parse(stored);
}

function initTransacciones() {
  const stored = localStorage.getItem(TRANSACCIONES_KEY);
  if (!stored) {
    const transaccionesDefault = [
      {
        id: 1,
        clienteId: 1,
        nfcId: 'NFC001234567890',
        tipo: 'acumulacion',
        puntos: 35,
        montoCompra: 35000,
        descripcion: 'Compra - Pedido #001',
        fecha: new Date('2024-10-10T14:30:00').toISOString()
      },
      {
        id: 2,
        clienteId: 2,
        nfcId: 'NFC098765432110',
        tipo: 'acumulacion',
        puntos: 28,
        montoCompra: 28000,
        descripcion: 'Compra - Pedido #002',
        fecha: new Date('2024-10-12T19:45:00').toISOString()
      }
    ];
    localStorage.setItem(TRANSACCIONES_KEY, JSON.stringify(transaccionesDefault));
    return transaccionesDefault;
  }
  return JSON.parse(stored);
}

// Función auxiliar para obtener configuración actual
function obtenerConfiguracion() {
  return cargarConfiguracion();
}

// CRUD Clientes NFC
export function getClientesNFC() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const clientes = initClientesNFC();
      resolve(clientes);
    }, 100);
  });
}

export function getClienteByNFC(nfcId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Verificar si la tarjeta está bloqueada
      if (esTarjetaBloqueada(nfcId)) {
        registrarLog({ accion: 'lectura_bloqueada', nfcId, error: 'Tarjeta bloqueada' });
        reject(new Error('Tarjeta NFC bloqueada temporalmente'));
        return;
      }

      const clientes = initClientesNFC();
      const cliente = clientes.find(c => c.nfcId === nfcId && c.activo);
      
      if (cliente) {
        registrarLog({ accion: 'lectura_exitosa', nfcId, clienteId: cliente.id });
        resolve(cliente);
      } else {
        registrarIntentoFallido(nfcId);
        registrarLog({ accion: 'lectura_fallida', nfcId, error: 'Tarjeta no registrada' });
        reject(new Error('Tarjeta NFC no registrada'));
      }
    }, 300);
  });
}

export function registrarClienteNFC(datosCliente) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const config = obtenerConfiguracion();
      const clientes = initClientesNFC();
      
      // Validar formato NFC
      if (!validarFormatoNFC(datosCliente.nfcId)) {
        reject(new Error('Formato de tarjeta NFC inválido'));
        return;
      }

      // Validar email
      if (!validarEmail(datosCliente.email)) {
        reject(new Error('Formato de email inválido'));
        return;
      }

      // Validar teléfono
      if (!validarTelefono(datosCliente.telefono)) {
        reject(new Error('Formato de teléfono inválido'));
        return;
      }

      // Verificar si ya existe el NFC ID
      const existeNFC = clientes.find(c => c.nfcId === datosCliente.nfcId);
      if (existeNFC) {
        reject(new Error('Esta tarjeta NFC ya está registrada'));
        return;
      }

      // Verificar email único
      const existeEmail = clientes.find(c => c.email.toLowerCase() === datosCliente.email.toLowerCase());
      if (existeEmail) {
        reject(new Error('Este email ya está registrado'));
        return;
      }

      const nuevoCliente = {
        id: Math.max(...clientes.map(c => c.id), 0) + 1,
        nfcId: datosCliente.nfcId,
        nombre: datosCliente.nombre.trim(),
        email: datosCliente.email.trim().toLowerCase(),
        telefono: datosCliente.telefono.trim(),
        puntos: config.bonificacionBienvenida,
        puntosAcumulados: config.bonificacionBienvenida,
        fechaRegistro: new Date().toISOString(),
        ultimaVisita: new Date().toISOString(),
        activo: true,
        nivel: determinarNivelCliente(config.bonificacionBienvenida)
      };

      clientes.push(nuevoCliente);
      localStorage.setItem(CLIENTES_NFC_KEY, JSON.stringify(clientes));

      // Registrar transacción de bienvenida
      if (config.bonificacionBienvenida > 0) {
        registrarTransaccion({
          clienteId: nuevoCliente.id,
          nfcId: nuevoCliente.nfcId,
          tipo: 'bonificacion',
          puntos: config.bonificacionBienvenida,
          descripcion: 'Bonificación de bienvenida'
        });
      }

      registrarLog({ 
        accion: 'registro_cliente', 
        clienteId: nuevoCliente.id, 
        nfcId: nuevoCliente.nfcId 
      });

      resolve(nuevoCliente);
    }, 300);
  });
}

export function actualizarClienteNFC(id, datosCliente) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const clientes = initClientesNFC();
      const index = clientes.findIndex(c => c.id === id);
      
      if (index === -1) {
        reject(new Error('Cliente no encontrado'));
        return;
      }

      // Verificar email único (excluyendo el cliente actual)
      const existeEmail = clientes.find(c => 
        c.id !== id && c.email.toLowerCase() === datosCliente.email.toLowerCase()
      );
      if (existeEmail) {
        reject(new Error('Este email ya está registrado'));
        return;
      }

      clientes[index] = {
        ...clientes[index],
        nombre: datosCliente.nombre.trim(),
        email: datosCliente.email.trim().toLowerCase(),
        telefono: datosCliente.telefono.trim(),
        activo: datosCliente.activo !== undefined ? datosCliente.activo : clientes[index].activo
      };

      localStorage.setItem(CLIENTES_NFC_KEY, JSON.stringify(clientes));
      resolve(clientes[index]);
    }, 200);
  });
}

// Sistema de Puntos
export function acumularPuntos(nfcId, montoCompra, descripcion = 'Compra') {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const config = obtenerConfiguracion();
      const clientes = initClientesNFC();
      const clienteIndex = clientes.findIndex(c => c.nfcId === nfcId && c.activo);
      
      if (clienteIndex === -1) {
        reject(new Error('Cliente no encontrado'));
        return;
      }

      const cliente = clientes[clienteIndex];
      const puntosGanados = calcularPuntosGanados(montoCompra, cliente.nivel);
      
      // Actualizar cliente
      clientes[clienteIndex].puntos += puntosGanados;
      clientes[clienteIndex].puntosAcumulados += puntosGanados;
      clientes[clienteIndex].ultimaVisita = new Date().toISOString();
      clientes[clienteIndex].nivel = determinarNivelCliente(clientes[clienteIndex].puntosAcumulados);

      localStorage.setItem(CLIENTES_NFC_KEY, JSON.stringify(clientes));

      // Registrar transacción
      const transaccion = {
        clienteId: clientes[clienteIndex].id,
        nfcId: nfcId,
        tipo: 'acumulacion',
        puntos: puntosGanados,
        montoCompra: montoCompra,
        descripcion: descripcion
      };
      
      registrarTransaccion(transaccion);
      registrarLog({ 
        accion: 'acumulacion_puntos', 
        clienteId: cliente.id, 
        nfcId, 
        puntos: puntosGanados, 
        monto: montoCompra 
      });

      resolve({
        cliente: clientes[clienteIndex],
        puntosGanados: puntosGanados,
        transaccion: transaccion
      });
    }, 300);
  });
}

export function canjearPuntos(nfcId, puntosACanjear) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const config = obtenerConfiguracion();
      const clientes = initClientesNFC();
      const clienteIndex = clientes.findIndex(c => c.nfcId === nfcId && c.activo);
      
      if (clienteIndex === -1) {
        reject(new Error('Cliente no encontrado'));
        return;
      }

      const cliente = clientes[clienteIndex];

      if (puntosACanjear < config.puntosMinimosCanjeables) {
        reject(new Error(`Mínimo ${config.puntosMinimosCanjeables} puntos para canjear`));
        return;
      }

      if (cliente.puntos < puntosACanjear) {
        reject(new Error('Puntos insuficientes'));
        return;
      }

      const descuento = puntosACanjear * config.valorPunto;
      
      // Actualizar cliente
      clientes[clienteIndex].puntos -= puntosACanjear;
      clientes[clienteIndex].ultimaVisita = new Date().toISOString();

      localStorage.setItem(CLIENTES_NFC_KEY, JSON.stringify(clientes));

      // Registrar transacción
      const transaccion = {
        clienteId: cliente.id,
        nfcId: nfcId,
        tipo: 'canje',
        puntos: -puntosACanjear,
        descripcion: `Canje de puntos - Descuento $${descuento.toLocaleString()}`
      };
      
      registrarTransaccion(transaccion);
      registrarLog({ 
        accion: 'canje_puntos', 
        clienteId: cliente.id, 
        nfcId, 
        puntos: puntosACanjear, 
        descuento 
      });

      resolve({
        cliente: clientes[clienteIndex],
        puntosCanjeados: puntosACanjear,
        descuento: descuento,
        transaccion: transaccion
      });
    }, 300);
  });
}

// Transacciones
function registrarTransaccion(transaccionData) {
  const transacciones = initTransacciones();
  const nuevaTransaccion = {
    id: Math.max(...transacciones.map(t => t.id), 0) + 1,
    ...transaccionData,
    fecha: new Date().toISOString()
  };
  
  transacciones.push(nuevaTransaccion);
  localStorage.setItem(TRANSACCIONES_KEY, JSON.stringify(transacciones));
  return nuevaTransaccion;
}

export function getTransaccionesPorCliente(clienteId, limit = 20) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const transacciones = initTransacciones();
      const transaccionesCliente = transacciones
        .filter(t => t.clienteId === clienteId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, limit);
      
      resolve(transaccionesCliente);
    }, 100);
  });
}

export function getTodasLasTransacciones(limit = 50) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const transacciones = initTransacciones();
      const transaccionesOrdenadas = transacciones
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, limit);
      
      resolve(transaccionesOrdenadas);
    }, 100);
  });
}

// Configuración y estadísticas
export function getConfiguracionPuntos() {
  const config = obtenerConfiguracion();
  return Promise.resolve({
    puntosPerPeso: config.puntosPerPeso,
    valorPunto: config.valorPunto,
    puntosMinimosCanjeables: config.puntosMinimosCanjeables,
    bonificacionBienvenida: config.bonificacionBienvenida
  });
}

export function getEstadisticas() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const clientes = initClientesNFC();
      const transacciones = initTransacciones();
      
      const stats = {
        totalClientes: clientes.filter(c => c.activo).length,
        puntosEnCirculacion: clientes.reduce((sum, c) => sum + c.puntos, 0),
        puntosAcumuladosTotal: clientes.reduce((sum, c) => sum + c.puntosAcumulados, 0),
        transaccionesHoy: transacciones.filter(t => {
          const hoy = new Date();
          const fechaTransaccion = new Date(t.fecha);
          return fechaTransaccion.toDateString() === hoy.toDateString();
        }).length,
        clientesPorNivel: {
          Bronce: clientes.filter(c => c.nivel === 'Bronce' && c.activo).length,
          Plata: clientes.filter(c => c.nivel === 'Plata' && c.activo).length,
          Oro: clientes.filter(c => c.nivel === 'Oro' && c.activo).length,
          Diamante: clientes.filter(c => c.nivel === 'Diamante' && c.activo).length
        }
      };
      
      resolve(stats);
    }, 200);
  });
}

// Simulador de lector NFC
export function simularLecturaNFC() {
  return new Promise((resolve, reject) => {
    const config = obtenerConfiguracion();
    
    setTimeout(() => {
      // Simular diferentes escenarios con tarjetas registradas y algunas nuevas
      const scenarios = [
        { success: true, nfcId: 'NFC001234567890' }, // Juan Pérez
        { success: true, nfcId: 'NFC098765432110' }, // María García  
        { success: true, nfcId: 'NFC555666777888' }, // Carlos Rodríguez
        { success: true, nfcId: generarNuevoNFCId() }, // Nueva tarjeta
        { success: false, error: 'Error de lectura NFC' }
      ];
      
      const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      
      if (scenario.success) {
        registrarLog({ accion: 'simulacion_lectura', nfcId: scenario.nfcId, resultado: 'exitoso' });
        resolve({ nfcId: scenario.nfcId });
      } else {
        registrarLog({ accion: 'simulacion_lectura', resultado: 'fallido', error: scenario.error });
        reject(new Error(scenario.error));
      }
    }, config.nfcConfig.tiempoLectura); // Usar tiempo configurado
  });
}

// Validar formato NFC ID (usando configuración)
export function validarNFCId(nfcId) {
  return validarFormatoNFC(nfcId);
}

// Reset para desarrollo
export function resetSistemaPuntos() {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(CLIENTES_NFC_KEY, JSON.stringify(clientesDefault));
      localStorage.setItem(TRANSACCIONES_KEY, JSON.stringify([]));
      resolve(true);
    }, 100);
  });
}