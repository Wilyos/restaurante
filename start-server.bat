@echo off
echo 🚀 Iniciando Servidor de Restaurante NFC...
echo.

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo Por favor instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Cambiar al directorio del servidor
cd /d "%~dp0server"

:: Verificar si package.json existe
if not exist "package.json" (
    echo ❌ package.json no encontrado en el directorio server
    echo Asegúrese de estar en el directorio correcto
    pause
    exit /b 1
)

:: Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias del servidor...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)

:: Crear directorio de datos si no existe
if not exist "data" mkdir data

:: Iniciar servidor
echo ✅ Iniciando servidor en http://localhost:3001...
echo.
echo 📊 Endpoints disponibles:
echo    • GET  /api/health - Estado del servidor
echo    • POST /api/auth/login - Autenticación
echo    • GET  /api/users - Usuarios
echo    • GET  /api/clientes - Clientes NFC
echo    • GET  /api/transacciones - Transacciones
echo    • GET  /api/configuracion - Configuración
echo    • POST /api/reset - Reiniciar datos
echo.
echo 💡 Presione Ctrl+C para detener el servidor
echo.

npm start