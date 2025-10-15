@echo off
echo 🧪 Probando endpoints después del deployment...
echo.

echo 📡 1. Probando health check:
curl https://restaurante-ivory.vercel.app/api/health
echo.

echo 👤 2. Probando login:
curl -X POST https://restaurante-ivory.vercel.app/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
echo.

echo 📊 3. Probando usuarios:
curl https://restaurante-ivory.vercel.app/api/users
echo.

echo ✅ Si ves respuestas JSON, el backend está funcionando!
pause