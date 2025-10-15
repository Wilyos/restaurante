// Simulador de escritura y lectura de datos en tarjetas NFC
// En un entorno real, esto se conectaría con hardware NFC físico

// Estructura de datos que se almacena en la tarjeta
const ESTRUCTURA_TARJETA_NFC = {
  version: '1.0',
  tipoTarjeta: 'RESTAURANTE_PUNTOS',
  datos: {
    clienteId: null,
    nombre: '',
    puntos: 0,
    nivel: 'Bronce',
    fechaUltimaActualizacion: null,
    checksum: '' // Para validar integridad
  }
};

// Simulador de memoria NFC (en producción sería la tarjeta física)
const MEMORIA_NFC_SIMULADA = new Map();

/**
 * Simula la escritura de datos en una tarjeta NFC
 * @param {string} nfcId - ID de la tarjeta NFC
 * @param {object} datos - Datos a escribir en la tarjeta
 * @returns {Promise} - Resultado de la operación
 */
export function escribirDatosEnTarjeta(nfcId, datos) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validar que la tarjeta esté presente
        if (!nfcId || !validarFormatoNFC(nfcId)) {
          reject(new Error('Tarjeta NFC no válida o no detectada'));
          return;
        }

        // Crear estructura completa de datos
        const datosCompletos = {
          ...ESTRUCTURA_TARJETA_NFC,
          datos: {
            ...ESTRUCTURA_TARJETA_NFC.datos,
            ...datos,
            fechaUltimaActualizacion: new Date().toISOString()
          }
        };

        // Calcular checksum para validar integridad
        datosCompletos.datos.checksum = calcularChecksum(datosCompletos.datos);

        // Verificar límite de memoria (tarjetas NFC típicamente 4KB-8KB)
        const tamanoDatos = JSON.stringify(datosCompletos).length;
        if (tamanoDatos > 4096) { // 4KB límite simulado
          reject(new Error('Datos demasiado grandes para la tarjeta NFC'));
          return;
        }

        // Simular escritura en tarjeta
        MEMORIA_NFC_SIMULADA.set(nfcId, datosCompletos);
        
        registrarLog({
          accion: 'escritura_nfc',
          nfcId,
          tamano: tamanoDatos,
          exito: true
        });

        resolve({
          exito: true,
          nfcId,
          datosEscritos: datosCompletos,
          tamanoDatos,
          espacioRestante: 4096 - tamanoDatos
        });

      } catch (error) {
        registrarLog({
          accion: 'escritura_nfc',
          nfcId,
          error: error.message,
          exito: false
        });
        reject(new Error(`Error escribiendo en tarjeta: ${error.message}`));
      }
    }, 800); // Simular tiempo de escritura
  });
}

/**
 * Simula la lectura de datos desde una tarjeta NFC
 * @param {string} nfcId - ID de la tarjeta NFC
 * @returns {Promise} - Datos leídos de la tarjeta
 */
export function leerDatosDeTarjeta(nfcId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Validar que la tarjeta esté presente
        if (!nfcId || !validarFormatoNFC(nfcId)) {
          reject(new Error('Tarjeta NFC no válida o no detectada'));
          return;
        }

        // Leer datos de la tarjeta simulada
        const datosEnTarjeta = MEMORIA_NFC_SIMULADA.get(nfcId);

        if (!datosEnTarjeta) {
          // Tarjeta vacía o no inicializada
          resolve({
            tarjetaVacia: true,
            nfcId,
            mensaje: 'Tarjeta NFC vacía - lista para programar'
          });
          return;
        }

        // Validar integridad de datos
        const checksumCalculado = calcularChecksum(datosEnTarjeta.datos);
        if (checksumCalculado !== datosEnTarjeta.datos.checksum) {
          reject(new Error('Datos corruptos en la tarjeta NFC'));
          return;
        }

        // Validar versión de datos
        if (datosEnTarjeta.version !== ESTRUCTURA_TARJETA_NFC.version) {
          reject(new Error(`Versión de tarjeta no compatible: ${datosEnTarjeta.version}`));
          return;
        }

        registrarLog({
          accion: 'lectura_nfc',
          nfcId,
          clienteId: datosEnTarjeta.datos.clienteId,
          exito: true
        });

        resolve({
          exito: true,
          nfcId,
          datos: datosEnTarjeta.datos,
          version: datosEnTarjeta.version,
          tipoTarjeta: datosEnTarjeta.tipoTarjeta
        });

      } catch (error) {
        registrarLog({
          accion: 'lectura_nfc',
          nfcId,
          error: error.message,
          exito: false
        });
        reject(new Error(`Error leyendo tarjeta: ${error.message}`));
      }
    }, 600); // Simular tiempo de lectura
  });
}

/**
 * Inicializa una tarjeta NFC nueva con datos básicos
 * @param {string} nfcId - ID de la tarjeta NFC
 * @param {object} datosCliente - Datos básicos del cliente
 * @returns {Promise} - Resultado de la inicialización
 */
export function inicializarTarjetaNFC(nfcId, datosCliente) {
  return new Promise(async (resolve, reject) => {
    try {
      const config = cargarConfiguracion();
      
      const datosIniciales = {
        clienteId: datosCliente.id,
        nombre: datosCliente.nombre,
        puntos: config.bonificacionBienvenida,
        nivel: 'Bronce',
        email: datosCliente.email, // Datos adicionales
        telefono: datosCliente.telefono,
        fechaRegistro: new Date().toISOString()
      };

      const resultado = await escribirDatosEnTarjeta(nfcId, datosIniciales);
      
      resolve({
        ...resultado,
        mensaje: 'Tarjeta NFC inicializada correctamente',
        datosCliente: datosIniciales
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Actualiza solo los puntos en la tarjeta (operación rápida)
 * @param {string} nfcId - ID de la tarjeta NFC
 * @param {number} nuevosPuntos - Nueva cantidad de puntos
 * @param {string} nuevoNivel - Nuevo nivel del cliente
 * @returns {Promise} - Resultado de la actualización
 */
export function actualizarPuntosEnTarjeta(nfcId, nuevosPuntos, nuevoNivel) {
  return new Promise(async (resolve, reject) => {
    try {
      // Leer datos actuales
      const lecturaActual = await leerDatosDeTarjeta(nfcId);
      
      if (lecturaActual.tarjetaVacia) {
        reject(new Error('No se puede actualizar una tarjeta vacía'));
        return;
      }

      // Actualizar solo puntos y nivel
      const datosActualizados = {
        ...lecturaActual.datos,
        puntos: nuevosPuntos,
        nivel: nuevoNivel,
        fechaUltimaActualizacion: new Date().toISOString()
      };

      const resultado = await escribirDatosEnTarjeta(nfcId, datosActualizados);
      
      resolve({
        ...resultado,
        mensaje: 'Puntos actualizados en la tarjeta',
        puntosAnteriores: lecturaActual.datos.puntos,
        puntosNuevos: nuevosPuntos
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Verifica el estado de una tarjeta NFC
 * @param {string} nfcId - ID de la tarjeta NFC
 * @returns {Promise} - Estado de la tarjeta
 */
export function verificarEstadoTarjeta(nfcId) {
  return new Promise(async (resolve, reject) => {
    try {
      const lectura = await leerDatosDeTarjeta(nfcId);
      
      if (lectura.tarjetaVacia) {
        resolve({
          estado: 'vacia',
          mensaje: 'Tarjeta lista para programar',
          nfcId
        });
        return;
      }

      const datos = lectura.datos;
      const ahora = new Date();
      const ultimaActualizacion = new Date(datos.fechaUltimaActualizacion);
      const diasSinUso = Math.floor((ahora - ultimaActualizacion) / (1000 * 60 * 60 * 24));

      let estado = 'activa';
      let mensaje = 'Tarjeta funcionando correctamente';

      if (diasSinUso > 365) {
        estado = 'inactiva';
        mensaje = `Sin uso por ${diasSinUso} días - considere reactivar`;
      } else if (diasSinUso > 90) {
        estado = 'poco_uso';
        mensaje = `Poco uso reciente (${diasSinUso} días)`;
      }

      resolve({
        estado,
        mensaje,
        nfcId,
        datos: {
          cliente: datos.nombre,
          puntos: datos.puntos,
          nivel: datos.nivel,
          ultimaActualizacion: datos.fechaUltimaActualizacion,
          diasSinUso
        }
      });

    } catch (error) {
      resolve({
        estado: 'error',
        mensaje: error.message,
        nfcId
      });
    }
  });
}

/**
 * Borra completamente los datos de una tarjeta NFC
 * @param {string} nfcId - ID de la tarjeta NFC
 * @returns {Promise} - Resultado del borrado
 */
export function borrarTarjetaNFC(nfcId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        if (MEMORIA_NFC_SIMULADA.has(nfcId)) {
          MEMORIA_NFC_SIMULADA.delete(nfcId);
          
          registrarLog({
            accion: 'borrado_nfc',
            nfcId,
            exito: true
          });

          resolve({
            exito: true,
            mensaje: 'Tarjeta NFC borrada completamente',
            nfcId
          });
        } else {
          resolve({
            exito: true,
            mensaje: 'Tarjeta ya estaba vacía',
            nfcId
          });
        }
      } catch (error) {
        reject(new Error(`Error borrando tarjeta: ${error.message}`));
      }
    }, 500);
  });
}

/**
 * Obtiene información técnica de la tarjeta
 * @param {string} nfcId - ID de la tarjeta NFC
 * @returns {Promise} - Información técnica
 */
export function obtenerInfoTecnicaTarjeta(nfcId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const datos = MEMORIA_NFC_SIMULADA.get(nfcId);
      const tamano = datos ? JSON.stringify(datos).length : 0;
      
      resolve({
        nfcId,
        tieneCreditos: !!datos,
        tamanoPuntos: tamano,
        espacioTotal: 4096,
        espacioUsado: tamano,
        espacioLibre: 4096 - tamano,
        porcentajeUso: Math.round((tamano / 4096) * 100),
        ultimaEscritura: datos?.datos?.fechaUltimaActualizacion || null,
        version: datos?.version || null,
        checksum: datos?.datos?.checksum || null
      });
    }, 300);
  });
}

// Funciones auxiliares

function calcularChecksum(datos) {
  // Crear checksum simple para validar integridad
  const str = JSON.stringify(datos).replace(/"checksum":"[^"]*"/, '"checksum":""');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convertir a 32bit integer
  }
  return Math.abs(hash).toString(16);
}

// Importar funciones necesarias
import { cargarConfiguracion } from './configuracionNFC';
import { validarFormatoNFC } from './configuracionNFC';
import { registrarLog } from './configuracionNFC';

// Exportar funciones para uso en el sistema
export {
  ESTRUCTURA_TARJETA_NFC,
  calcularChecksum
};