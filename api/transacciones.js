// Transacciones endpoint
import { 
  handleCors, 
  apiResponse, 
  getCollection, 
  addToCollection, 
  updateInCollection,
  generateId 
} from './_utils.js';

export default async function handler(req, res) {
  // Manejar CORS
  if (handleCors(req, res)) return;

  try {

    switch (req.method) {
      case 'GET':
        // Obtener todas las transacciones
        const { clienteId: queryClienteId, limite } = req.query;
        
        const transacciones = await getCollection('transacciones');
        let result = transacciones;
      
      // Filtrar por cliente si se especifica
      if (queryClienteId) {
        result = result.filter(t => t.clienteId === queryClienteId);
      }
      
      // Limitar resultados si se especifica
      if (limite) {
        const limit = parseInt(limite);
        result = result.slice(0, limit);
      }
      
      // Ordenar por fecha descendente
      result.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      apiResponse(res, result);
      break;

    case 'POST':
      // Crear nueva transacción
      const { clienteId, tipo, puntos, descripcion, usuario } = req.body;
      
      if (!clienteId || !tipo || !puntos || !usuario) {
        return apiResponse(res, { 
          error: 'clienteId, tipo, puntos, and usuario are required' 
        }, 400);
      }

      if (!['acumular', 'canjear'].includes(tipo)) {
        return apiResponse(res, { 
          error: 'tipo must be either "acumular" or "canjear"' 
        }, 400);
      }

        // Verificar que el cliente existe
        const clientes = await getCollection('clientes');
        const cliente = clientes.find(c => c.id === clienteId);
      
      if (!cliente) {
        return apiResponse(res, { error: 'Cliente not found' }, 404);
      }

      // Verificar puntos suficientes para canjear
      if (tipo === 'canjear' && cliente.puntos < puntos) {
        return apiResponse(res, { 
          error: 'Insufficient points' 
        }, 400);
      }

      const newTransaccion = {
        id: generateId(),
        clienteId,
        tipo,
        puntos: parseInt(puntos),
        descripcion: descripcion || `${tipo} ${puntos} puntos`,
        fecha: new Date().toISOString(),
        usuario
      };

        // Actualizar puntos del cliente
        const nuevosPuntos = tipo === 'acumular' 
          ? cliente.puntos + parseInt(puntos)
          : cliente.puntos - parseInt(puntos);
        
        await updateInCollection('clientes', clienteId, { puntos: nuevosPuntos });
        await addToCollection('transacciones', newTransaccion);
      
      apiResponse(res, newTransaccion, 201);
      break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Transacciones endpoint error:', error);
    apiResponse(res, { error: 'Internal server error' }, 500);
  }
}