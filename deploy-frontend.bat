@echo off
echo 🚀 Preparando deployment para producción...
echo.

echo 📦 Instalando dependencias del frontend...
npm install

echo 🏗️ Construyendo aplicación para producción...
npm run build

echo ✅ Frontend listo para deployment en Vercel!
echo.
echo 📋 INSTRUCCIONES DE DEPLOYMENT:
echo.
echo 1. FRONTEND EN VERCEL:
echo    - Sube este proyecto a GitHub
echo    - Conecta el repo a Vercel
echo    - Configura variable de entorno: VITE_API_URL
echo.
echo 2. BACKEND EN RENDER/RAILWAY:
echo    - Sube la carpeta /server a un repo separado
echo    - Despliega en Render.com o Railway.app
echo    - Usa el comando: npm start
echo.
pause