#!/bin/bash
# Script para preparar el backend para Render

echo "🚀 Preparando backend para Render..."

# Crear directorio temporal para el backend
mkdir -p ../restaurante-backend
cp -r server/* ../restaurante-backend/
cp server/.env ../restaurante-backend/ 2>/dev/null || true

cd ../restaurante-backend

# Crear archivo README para el backend
cat > README.md << 'EOF'
# Restaurante Backend API

Servidor Express.js para el sistema NFC de restaurante.

## Deploy en Render

1. Conectar este repo a Render
2. Configurar:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node.js

## Variables de entorno:
- NODE_ENV=production
- PORT=10000 (automático en Render)
EOF

echo "✅ Backend preparado en: ../restaurante-backend"
echo "📋 Próximos pasos:"
echo "1. Subir ../restaurante-backend a GitHub"
echo "2. Conectar a Render.com"
echo "3. Actualizar VITE_API_URL en Vercel"