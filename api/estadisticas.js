// Estadísticas endpoint
import { 
  handleCors, 
  apiResponse, 
  getCollection 
} from './_utils.js';

export default async function handler(req, res) {
  // Manejar CORS
  if (handleCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientes = await getCollection('clientes');
    const transacciones = await getCollection('transacciones');
    const users = await getCollection('users');

  // Calcular estadísticas
  const totalClientes = clientes.length;
  const totalTransacciones = transacciones.length;
  const totalUsuarios = users.length;
  
  const puntosAcumulados = transacciones
    .filter(t => t.tipo === 'acumular')
    .reduce((sum, t) => sum + t.puntos, 0);
    
  const puntosCanjeados = transacciones
    .filter(t => t.tipo === 'canjear')
    .reduce((sum, t) => sum + t.puntos, 0);
    
  const totalPuntosCirculacion = clientes
    .reduce((sum, c) => sum + c.puntos, 0);

  // Transacciones por día (últimos 7 días)
  const hoy = new Date();
  const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const transaccionesRecientes = transacciones
    .filter(t => new Date(t.fecha) >= hace7Dias)
    .reduce((acc, t) => {
      const fecha = new Date(t.fecha).toDateString();
      if (!acc[fecha]) {
        acc[fecha] = { acumular: 0, canjear: 0 };
      }
      acc[fecha][t.tipo] += t.puntos;
      return acc;
    }, {});

  // Top 5 clientes por puntos
  const topClientes = [...clientes]
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 5);

  const estadisticas = {
    resumen: {
      totalClientes,
      totalTransacciones,
      totalUsuarios,
      puntosAcumulados,
      puntosCanjeados,
      totalPuntosCirculacion
    },
    transaccionesPorDia: transaccionesRecientes,
    topClientes,
    fechaGeneracion: new Date().toISOString()
  };

    apiResponse(res, estadisticas);
  } catch (error) {
    console.error('Estadisticas endpoint error:', error);
    apiResponse(res, { error: 'Internal server error' }, 500);
  }
}