// Users endpoint
import { 
  handleCors, 
  apiResponse, 
  getCollection, 
  addToCollection, 
  updateInCollection, 
  deleteFromCollection, 
  generateId 
} from './_utils.js';

export default async function handler(req, res) {
  // Manejar CORS
  if (handleCors(req, res)) return;

  try {
    switch (req.method) {
      case 'GET':
        // Obtener todos los usuarios (sin passwords)
        const allUsers = await getCollection('users');
        const safeUsers = allUsers.map(({ password, ...user }) => user);
        apiResponse(res, safeUsers);
        break;

      case 'POST':
        // Crear nuevo usuario
        const { username, password, role = 'mesero' } = req.body;
        
        if (!username || !password) {
          return apiResponse(res, { error: 'Username and password are required' }, 400);
        }

        const existingUsers = await getCollection('users');
        
        // Verificar si el usuario ya existe
        if (existingUsers.find(u => u.username === username)) {
          return apiResponse(res, { error: 'Username already exists' }, 409);
        }

        const newUser = {
          id: generateId(),
          username,
          password, // En producción, usar bcrypt
          role,
          createdAt: new Date().toISOString()
        };

        await addToCollection('users', newUser);
        
        const { password: _, ...safeUser } = newUser;
        apiResponse(res, safeUser, 201);
        break;

      case 'PUT':
        // Actualizar usuario
        const { id } = req.query;
        const updates = req.body;
        
        if (!id) {
          return apiResponse(res, { error: 'User ID is required' }, 400);
        }

        const updatedUser = await updateInCollection('users', id, {
          ...updates,
          updatedAt: new Date().toISOString()
        });

        if (!updatedUser) {
          return apiResponse(res, { error: 'User not found' }, 404);
        }

        const { password: _pwd, ...safeUpdatedUser } = updatedUser;
        apiResponse(res, safeUpdatedUser);
        break;

      case 'DELETE':
        // Eliminar usuario
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return apiResponse(res, { error: 'User ID is required' }, 400);
        }

        const deletedUser = await deleteFromCollection('users', deleteId);
        
        if (!deletedUser) {
          return apiResponse(res, { error: 'User not found' }, 404);
        }

        apiResponse(res, { message: 'User deleted successfully' });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Users endpoint error:', error);
    apiResponse(res, { error: 'Internal server error' }, 500);
  }
}