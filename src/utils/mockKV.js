// Mock API que simula Vercel KV pero funciona en el frontend
class MockKVAdapter {
  constructor() {
    this.storageKey = 'vercel_kv_mock';
    this.isConnected = true; // Simular conexión
  }

  // Obtener datos del localStorage con namespace
  getData(key) {
    const data = localStorage.getItem(`${this.storageKey}_${key}`);
    return data ? JSON.parse(data) : null;
  }

  // Guardar datos en localStorage con namespace
  setData(key, value) {
    localStorage.setItem(`${this.storageKey}_${key}`, JSON.stringify(value));
    return true;
  }

  // Inicializar datos por defecto
  async initializeData() {
    // Usuarios por defecto
    if (!this.getData('users')) {
      const defaultUsers = [
        {
          id: '1',
          username: 'admin',
          password: 'admin123',
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          username: 'mesero1',
          password: 'mesero123',
          role: 'mesero',
          createdAt: new Date().toISOString()
        }
      ];
      this.setData('users', defaultUsers);
    }

    // Clientes por defecto
    if (!this.getData('clientes')) {
      const defaultClientes = [
        {
          id: '1',
          nombre: 'Juan Pérez',
          tarjetaNFC: 'NFC001',
          puntos: 150,
          telefono: '+57 300 123 4567',
          email: 'juan@email.com',
          fechaRegistro: new Date().toISOString()
        },
        {
          id: '2',
          nombre: 'María García',
          tarjetaNFC: 'NFC002',
          puntos: 85,
          telefono: '+57 310 987 6543',
          email: 'maria@email.com',
          fechaRegistro: new Date().toISOString()
        }
      ];
      this.setData('clientes', defaultClientes);
    }

    // Transacciones por defecto
    if (!this.getData('transacciones')) {
      const defaultTransacciones = [
        {
          id: '1',
          clienteId: '1',
          tipo: 'acumular',
          puntos: 50,
          descripcion: 'Compra de almuerzo',
          fecha: new Date().toISOString(),
          usuario: 'mesero1'
        }
      ];
      this.setData('transacciones', defaultTransacciones);
    }

    // Configuración por defecto
    if (!this.getData('configuracion')) {
      const defaultConfig = {
        puntosCompra: 10,
        montoPunto: 1000,
        puntosRegalo: 100,
        limiteCanjeMin: 50,
        limiteCanjeMax: 1000,
        timeoutMinutos: 30,
        promociones: [
          {
            id: '1',
            nombre: 'Café Gratis',
            puntosRequeridos: 100,
            descripcion: 'Café americano gratis',
            activa: true
          }
        ]
      };
      this.setData('configuracion', defaultConfig);
    }

    console.log('✅ Mock KV data initialized');
  }

  // Simular verificación de salud
  async healthCheck() {
    return {
      status: 'ok',
      message: 'Mock KV API funcionando',
      timestamp: new Date().toISOString(),
      mode: 'mock_kv',
      kv_available: true
    };
  }

  // Simular login
  async login(username, password) {
    const users = this.getData('users') || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userData } = user;
    return {
      user: userData,
      token: `mock_jwt_${user.id}_${Date.now()}`
    };
  }
}

// Instancia global
const mockKV = new MockKVAdapter();

// Exportar para uso en el dataManager
export default mockKV;