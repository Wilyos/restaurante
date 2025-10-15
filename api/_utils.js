// Utilidades para las funciones serverless de Vercel
import { kvGet, kvSet, initializeDefaultData } from './_kv.js';

// Configuración de CORS
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true'
};

// Manejar preflight OPTIONS requests
export const handleCors = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return true;
  }
  
  // Agregar headers CORS a todas las respuestas
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  return false;
};

// Simulación de base de datos en memoria (para desarrollo)
// En producción, usar Vercel KV, MongoDB Atlas, o Supabase
let memoryDB = {
  users: [
    {
      id: '1',
      username: 'admin',
      password: 'admin123', // En producción, usar bcrypt
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
  ],
  clientes: [
    {
      id: '1',
      nombre: 'Juan Pérez',
      tarjetaNFC: 'NFC001',
      puntos: 150,
      telefono: '+57 300 123 4567',
      email: 'juan@email.com',
      fechaRegistro: new Date().toISOString()
    }
  ],
  transacciones: [
    {
      id: '1',
      clienteId: '1',
      tipo: 'acumular',
      puntos: 50,
      descripcion: 'Compra de almuerzo',
      fecha: new Date().toISOString(),
      usuario: 'mesero1'
    }
  ],
  configuracion: {
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
  }
};

// Funciones de utilidad para KV Database
export const getCollection = async (collection) => {
  // Inicializar datos por defecto si es la primera vez
  await initializeDefaultData();
  
  const data = await kvGet(collection);
  return data || [];
};

export const setCollection = async (collection, data) => {
  await kvSet(collection, data);
  return data;
};

export const addToCollection = async (collection, item) => {
  const currentData = await getCollection(collection);
  const updatedData = Array.isArray(currentData) ? [...currentData, item] : [item];
  await setCollection(collection, updatedData);
  return item;
};

export const updateInCollection = async (collection, id, updates) => {
  const items = await getCollection(collection);
  if (!Array.isArray(items)) return null;
  
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    items[index] = { ...items[index], ...updates };
    await setCollection(collection, items);
    return items[index];
  }
  return null;
};

export const deleteFromCollection = async (collection, id) => {
  const items = await getCollection(collection);
  if (!Array.isArray(items)) return null;
  
  const index = items.findIndex(item => item.id === id);
  if (index !== -1) {
    const deletedItem = items.splice(index, 1)[0];
    await setCollection(collection, items);
    return deletedItem;
  }
  return null;
};

// Generar ID único
export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Respuesta estándar de la API
export const apiResponse = (res, data, status = 200) => {
  res.status(status).json({
    success: status < 400,
    data,
    timestamp: new Date().toISOString()
  });
};