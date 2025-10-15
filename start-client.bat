@echo off
echo 🌐 Iniciando Cliente Web del Restaurante NFC...
echo.

:: Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo Por favor instale Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

:: Cambiar al directorio raíz
cd /d "%~dp0"

:: Verificar si package.json existe
if not exist "package.json" (
    echo ❌ package.json no encontrado
    echo Asegúrese de estar en el directorio correcto del proyecto
    pause
    exit /b 1
)

:: Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias del cliente...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
)

:: Iniciar cliente
echo ✅ Iniciando cliente web...
echo.
echo 🌐 La aplicación se abrirá en: http://localhost:5173
echo.
echo 👤 Credenciales de prueba:
echo    • Usuario: admin    / Contraseña: admin123
echo    • Usuario: mesero   / Contraseña: mesero123
echo    • Usuario: cocina   / Contraseña: cocina123
echo    • Usuario: caja     / Contraseña: caja123
echo.
echo 💡 Presione Ctrl+C para detener el cliente
echo.

npm run dev