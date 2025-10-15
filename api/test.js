// Test endpoint ultra simple
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ 
    status: 'ok', 
    message: 'API funcionando',
    timestamp: new Date().toISOString() 
  });
}