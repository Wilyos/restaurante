// Clientes NFC endpoint
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
        // Obtener todos los clientes
        const clientes = await getCollection('clientes');
        apiResponse(res, clientes);
        break;

      case 'POST':
        // Crear nuevo cliente
        const { nombre, tarjetaNFC, telefono, email, puntosIniciales = 0 } = req.body;
        
        if (!nombre || !tarjetaNFC) {
          return apiResponse(res, { error: 'Nombre and tarjetaNFC are required' }, 400);
        }

        // Verificar si la tarjeta NFC ya existe
        const existingClientes = await getCollection('clientes');
        if (existingClientes.find(c => c.tarjetaNFC === tarjetaNFC)) {
          return apiResponse(res, { error: 'Tarjeta NFC already exists' }, 409);
        }

        const newCliente = {
          id: generateId(),
          nombre,
          tarjetaNFC,
          puntos: puntosIniciales,
          telefono: telefono || '',
          email: email || '',
          fechaRegistro: new Date().toISOString()
        };

        await addToCollection('clientes', newCliente);
        apiResponse(res, newCliente, 201);
        break;

      case 'PUT':
        // Actualizar cliente
        const { id } = req.query;
        const updates = req.body;
        
        if (!id) {
          return apiResponse(res, { error: 'Cliente ID is required' }, 400);
        }

        const updatedCliente = await updateInCollection('clientes', id, {
          ...updates,
          fechaActualizacion: new Date().toISOString()
        });

        if (!updatedCliente) {
          return apiResponse(res, { error: 'Cliente not found' }, 404);
        }

        apiResponse(res, updatedCliente);
        break;

      case 'DELETE':
        // Eliminar cliente
        const { id: deleteId } = req.query;
        
        if (!deleteId) {
          return apiResponse(res, { error: 'Cliente ID is required' }, 400);
        }

        const deletedCliente = await deleteFromCollection('clientes', deleteId);
        
        if (!deletedCliente) {
          return apiResponse(res, { error: 'Cliente not found' }, 404);
        }

        apiResponse(res, { message: 'Cliente deleted successfully' });
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Clientes endpoint error:', error);
    apiResponse(res, { error: 'Internal server error' }, 500);
  }
}