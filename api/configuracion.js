// Configuración endpoint
import { 
  handleCors, 
  apiResponse, 
  getCollection, 
  setCollection 
} from './_utils.js';

export default async function handler(req, res) {
  // Manejar CORS
  if (handleCors(req, res)) return;

  try {

    switch (req.method) {
      case 'GET':
        // Obtener configuración actual
        const configuracion = await getCollection('configuracion');
        apiResponse(res, configuracion);
        break;

      case 'PUT':
        // Actualizar configuración
        const updates = req.body;
        const currentConfig = await getCollection('configuracion');
        
        const nuevaConfig = {
          ...currentConfig,
          ...updates,
          fechaActualizacion: new Date().toISOString()
        };

        await setCollection('configuracion', nuevaConfig);
        apiResponse(res, nuevaConfig);
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Configuracion endpoint error:', error);
    apiResponse(res, { error: 'Internal server error' }, 500);
  }
}