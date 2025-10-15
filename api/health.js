// Health check endpoint
import { handleCors, apiResponse } from '../_utils.js';

export default function handler(req, res) {
  // Manejar CORS
  if (handleCors(req, res)) return;

  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Responder con estado de salud
  apiResponse(res, {
    status: 'ok',
    message: 'Restaurante NFC API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}