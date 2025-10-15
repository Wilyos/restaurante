@echo off
title Sistema NFC Restaurante - Completo
color 0A

echo ===============================================
echo 🍽️  SISTEMA NFC RESTAURANTE - INICIO COMPLETO
echo ===============================================
echo.

:: Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo Por favor instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado: 
node --version
echo.

:: Instalar dependencias del servidor si es necesario
echo 📦 Verificando dependencias del servidor...
cd /d "%~dp0server"
if not exist "node_modules" (
    echo    Instalando dependencias del servidor...
    npm install
)

:: Instalar dependencias del cliente si es necesario  
echo 📦 Verificando dependencias del cliente...
cd /d "%~dp0"
if not exist "node_modules" (
    echo    Instalando dependencias del cliente...
    npm install
)

echo.
echo 🚀 Iniciando sistema completo...
echo.

:: Iniciar servidor en una nueva ventana
echo ⚙️  Iniciando servidor API en puerto 3001...
start "Servidor API - Puerto 3001" cmd /c "cd /d ""%~dp0server"" && npm start"

:: Esperar un poco para que el servidor inicie
timeout /t 3 /nobreak >nul

:: Iniciar cliente web en otra ventana
echo 🌐 Iniciando cliente web en puerto 5173...
start "Cliente Web - Puerto 5173" cmd /c "cd /d ""%~dp0"" && npm run dev"

echo.
echo ✅ Sistema iniciado correctamente!
echo.
echo 📊 INFORMACIÓN DEL SISTEMA:
echo    • Servidor API: http://localhost:3001
echo    • Cliente Web:  http://localhost:5173
echo.
echo 👤 CREDENCIALES DE ACCESO:
echo    • Administrador: admin / admin123
echo    • Mesero:        mesero / mesero123  
echo    • Cocina:        cocina / cocina123
echo    • Caja:          caja / caja123
echo.
echo 🔧 CARACTERÍSTICAS:
echo    • ✅ Sistema de puntos NFC
echo    • ✅ Timeout de sesión (30 min)
echo    • ✅ Almacenamiento dual (local + servidor)
echo    • ✅ Acceso multi-dispositivo
echo    • ✅ Configuración avanzada
echo    • ✅ Gestión de tarjetas NFC
echo.
echo 💡 MODO DE USO:
echo    • Online:  Datos sincronizados entre dispositivos
echo    • Offline: Datos solo en dispositivo local
echo    • Auto:    Sincronización automática cuando hay conexión
echo.
echo ⚠️  Para detener el sistema, cierre ambas ventanas del servidor y cliente
echo.
pause