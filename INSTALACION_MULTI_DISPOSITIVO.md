# 🍽️ Sistema NFC Restaurante - Guía de Instalación Multi-Dispositivo

## 🚀 Instalación y Configuración

### Requisitos Previos
- **Node.js** v18 o superior ([Descargar](https://nodejs.org/))
- **Git** (opcional, para clonar el repositorio)
- **Puerto 3001** libre para el servidor API
- **Puerto 5173** libre para el cliente web

### 📦 Instalación Automática (Recomendada)

#### Windows
1. Descarga o clona el proyecto
2. Haz doble clic en `start-all.bat`
3. El script instalará dependencias e iniciará todo automáticamente

#### Manual (Todas las plataformas)

```bash
# 1. Instalar dependencias del cliente
npm install

# 2. Instalar dependencias del servidor
cd server
npm install
cd ..

# 3. Iniciar servidor (Terminal 1)
cd server
npm start

# 4. Iniciar cliente (Terminal 2)
npm run dev
```

## 🌐 Acceso Multi-Dispositivo

### 🖥️ **Servidor Central (Computadora Principal)**

1. **Ejecutar `start-all.bat`** (Windows) o comandos manuales
2. **Servidor API**: http://localhost:3001
3. **Cliente Web**: http://localhost:5173

### 📱 **Dispositivos Adicionales (Teléfonos, Tablets)**

#### Opción 1: Mismo WiFi (Recomendada)
1. Obtén la IP local de tu computadora:
   ```cmd
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```
2. Desde otros dispositivos, accede a:
   - **http://[IP-COMPUTADORA]:5173**
   - Ejemplo: http://192.168.1.100:5173

#### Opción 2: Servidor Público (Internet)
1. Configura port forwarding en tu router:
   - Puerto 3001 → API
   - Puerto 5173 → Web
2. Accede usando tu IP pública

#### Opción 3: Tunneling (Desarrollo)
```bash
# Usar ngrok o similar
npx localtunnel --port 5173
npx localtunnel --port 3001
```

## 🔐 Credenciales del Sistema

| Usuario | Contraseña | Rol | Permisos |
|---------|-----------|-----|----------|
| `admin` | `admin123` | Administrador | Acceso completo |
| `mesero` | `mesero123` | Mesero | Sistema de puntos |
| `cocina` | `cocina123` | Cocina | Pedidos y cocina |
| `caja` | `caja123` | Caja | Punto de venta |

## 🛠️ Modos de Funcionamiento

### ✅ **Modo Online** (Con Servidor)
- **Persistencia**: Servidor central + localStorage
- **Multi-dispositivo**: ✅ Disponible
- **Sincronización**: Automática
- **Ventajas**: Acceso desde cualquier dispositivo
- **Uso**: Producción normal

### ⚠️ **Modo Offline** (Solo Local)
- **Persistencia**: Solo localStorage del navegador
- **Multi-dispositivo**: ❌ No disponible
- **Sincronización**: Manual cuando vuelva conexión
- **Ventajas**: Funciona sin internet
- **Uso**: Respaldo o desarrollo

## 📊 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────┐
│                DISPOSITIVOS                     │
├─────────────────┬─────────────────┬─────────────┤
│   💻 PC Admin    │  📱 Teléfono    │  📱 Tablet   │
│                 │   Mesero        │   Caja       │
├─────────────────┴─────────────────┴─────────────┤
│            🌐 CLIENTE WEB (Puerto 5173)         │
├─────────────────────────────────────────────────┤
│            ⚙️ SERVIDOR API (Puerto 3001)        │
├─────────────────────────────────────────────────┤
│               📁 ALMACENAMIENTO                 │
│  ┌─────────────────┬─────────────────────────┐   │
│  │ 🗄️ JSON Files   │ 💾 localStorage       │   │
│  │ (Servidor)      │ (Cada Dispositivo)     │   │
│  └─────────────────┴─────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## 🔄 Sincronización de Datos

### **Flujo Automático**
1. **Escritura**: Datos se guardan en servidor + localStorage
2. **Lectura**: Prioriza servidor, fallback a localStorage  
3. **Offline**: Solo localStorage hasta recuperar conexión
4. **Reconexión**: Sincronización automática de cambios pendientes

### **Indicadores Visuales**
- 🟢 **Online**: Datos sincronizados
- 🟠 **Solo Local**: Sin conexión a servidor
- 🔄 **Sincronizando**: Actualizando datos

## 🎯 Casos de Uso por Dispositivo

### 🖥️ **Computadora Principal**
- **Usuario**: `admin`
- **Funciones**: Configuración completa, reportes, gestión
- **Ubicación**: Oficina/administración

### 📱 **Tablet del Mesero**
- **Usuario**: `mesero`
- **Funciones**: Sistema de puntos NFC, registro clientes
- **Ubicación**: Móvil por el restaurante

### 📱 **Teléfono de Caja**
- **Usuario**: `caja`
- **Funciones**: Canje de puntos, ventas
- **Ubicación**: Punto de venta

### 🖥️ **Terminal de Cocina**
- **Usuario**: `cocina`
- **Funciones**: Pedidos, preparación
- **Ubicación**: Cocina

## ⚙️ Configuración de Red

### **Para Acceso Local (WiFi)**
1. **Servidor**: Usar IP local en lugar de localhost
2. **Firewall**: Permitir puertos 3001 y 5173
3. **Router**: Opcional port forwarding para acceso externo

### **Variables de Entorno**
```bash
# Archivo .env (opcional)
API_PORT=3001
CLIENT_PORT=5173
API_HOST=0.0.0.0  # Para acceso remoto
```

## 🔧 Solución de Problemas

### **No puedo acceder desde otro dispositivo**
1. Verificar que ambos están en la misma red WiFi
2. Usar IP local en lugar de localhost
3. Verificar firewall de Windows/antivirus
4. Probar con `http://` (no https)

### **Los datos no se sincronizan**
1. Verificar que el servidor esté corriendo (puerto 3001)
2. Ver indicador de conectividad en la interfaz
3. Hacer clic en "Verificar Conexión"
4. Los datos offline se sincronizan al reconectar

### **Sesión expira muy rápido**
1. Ir a Configuración NFC → Timeout
2. Cambiar de 30 minutos a tiempo deseado
3. Para terminales móviles usar 1-2 horas

### **Crear usuarios adicionales**
1. Login como `admin`
2. No hay UI aún, usar API directamente:
```bash
POST http://localhost:3001/api/users
{
  "username": "nuevo_usuario",
  "password": "contraseña123",
  "name": "Nombre Completo", 
  "role": "mesero"
}
```

## 📁 Estructura de Archivos

```
restaurante/
├── 📁 server/              # Servidor API
│   ├── package.json
│   ├── server.js
│   └── 📁 data/           # Datos persistentes
│       ├── users.json
│       ├── clientes.json
│       ├── transacciones.json
│       └── configuracion.json
├── 📁 src/                # Cliente React
├── 📁 public/
├── package.json
├── start-all.bat          # 🚀 Inicio completo
├── start-server.bat       # Solo servidor
└── start-client.bat       # Solo cliente
```

## 🎯 Próximos Pasos

1. **Ejecutar** `start-all.bat`
2. **Acceder** desde http://localhost:5173
3. **Login** como `admin`/`admin123`
4. **Configurar** timeouts y parámetros
5. **Probar** desde otros dispositivos usando IP local
6. **Registrar** clientes NFC reales

---

## 🆘 Soporte

- **Logs del Servidor**: Ventana del terminal del servidor
- **Logs del Cliente**: Consola del navegador (F12)  
- **Estado**: Indicador de conectividad en la barra superior
- **Reset**: POST a `/api/reset` para reiniciar datos

¡El sistema está listo para uso multi-dispositivo! 🚀