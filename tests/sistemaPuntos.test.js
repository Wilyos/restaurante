import { describe, it, expect, beforeEach } from 'vitest';
import {
  getClientesNFC,
  registrarClienteNFC,
  acumularPuntos,
  canjearPuntos,
  getClienteByNFC,
  getEstadisticas,
  simularLecturaNFC,
  validarNFCId,
  resetSistemaPuntos
} from '../src/api/mockClientesNFC';

describe('Sistema de Puntos NFC', () => {
  beforeEach(async () => {
    // Resetear el sistema antes de cada test
    await resetSistemaPuntos();
  });

  describe('Gestión de Clientes NFC', () => {
    it('debe obtener la lista de clientes', async () => {
      const clientes = await getClientesNFC();
      expect(Array.isArray(clientes)).toBe(true);
      expect(clientes.length).toBeGreaterThan(0);
    });

    it('debe registrar un nuevo cliente', async () => {
      const nuevoCliente = {
        nfcId: 'NFC123456789012',
        nombre: 'Test Usuario',
        email: 'test@test.com',
        telefono: '3001234567'
      };

      const clienteRegistrado = await registrarClienteNFC(nuevoCliente);
      
      expect(clienteRegistrado.nombre).toBe(nuevoCliente.nombre);
      expect(clienteRegistrado.email).toBe(nuevoCliente.email.toLowerCase());
      expect(clienteRegistrado.puntos).toBe(50); // Bonificación de bienvenida
      expect(clienteRegistrado.nivel).toBe('Bronce');
    });

    it('no debe permitir registrar un NFC ID duplicado', async () => {
      const cliente1 = {
        nfcId: 'NFC123456789012',
        nombre: 'Cliente 1',
        email: 'cliente1@test.com',
        telefono: '3001234567'
      };

      const cliente2 = {
        nfcId: 'NFC123456789012', // Mismo NFC ID
        nombre: 'Cliente 2',
        email: 'cliente2@test.com',
        telefono: '3001234568'
      };

      await registrarClienteNFC(cliente1);
      
      await expect(registrarClienteNFC(cliente2)).rejects.toThrow('Esta tarjeta NFC ya está registrada');
    });

    it('debe buscar cliente por NFC ID', async () => {
      const clientes = await getClientesNFC();
      const primerCliente = clientes[0];
      
      const clienteEncontrado = await getClienteByNFC(primerCliente.nfcId);
      expect(clienteEncontrado.id).toBe(primerCliente.id);
      expect(clienteEncontrado.nfcId).toBe(primerCliente.nfcId);
    });
  });

  describe('Sistema de Puntos', () => {
    it('debe acumular puntos correctamente', async () => {
      const clientes = await getClientesNFC();
      const cliente = clientes[0];
      const puntosIniciales = cliente.puntos;
      const montoCompra = 25000; // $25,000

      const resultado = await acumularPuntos(cliente.nfcId, montoCompra, 'Test compra');
      
      expect(resultado.puntosGanados).toBe(25000); // 1 punto por peso
      expect(resultado.cliente.puntos).toBe(puntosIniciales + 25000);
      expect(resultado.cliente.puntosAcumulados).toBe(cliente.puntosAcumulados + 25000);
    });

    it('debe canjear puntos correctamente', async () => {
      const clientes = await getClientesNFC();
      const cliente = clientes[0];
      const puntosIniciales = cliente.puntos;
      const puntosACanjear = 150;

      // Asegurarse de que el cliente tiene suficientes puntos
      if (puntosIniciales < puntosACanjear) {
        await acumularPuntos(cliente.nfcId, puntosACanjear, 'Preparar para canje');
      }

      const resultado = await canjearPuntos(cliente.nfcId, puntosACanjear);
      
      expect(resultado.puntosCanjeados).toBe(puntosACanjear);
      expect(resultado.descuento).toBe(puntosACanjear * 1); // 1 peso por punto
    });

    it('no debe permitir canjear puntos insuficientes', async () => {
      const clientes = await getClientesNFC();
      const cliente = clientes[0];
      const puntosExcesivos = cliente.puntos + 1000;

      await expect(canjearPuntos(cliente.nfcId, puntosExcesivos)).rejects.toThrow('Puntos insuficientes');
    });

    it('no debe permitir canjear menos del mínimo', async () => {
      const clientes = await getClientesNFC();
      const cliente = clientes[0];

      await expect(canjearPuntos(cliente.nfcId, 50)).rejects.toThrow('Mínimo 100 puntos para canjear');
    });
  });

  describe('Estadísticas', () => {
    it('debe generar estadísticas correctas', async () => {
      const stats = await getEstadisticas();
      
      expect(typeof stats.totalClientes).toBe('number');
      expect(typeof stats.puntosEnCirculacion).toBe('number');
      expect(typeof stats.puntosAcumuladosTotal).toBe('number');
      expect(typeof stats.transaccionesHoy).toBe('number');
      expect(typeof stats.clientesPorNivel).toBe('object');
      
      // Verificar que tiene todos los niveles
      expect(stats.clientesPorNivel.Bronce).toBeDefined();
      expect(stats.clientesPorNivel.Plata).toBeDefined();
      expect(stats.clientesPorNivel.Oro).toBeDefined();
      expect(stats.clientesPorNivel.Diamante).toBeDefined();
    });
  });

  describe('Simulador NFC', () => {
    it('debe simular lectura NFC', async () => {
      // Intentar hasta 3 veces en caso de error aleatorio del simulador
      let intentos = 0;
      let resultado = null;
      
      while (intentos < 3) {
        try {
          resultado = await simularLecturaNFC();
          break;
        } catch (error) {
          intentos++;
          if (intentos >= 3) throw error;
        }
      }
      
      expect(resultado.nfcId).toMatch(/^NFC[0-9]{12}$/);
    });

    it('debe validar formato NFC ID', () => {
      expect(validarNFCId('NFC123456789012')).toBe(true);
      expect(validarNFCId('NFC12345678901')).toBe(false); // Muy corto
      expect(validarNFCId('XYZ123456789012')).toBe(false); // No empieza con NFC
      expect(validarNFCId('NFC12345678901A')).toBe(false); // Contiene letras
    });
  });

  describe('Niveles de Cliente', () => {
    it('debe asignar nivel correcto según puntos acumulados', async () => {
      const cliente = {
        nfcId: 'NFC999888777666',
        nombre: 'Cliente Nivel',
        email: 'nivel@test.com',
        telefono: '3001234567'
      };

      // Registrar cliente (nivel Bronce inicial)
      const clienteRegistrado = await registrarClienteNFC(cliente);
      expect(clienteRegistrado.nivel).toBe('Bronce');

      // Acumular puntos para llegar a Plata (500 puntos acumulados total)
      // El cliente ya tiene 50 de bienvenida, necesita 450 más
      await acumularPuntos(cliente.nfcId, 450, 'Compra para Plata');
      const clientePlata = await getClienteByNFC(cliente.nfcId);
      expect(clientePlata.nivel).toBe('Plata');

      // Acumular más puntos para llegar a Oro (1000 puntos acumulados total)
      // Necesita 500 más (ya tiene 500)
      await acumularPuntos(cliente.nfcId, 500, 'Compra para Oro');
      const clienteOro = await getClienteByNFC(cliente.nfcId);
      expect(clienteOro.nivel).toBe('Oro');

      // Acumular más puntos para llegar a Diamante (2000 puntos acumulados total)
      // Necesita 1000 más (ya tiene 1000)
      await acumularPuntos(cliente.nfcId, 1000, 'Compra para Diamante');
      const clienteDiamante = await getClienteByNFC(cliente.nfcId);
      expect(clienteDiamante.nivel).toBe('Diamante');
    });
  });
});