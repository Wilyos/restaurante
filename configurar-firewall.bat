@echo off
echo Configurando Firewall de Windows para el Sistema de Restaurante...
echo.

REM Agregar reglas del firewall para los puertos del sistema
netsh advfirewall firewall add rule name="Restaurante Frontend" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="Restaurante Backend" dir=in action=allow protocol=TCP localport=3001

echo.
echo ✅ Reglas del firewall agregadas exitosamente:
echo    - Puerto 5173 (Frontend Vite)
echo    - Puerto 3001 (Backend API)
echo.
echo Ahora puedes acceder desde tu teléfono usando:
echo 📱 http://192.168.0.142:5173
echo.
pause