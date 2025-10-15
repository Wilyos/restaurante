// Mock API para gestión de usuarios
import { authManager } from '../utils/dataManager.js';

const USERS_KEY = 'restaurante_users';

// Usuarios por defecto del sistema
const defaultUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', 
    name: 'Administrador',
    role: 'admin',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'mesero1',
    password: 'mesero123',
    name: 'Carlos Mesero',
    role: 'mesero',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    username: 'cocina1',
    password: 'cocina123',
    name: 'Ana Cocinera',
    role: 'cocina',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    username: 'barra1',
    password: 'barra123',
    name: 'Luis Barman',
    role: 'barra',
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 5,
    username: 'caja1',
    password: 'caja123',
    name: 'María Cajera',
    role: 'caja',
    active: true,
    createdAt: new Date().toISOString()
  }
];

// Inicializar usuarios si no existen
function initUsers() {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(stored);
}

// Obtener todos los usuarios
export function getUsers() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = initUsers();
      resolve(users);
    }, 100);
  });
}

// Autenticar usuario con persistencia dual (servidor + localStorage)
export async function authenticateUser(username, password) {
  try {
    // Intentar autenticación con el nuevo sistema
    const user = await authManager.login(username, password);
    return user;
  } catch (error) {
    // Fallback al sistema anterior si falla
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = initUsers();
        const user = users.find(u => 
          u.username.toLowerCase() === username.toLowerCase() && 
          u.password === password &&
          u.active
        );
        
        if (user) {
          // Devolver usuario sin contraseña
          const { password: _, ...userWithoutPassword } = user;
          resolve(userWithoutPassword);
        } else {
          reject(new Error('Usuario o contraseña incorrectos'));
        }
      }, 300);
    });
  }
}

// Agregar nuevo usuario
export function addUser(userData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = initUsers();
      
      // Verificar si el username ya existe
      const existingUser = users.find(u => 
        u.username.toLowerCase() === userData.username.toLowerCase()
      );
      
      if (existingUser) {
        reject(new Error('El nombre de usuario ya existe'));
        return;
      }

      // Crear nuevo usuario
      const newUser = {
        id: Math.max(...users.map(u => u.id), 0) + 1,
        username: userData.username.trim(),
        password: userData.password,
        name: userData.name.trim(),
        role: userData.role,
        active: userData.active !== undefined ? userData.active : true,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Devolver usuario sin contraseña
      const { password: _, ...userWithoutPassword } = newUser;
      resolve(userWithoutPassword);
    }, 200);
  });
}

// Actualizar usuario
export function updateUser(id, userData) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = initUsers();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) {
        reject(new Error('Usuario no encontrado'));
        return;
      }

      // Verificar username único (excluyendo el usuario actual)
      const existingUser = users.find(u => 
        u.id !== id && 
        u.username.toLowerCase() === userData.username.toLowerCase()
      );
      
      if (existingUser) {
        reject(new Error('El nombre de usuario ya existe'));
        return;
      }

      // Actualizar usuario
      users[index] = {
        ...users[index],
        username: userData.username.trim(),
        name: userData.name.trim(),
        role: userData.role,
        active: userData.active !== undefined ? userData.active : users[index].active,
        // Solo actualizar contraseña si se proporciona
        ...(userData.password && { password: userData.password })
      };

      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Devolver usuario sin contraseña
      const { password: _, ...userWithoutPassword } = users[index];
      resolve(userWithoutPassword);
    }, 200);
  });
}

// Eliminar usuario
export function deleteUser(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = initUsers();
      const index = users.findIndex(u => u.id === id);
      
      if (index === -1) {
        reject(new Error('Usuario no encontrado'));
        return;
      }

      // No permitir eliminar el usuario admin principal
      if (users[index].username === 'admin') {
        reject(new Error('No se puede eliminar el usuario administrador principal'));
        return;
      }

      users.splice(index, 1);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      resolve(true);
    }, 200);
  });
}

// Resetear usuarios a valores por defecto
export function resetUsers() {
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
      resolve(defaultUsers.map(({ password: _, ...user }) => user));
    }, 100);
  });
}

// Obtener roles disponibles
export function getRoles() {
  return [
    { value: 'admin', label: 'Administrador' },
    { value: 'mesero', label: 'Mesero' },
    { value: 'cocina', label: 'Cocina' },
    { value: 'barra', label: 'Barra' },
    { value: 'caja', label: 'Caja' }
  ];
}