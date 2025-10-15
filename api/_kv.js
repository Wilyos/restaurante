// Adaptador para Vercel KV con fallback a memoria
import { kv } from '@vercel/kv';

// Fallback en memoria para desarrollo local
let memoryStore = {};

// Detectar si estamos en Vercel (producción) o local (desarrollo)
const isProduction = process.env.VERCEL_ENV === 'production';
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;

console.log('🔧 KV Adapter initialized:', { isProduction, isVercel });

// Funciones del adaptador KV
export const kvGet = async (key) => {
  try {
    if (isVercel) {
      const result = await kv.get(key);
      console.log(`📖 KV GET ${key}:`, result ? 'found' : 'not found');
      return result;
    } else {
      // Modo desarrollo - usar memoria
      console.log(`📖 Memory GET ${key}:`, memoryStore[key] ? 'found' : 'not found');
      return memoryStore[key] || null;
    }
  } catch (error) {
    console.error(`❌ Error getting ${key}:`, error);
    return null;
  }
};

export const kvSet = async (key, value) => {
  try {
    if (isVercel) {
      await kv.set(key, value);
      console.log(`💾 KV SET ${key}: saved`);
    } else {
      // Modo desarrollo - usar memoria
      memoryStore[key] = value;
      console.log(`💾 Memory SET ${key}: saved`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Error setting ${key}:`, error);
    return false;
  }
};

export const kvDel = async (key) => {
  try {
    if (isVercel) {
      await kv.del(key);
      console.log(`🗑️ KV DEL ${key}: deleted`);
    } else {
      // Modo desarrollo - usar memoria
      delete memoryStore[key];
      console.log(`🗑️ Memory DEL ${key}: deleted`);
    }
    return true;
  } catch (error) {
    console.error(`❌ Error deleting ${key}:`, error);
    return false;
  }
};

export const kvGetAll = async (pattern) => {
  try {
    if (isVercel) {
      const keys = await kv.keys(pattern);
      const results = {};
      
      for (const key of keys) {
        results[key] = await kv.get(key);
      }
      
      console.log(`📚 KV GET ALL ${pattern}: ${keys.length} items`);
      return results;
    } else {
      // Modo desarrollo - buscar en memoria
      const regex = new RegExp(pattern.replace('*', '.*'));
      const results = {};
      
      Object.keys(memoryStore).forEach(key => {
        if (regex.test(key)) {
          results[key] = memoryStore[key];
        }
      });
      
      console.log(`📚 Memory GET ALL ${pattern}: ${Object.keys(results).length} items`);
      return results;
    }
  } catch (error) {
    console.error(`❌ Error getting all ${pattern}:`, error);
    return {};
  }
};

// Inicializar datos por defecto
export const initializeDefaultData = async () => {
  console.log('🚀 Initializing default data...');
  
  // Verificar si ya existen datos
  const existingUsers = await kvGet('users');
  
  if (!existingUsers) {
    console.log('📝 Creating default data...');
    
    // Usuarios por defecto
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
    
    // Clientes por defecto
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
    
    // Transacciones por defecto
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
    
    // Configuración por defecto
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
    
    // Guardar datos por defecto
    await kvSet('users', defaultUsers);
    await kvSet('clientes', defaultClientes);
    await kvSet('transacciones', defaultTransacciones);
    await kvSet('configuracion', defaultConfig);
    
    console.log('✅ Default data initialized successfully');
  } else {
    console.log('📊 Data already exists, skipping initialization');
  }
};