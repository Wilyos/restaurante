// Health check endpoint - Versión simplificada para Vercel
export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Responder con estado de salud
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      message: 'Restaurante NFC API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      kv_available: !!(process.env.KV_URL || process.env.KV_REST_API_URL)
    },
    timestamp: new Date().toISOString()
  });
}