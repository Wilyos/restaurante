// Login endpoint - Versión simplificada
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Username and password are required' 
      });
    }

    // Inicializar usuarios por defecto si no existen
    let users = await kv.get('users');
    
    if (!users) {
      console.log('Initializing default users...');
      users = [
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
      
      await kv.set('users', users);
      console.log('Default users created');
    }

    // Buscar usuario
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Responder con datos del usuario (sin password)
    const { password: _, ...userData } = user;
    
    res.status(200).json({
      success: true,
      data: {
        user: userData,
        token: `jwt_${user.id}_${Date.now()}`
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}