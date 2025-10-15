/**
 * Adaptador de API que puede funcionar tanto en modo offline (localStorage) 
 * como online (servidor HTTP) con Mock KV como fallback
 */
import mockKV from './mockKV.js';

// Obtener URL base del API desde variables de entorno
const API_BASE_URL = `${import.meta.env.VITE_API_URL || window.location.origin}/api`;

// Detectar si el servidor está disponible
let serverAvailable = false;
let usingMockKV = false;

const checkServerAvailability = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      serverAvailable = true;
      usingMockKV = false;
      console.log('✅ Server API available');
      return true;
    }
  } catch (error) {
    console.log('⚠️ Server API unavailable, using Mock KV');
  }
  
  // Fallback a Mock KV
  serverAvailable = false;
  usingMockKV = true;
  await mockKV.initializeData();
  return false;
};

// Inicializar estado del servidor
checkServerAvailability();

/**
 * Clase para manejar persistencia dual (servidor + localStorage)
 */
export class DataManager {
  constructor(entityName, localStorageKey) {
    this.entityName = entityName;
    this.localStorageKey = localStorageKey;
    this.syncInterval = null;
    
    // Intentar sincronizar cada 30 segundos
    this.startSyncMonitoring();
  }

  async startSyncMonitoring() {
    // Verificar servidor cada 30 segundos
    this.syncInterval = setInterval(async () => {
      const wasAvailable = serverAvailable;
      await checkServerAvailability();
      
      if (!wasAvailable && serverAvailable) {
        console.log(`🔄 Servidor reconectado, sincronizando ${this.entityName}...`);
        await this.syncToServer();
      }
    }, 30000);
  }

  stopSyncMonitoring() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  /**
   * Obtener datos - prioriza servidor, fallback a localStorage
   */
  async getData() {
    await checkServerAvailability();
    
    try {
      if (serverAvailable && !usingMockKV) {
        const response = await fetch(`${API_BASE_URL}/${this.entityName}`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          // Guardar en localStorage como backup
          this.saveToLocalStorage(data);
          return data;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error obteniendo ${this.entityName} del servidor`);
    }

    if (usingMockKV) {
      // Usar Mock KV con datos más ricos
      return mockKV.getData(this.entityName) || [];
    }

    // Fallback final a localStorage
    return this.getFromLocalStorage();
  }

  /**
   * Guardar datos - intenta servidor, guarda en localStorage
   */
  async saveData(data) {
    // Siempre guardar en localStorage primero
    this.saveToLocalStorage(data);

    try {
      if (serverAvailable) {
        const response = await fetch(`${API_BASE_URL}/${this.entityName}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          console.log(`✅ ${this.entityName} sincronizado con servidor`);
          return await response.json();
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error guardando ${this.entityName} en servidor, guardado localmente`);
    }

    return data;
  }

  /**
   * Crear nuevo elemento
   */
  async createItem(item) {
    try {
      if (serverAvailable) {
        const response = await fetch(`${API_BASE_URL}/${this.entityName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item)
        });

        if (response.ok) {
          const newItem = await response.json();
          // Actualizar localStorage
          const localData = this.getFromLocalStorage();
          localData.push(newItem);
          this.saveToLocalStorage(localData);
          return newItem;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error creando ${this.entityName} en servidor, creando localmente`);
    }

    // Fallback a localStorage
    const localData = this.getFromLocalStorage();
    const newItem = {
      id: localData.length > 0 ? Math.max(...localData.map(item => item.id)) + 1 : 1,
      ...item,
      createdAt: new Date().toISOString(),
      _localOnly: true // Marcar para sincronización posterior
    };
    
    localData.push(newItem);
    this.saveToLocalStorage(localData);
    return newItem;
  }

  /**
   * Actualizar elemento existente
   */
  async updateItem(id, updates) {
    try {
      if (serverAvailable) {
        const response = await fetch(`${API_BASE_URL}/${this.entityName}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates)
        });

        if (response.ok) {
          const updatedItem = await response.json();
          // Actualizar localStorage
          const localData = this.getFromLocalStorage();
          const index = localData.findIndex(item => item.id === id);
          if (index !== -1) {
            localData[index] = updatedItem;
            this.saveToLocalStorage(localData);
          }
          return updatedItem;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Error actualizando ${this.entityName} en servidor`);
    }

    // Fallback a localStorage
    const localData = this.getFromLocalStorage();
    const index = localData.findIndex(item => item.id === id);
    if (index !== -1) {
      localData[index] = {
        ...localData[index],
        ...updates,
        updatedAt: new Date().toISOString(),
        _localOnly: true
      };
      this.saveToLocalStorage(localData);
      return localData[index];
    }
    
    throw new Error(`${this.entityName} con ID ${id} no encontrado`);
  }

  /**
   * Obtener por campo específico
   */
  async getByField(fieldName, value) {
    const data = await this.getData();
    return data.find(item => item[fieldName] === value);
  }

  // Métodos de localStorage
  getFromLocalStorage() {
    try {
      const stored = localStorage.getItem(this.localStorageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error leyendo ${this.localStorageKey} de localStorage:`, error);
      return [];
    }
  }

  saveToLocalStorage(data) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Error guardando ${this.localStorageKey} en localStorage:`, error);
      return false;
    }
  }

  /**
   * Sincronizar datos locales pendientes al servidor
   */
  async syncToServer() {
    if (!serverAvailable) return false;

    try {
      const localData = this.getFromLocalStorage();
      const pendingItems = localData.filter(item => item._localOnly);

      console.log(`🔄 Sincronizando ${pendingItems.length} elementos de ${this.entityName}...`);

      for (const item of pendingItems) {
        try {
          const { _localOnly, ...itemData } = item;
          
          if (item.createdAt === item.updatedAt || !item.updatedAt) {
            // Elemento nuevo
            await fetch(`${API_BASE_URL}/${this.entityName}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(itemData)
            });
          } else {
            // Elemento actualizado
            await fetch(`${API_BASE_URL}/${this.entityName}/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(itemData)
            });
          }
          
          // Quitar marca de solo local
          item._localOnly = false;
        } catch (error) {
          console.error(`Error sincronizando item ${item.id}:`, error);
        }
      }

      this.saveToLocalStorage(localData);
      console.log(`✅ Sincronización de ${this.entityName} completada`);
      return true;
    } catch (error) {
      console.error(`Error en sincronización de ${this.entityName}:`, error);
      return false;
    }
  }
}

/**
 * Manager específico para autenticación
 */
export class AuthManager extends DataManager {
  constructor() {
    super('auth', 'resto.users');
  }

  async login(username, password) {
    try {
      if (serverAvailable) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Guardar usuario en localStorage para acceso offline
            localStorage.setItem('resto.user', JSON.stringify(result.user));
            return result.user;
          } else {
            throw new Error(result.message);
          }
        } else {
          throw new Error('Error de conexión con el servidor');
        }
      }
    } catch (error) {
      console.warn('⚠️ Servidor no disponible, usando autenticación local');
    }

    // Fallback a autenticación local
    const localUsers = this.getFromLocalStorage();
    const user = localUsers.find(u => u.username === username && u.password === password);
    
    if (user) {
      const { password: _, ...safeUser } = user;
      localStorage.setItem('resto.user', JSON.stringify(safeUser));
      return safeUser;
    } else {
      throw new Error('Credenciales inválidas');
    }
  }

  async createUser(userData) {
    return await this.createItem(userData);
  }
}

/**
 * Managers para diferentes entidades
 */
export const authManager = new AuthManager();
export const clientesManager = new DataManager('clientes', 'nfc.clientes');
export const transaccionesManager = new DataManager('transacciones', 'nfc.transacciones');
export const configManager = new DataManager('configuracion', 'nfc.configuracion');

/**
 * Función para verificar estado de conectividad
 */
export const getConnectivityStatus = () => ({
  serverAvailable,
  lastCheck: new Date().toISOString()
});

/**
 * Función para forzar verificación de servidor
 */
export const forceServerCheck = async () => {
  return await checkServerAvailability();
};

/**
 * Función para sincronizar todos los datos
 */
export const syncAllData = async () => {
  if (!serverAvailable) {
    console.log('🔌 Servidor no disponible, omitiendo sincronización');
    return false;
  }

  console.log('🔄 Iniciando sincronización completa...');
  
  const results = await Promise.allSettled([
    clientesManager.syncToServer(),
    transaccionesManager.syncToServer(),
    configManager.syncToServer()
  ]);

  const successful = results.filter(result => result.status === 'fulfilled' && result.value).length;
  console.log(`✅ Sincronización completada: ${successful}/${results.length} exitosas`);
  
  return successful === results.length;
};

/**
 * Función especial para login que maneja MockKV
 */
export const authenticateUser = async (username, password) => {
  await checkServerAvailability();
  
  if (serverAvailable && !usingMockKV) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.data || result;
      }
    } catch (error) {
      console.warn('⚠️ Error en login del servidor, usando MockKV');
    }
  }
  
  // Usar MockKV para login
  if (usingMockKV) {
    return await mockKV.login(username, password);
  }
  
  throw new Error('Authentication failed');
};

/**
 * Función para obtener estado de conectividad con más detalle
 */
export const getDetailedConnectivityStatus = () => ({
  serverAvailable,
  usingMockKV,
  mode: usingMockKV ? 'Mock KV' : (serverAvailable ? 'Servidor Remoto' : 'Solo Local'),
  description: usingMockKV ? 
    'Usando simulación de base de datos con datos enriquecidos' :
    (serverAvailable ? 'Conectado al servidor con persistencia real' : 'Datos guardados solo localmente'),
  lastCheck: new Date().toISOString()
});

// Auto-sincronizar al cargar
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(syncAllData, 2000); // Sincronizar después de 2 segundos
});