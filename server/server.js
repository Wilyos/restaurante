import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas de datos
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CLIENTES_FILE = path.join(DATA_DIR, 'clientes.json');
const TRANSACCIONES_FILE = path.join(DATA_DIR, 'transacciones.json');
const CONFIG_FILE = path.join(DATA_DIR, 'configuracion.json');

// Asegurar que el directorio de datos existe
await fs.ensureDir(DATA_DIR);

// Inicializar archivos si no existen
const initializeFiles = async () => {
  // Usuarios por defecto
  const defaultUsers = [
    {
      id: 1,
      username: 'admin',
      password: 'admin123',
      name: 'Administrador',
      email: 'admin@restaurante.com',
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      username: 'mesero',
      password: 'mesero123',
      name: 'Juan Mesero',
      email: 'mesero@restaurante.com',
      role: 'mesero',
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      username: 'caja',
      password: 'caja123',
      name: 'Ana Cajera',
      email: 'caja@restaurante.com',
      role: 'caja',
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      username: 'cocina',
      password: 'cocina123',
      name: 'Carlos Cocinero',
      email: 'cocina@restaurante.com',
      role: 'cocina',
      createdAt: new Date().toISOString()
    }
  ];

  // Clientes NFC por defecto
  const defaultClientes = [
    {
      id: 1,
      nfcId: 'NFC_001',
      nombre: 'María García',
      email: 'maria.garcia@email.com',
      telefono: '555-0101',
      puntos: 150,
      nivel: 'Bronce',
      fechaRegistro: new Date().toISOString(),
      ultimaVisita: new Date().toISOString()
    },
    {
      id: 2,
      nfcId: 'NFC_002',
      nombre: 'Carlos López',
      email: 'carlos.lopez@email.com',
      telefono: '555-0102',
      puntos: 325,
      nivel: 'Plata',
      fechaRegistro: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      ultimaVisita: new Date().toISOString()
    }
  ];

  // Configuración por defecto
  const defaultConfig = {
    puntosPorPeso: 1,
    valorPunto: 1,
    minimoParaCanje: 100,
    bonificacionBienvenida: 50,
    niveles: [
      { nombre: 'Bronce', minPuntos: 0, multiplicador: 1.0, color: '#cd7f32' },
      { nombre: 'Plata', minPuntos: 200, multiplicador: 1.2, color: '#c0c0c0' },
      { nombre: 'Oro', minPuntos: 500, multiplicador: 1.5, color: '#ffd700' },
      { nombre: 'Platino', minPuntos: 1000, multiplicador: 2.0, color: '#e5e4e2' },
      { nombre: 'Diamante', minPuntos: 2500, multiplicador: 3.0, color: '#b9f2ff' }
    ],
    lastUpdated: new Date().toISOString()
  };

  if (!await fs.exists(USERS_FILE)) {
    await fs.writeJson(USERS_FILE, defaultUsers, { spaces: 2 });
    console.log('📁 Archivo de usuarios inicializado');
  }

  if (!await fs.exists(CLIENTES_FILE)) {
    await fs.writeJson(CLIENTES_FILE, defaultClientes, { spaces: 2 });
    console.log('📁 Archivo de clientes inicializado');
  }

  if (!await fs.exists(TRANSACCIONES_FILE)) {
    await fs.writeJson(TRANSACCIONES_FILE, [], { spaces: 2 });
    console.log('📁 Archivo de transacciones inicializado');
  }

  if (!await fs.exists(CONFIG_FILE)) {
    await fs.writeJson(CONFIG_FILE, defaultConfig, { spaces: 2 });
    console.log('📁 Archivo de configuración inicializado');
  }
};

// Funciones helper
const readJsonFile = async (filePath) => {
  try {
    return await fs.readJson(filePath);
  } catch (error) {
    console.error(`Error leyendo ${filePath}:`, error);
    return [];
  }
};

const writeJsonFile = async (filePath, data) => {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Error escribiendo ${filePath}:`, error);
    return false;
  }
};

// ============= RUTAS DE USUARIOS =============

// Obtener todos los usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    // No enviar contraseñas
    const safeUsers = users.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// Autenticar usuario
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const users = await readJsonFile(USERS_FILE);
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const { password: _, ...safeUser } = user;
      res.json({ success: true, user: safeUser });
    } else {
      res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error en autenticación' });
  }
});

// Crear nuevo usuario
app.post('/api/users', async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    // Verificar que el username no exista
    if (users.some(u => u.username === newUser.username)) {
      return res.status(400).json({ error: 'El nombre de usuario ya existe' });
    }
    
    users.push(newUser);
    
    if (await writeJsonFile(USERS_FILE, users)) {
      const { password, ...safeUser } = newUser;
      res.status(201).json(safeUser);
    } else {
      res.status(500).json({ error: 'Error guardando usuario' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

// ============= RUTAS DE CLIENTES NFC =============

// Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const clientes = await readJsonFile(CLIENTES_FILE);
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo clientes' });
  }
});

// Obtener cliente por NFC ID
app.get('/api/clientes/nfc/:nfcId', async (req, res) => {
  try {
    const clientes = await readJsonFile(CLIENTES_FILE);
    const cliente = clientes.find(c => c.nfcId === req.params.nfcId);
    
    if (cliente) {
      res.json(cliente);
    } else {
      res.status(404).json({ error: 'Cliente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo cliente' });
  }
});

// Crear nuevo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const clientes = await readJsonFile(CLIENTES_FILE);
    const newCliente = {
      id: clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1,
      ...req.body,
      fechaRegistro: new Date().toISOString(),
      ultimaVisita: new Date().toISOString()
    };
    
    // Verificar que el NFC ID no exista
    if (clientes.some(c => c.nfcId === newCliente.nfcId)) {
      return res.status(400).json({ error: 'El ID NFC ya está registrado' });
    }
    
    clientes.push(newCliente);
    
    if (await writeJsonFile(CLIENTES_FILE, clientes)) {
      res.status(201).json(newCliente);
    } else {
      res.status(500).json({ error: 'Error guardando cliente' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error creando cliente' });
  }
});

// Actualizar cliente
app.put('/api/clientes/:id', async (req, res) => {
  try {
    const clientes = await readJsonFile(CLIENTES_FILE);
    const index = clientes.findIndex(c => c.id === parseInt(req.params.id));
    
    if (index === -1) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    clientes[index] = {
      ...clientes[index],
      ...req.body,
      ultimaVisita: new Date().toISOString()
    };
    
    if (await writeJsonFile(CLIENTES_FILE, clientes)) {
      res.json(clientes[index]);
    } else {
      res.status(500).json({ error: 'Error actualizando cliente' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando cliente' });
  }
});

// ============= RUTAS DE TRANSACCIONES =============

// Obtener todas las transacciones
app.get('/api/transacciones', async (req, res) => {
  try {
    const transacciones = await readJsonFile(TRANSACCIONES_FILE);
    res.json(transacciones);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo transacciones' });
  }
});

// Crear nueva transacción
app.post('/api/transacciones', async (req, res) => {
  try {
    const transacciones = await readJsonFile(TRANSACCIONES_FILE);
    const newTransaccion = {
      id: transacciones.length > 0 ? Math.max(...transacciones.map(t => t.id)) + 1 : 1,
      ...req.body,
      fecha: new Date().toISOString()
    };
    
    transacciones.push(newTransaccion);
    
    if (await writeJsonFile(TRANSACCIONES_FILE, transacciones)) {
      res.status(201).json(newTransaccion);
    } else {
      res.status(500).json({ error: 'Error guardando transacción' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error creando transacción' });
  }
});

// ============= RUTAS DE CONFIGURACIÓN =============

// Obtener configuración
app.get('/api/configuracion', async (req, res) => {
  try {
    const config = await readJsonFile(CONFIG_FILE);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo configuración' });
  }
});

// Actualizar configuración
app.put('/api/configuracion', async (req, res) => {
  try {
    const config = {
      ...req.body,
      lastUpdated: new Date().toISOString()
    };
    
    if (await writeJsonFile(CONFIG_FILE, config)) {
      res.json(config);
    } else {
      res.status(500).json({ error: 'Error guardando configuración' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando configuración' });
  }
});

// ============= RUTAS DE ESTADÍSTICAS =============

app.get('/api/estadisticas', async (req, res) => {
  try {
    const clientes = await readJsonFile(CLIENTES_FILE);
    const transacciones = await readJsonFile(TRANSACCIONES_FILE);
    
    const stats = {
      totalClientes: clientes.length,
      clientesActivos: clientes.filter(c => {
        const ultimaVisita = new Date(c.ultimaVisita);
        const unMesAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return ultimaVisita > unMesAtras;
      }).length,
      totalPuntos: clientes.reduce((sum, c) => sum + c.puntos, 0),
      totalTransacciones: transacciones.length,
      distribucionNiveles: clientes.reduce((dist, c) => {
        dist[c.nivel] = (dist[c.nivel] || 0) + 1;
        return dist;
      }, {}),
      generatedAt: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error generando estadísticas' });
  }
});

// ============= RUTAS DE UTILIDAD =============

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Reset de datos (solo para desarrollo)
app.post('/api/reset', async (req, res) => {
  try {
    // Eliminar archivos existentes
    await Promise.all([
      fs.remove(USERS_FILE),
      fs.remove(CLIENTES_FILE),
      fs.remove(TRANSACCIONES_FILE),
      fs.remove(CONFIG_FILE)
    ]);
    
    // Reinicializar
    await initializeFiles();
    
    res.json({ message: 'Datos reiniciados correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error reiniciando datos' });
  }
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Inicializar servidor
const startServer = async () => {
  try {
    await initializeFiles();
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor mock iniciado en http://localhost:${PORT}`);
      console.log(`📊 API endpoints disponibles:`);
      console.log(`   GET  /api/health - Health check`);
      console.log(`   POST /api/auth/login - Autenticación`);
      console.log(`   GET  /api/users - Usuarios`);
      console.log(`   GET  /api/clientes - Clientes NFC`);
      console.log(`   GET  /api/transacciones - Transacciones`);
      console.log(`   GET  /api/configuracion - Configuración`);
      console.log(`   GET  /api/estadisticas - Estadísticas`);
      console.log(`   POST /api/reset - Reset datos (desarrollo)`);
      console.log(`📁 Datos persistentes en: ${DATA_DIR}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();