// Login endpoint
import { handleCors, apiResponse, getCollection } from '../_utils.js';

export default async function handler(req, res) {
  // Manejar CORS
  if (handleCors(req, res)) return;

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return apiResponse(res, { error: 'Username and password are required' }, 400);
  }

  try {
    // Buscar usuario
    const users = await getCollection('users');
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
      return apiResponse(res, { error: 'Invalid credentials' }, 401);
    }

    // Responder con datos del usuario (sin password)
    const { password: _, ...userData } = user;
    apiResponse(res, {
      user: userData,
      token: `jwt_${user.id}_${Date.now()}` // Token simulado
    });
  } catch (error) {
    console.error('Login error:', error);
    apiResponse(res, { error: 'Internal server error' }, 500);
  }
}