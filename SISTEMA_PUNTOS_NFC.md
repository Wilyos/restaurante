# Sistema de Puntos NFC para Restaurante

## 📋 Descripción General

Este sistema implementa un programa de fidelización de clientes utilizando tecnología NFC (Near Field Communication) que permite a los clientes acumular y canjear puntos por sus compras en el restaurante.

## 🎯 Características Principales

### 1. **Gestión de Clientes NFC**
- Registro de clientes con tarjetas NFC únicas
- Validación de formato de tarjetas NFC
- Sistema de niveles (Bronce, Plata, Oro, Diamante)
- Bonificación de bienvenida para nuevos clientes

### 2. **Acumulación de Puntos**
- 1 punto por cada peso gastado (configurable)
- Acumulación automática al procesar pagos
- Historial completo de transacciones
- Actualización automática de niveles según puntos acumulados

### 3. **Canje de Puntos**
- Conversión de puntos a descuentos (1 punto = $1)
- Mínimo configurable para canje (por defecto: 100 puntos)
- Validación de puntos disponibles
- Registro de canjes en el historial

### 4. **Simulador de Lector NFC**
- Interfaz visual para simular lectura de tarjetas
- Estados visuales claros (leyendo, éxito, error)
- Detección de tarjetas registradas y no registradas
- Animaciones de retroalimentación

### 5. **Sistema de Niveles**
- **Bronce**: 0-499 puntos acumulados
- **Plata**: 500-999 puntos acumulados  
- **Oro**: 1000-1999 puntos acumulados
- **Diamante**: 2000+ puntos acumulados

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
src/
├── api/
│   └── mockClientesNFC.js          # API mock para gestión de clientes y puntos
├── components/
│   └── LectorNFC.jsx               # Componente del simulador de lector NFC
└── views/
    ├── SistemaPuntos.jsx           # Vista principal del sistema de puntos
    └── Caja.jsx                    # Vista de caja integrada con puntos
```

### Flujo de Datos

1. **Registro de Cliente**: `LectorNFC` → `mockClientesNFC.registrarClienteNFC()`
2. **Acumulación**: `Caja` → `mockClientesNFC.acumularPuntos()` 
3. **Canje**: `Caja` → `mockClientesNFC.canjearPuntos()`
4. **Consulta**: `SistemaPuntos` → `mockClientesNFC.getClientesNFC()`

## 🚀 Guía de Uso

### Para el Personal de Caja

1. **Cobrar con Sistema de Puntos:**
   - En la vista de Caja, hacer clic en "🎯 Cobrar con NFC"
   - Presionar "Leer Tarjeta" en el simulador NFC
   - Si el cliente está registrado, se muestran sus puntos disponibles
   - Opcionalmente canjear puntos por descuento
   - Procesar el cobro (automáticamente acumula puntos por la compra)

2. **Cliente Nuevo:**
   - Si la tarjeta no está registrada, completar el formulario de registro
   - El cliente recibe automáticamente puntos de bienvenida

### Para Administradores

1. **Gestión del Sistema:**
   - Acceder a "Puntos NFC" desde el menú de administración
   - Ver estadísticas en tiempo real
   - Gestionar clientes registrados
   - Consultar historial de transacciones

2. **Monitoreo:**
   - Dashboard con métricas clave
   - Distribución de clientes por niveles
   - Puntos en circulación vs. acumulados totales

## ⚙️ Configuración

### Parámetros del Sistema (en `mockClientesNFC.js`):

```javascript
const CONFIGURACION_PUNTOS = {
  puntosPerPeso: 1,                    // Puntos ganados por peso gastado
  puntosMinimosCanjeables: 100,        // Mínimo para canjear
  valorPunto: 1,                       // Valor en pesos de cada punto
  bonificacionBienvenida: 50           // Puntos de bienvenida
};
```

### Niveles de Cliente:

```javascript
function determinarNivel(puntosAcumulados) {
  if (puntosAcumulados >= 2000) return 'Diamante';
  if (puntosAcumulados >= 1000) return 'Oro';
  if (puntosAcumulados >= 500) return 'Plata';
  return 'Bronce';
}
```

## 🔧 API Reference

### Funciones Principales

#### `registrarClienteNFC(datosCliente)`
Registra un nuevo cliente en el sistema.

```javascript
const cliente = await registrarClienteNFC({
  nfcId: 'NFC123456789012',
  nombre: 'Juan Pérez',
  email: 'juan@email.com',
  telefono: '3001234567'
});
```

#### `acumularPuntos(nfcId, montoCompra, descripcion)`
Acumula puntos por una compra.

```javascript
const resultado = await acumularPuntos(
  'NFC123456789012', 
  25000, 
  'Pedido #123'
);
// resultado.puntosGanados = 25000
// resultado.cliente = cliente actualizado
```

#### `canjearPuntos(nfcId, puntosACanjear)`
Canjea puntos por descuento.

```javascript
const resultado = await canjearPuntos('NFC123456789012', 150);
// resultado.descuento = 150 (pesos)
// resultado.cliente = cliente actualizado
```

#### `getClienteByNFC(nfcId)`
Busca un cliente por su ID de tarjeta NFC.

```javascript
const cliente = await getClienteByNFC('NFC123456789012');
```

#### `simularLecturaNFC()`
Simula la lectura de una tarjeta NFC.

```javascript
const { nfcId } = await simularLecturaNFC();
// Puede fallar aleatoriamente para simular errores reales
```

## 🧪 Testing

El sistema incluye pruebas exhaustivas:

```bash
npm test
```

### Casos de Prueba Cubiertos:
- ✅ Registro de clientes
- ✅ Validación de NFC ID duplicados
- ✅ Acumulación de puntos
- ✅ Canje de puntos
- ✅ Validaciones de puntos insuficientes
- ✅ Generación de estadísticas
- ✅ Simulación de lector NFC
- ✅ Sistema de niveles
- ✅ Validación de formato NFC

## 📊 Estadísticas y Reportes

El sistema genera automáticamente:

- **Total de clientes activos**
- **Puntos en circulación** (disponibles para canje)
- **Puntos acumulados totales** (histórico)
- **Transacciones del día**
- **Distribución por niveles**

## 🎨 Interfaz de Usuario

### Características Visuales:
- **Lector NFC**: Animaciones y estados visuales claros
- **Niveles**: Iconos y colores distintivos para cada nivel
- **Transacciones**: Historial con códigos de color
- **Responsive**: Adaptado para dispositivos móviles y desktop

### Estados del Lector:
- 🔵 **Listo**: Esperando tarjeta
- 🔄 **Leyendo**: Procesando tarjeta (con animación)
- ✅ **Éxito**: Cliente identificado
- ❌ **Error**: Falla de lectura o tarjeta no registrada

## 🔮 Extensiones Futuras

### Funcionalidades Potenciales:
1. **Promociones Especiales**: Multiplicadores de puntos por días/productos
2. **Referidos**: Puntos por invitar amigos
3. **Integración Real NFC**: Conexión con lectores físicos
4. **Notificaciones Push**: Alertas de promociones
5. **Historial Detallado**: Análisis avanzado de comportamiento
6. **Exportación de Datos**: Reportes en PDF/Excel

## 🔒 Consideraciones de Seguridad

- Validación de formato de tarjetas NFC
- Verificación de unicidad de IDs
- Protección contra duplicación de registros
- Validación de puntos disponibles antes de canje

## 📝 Notas de Implementación

1. **Almacenamiento**: Actualmente usa `localStorage` (mock)
2. **Simulación**: El lector NFC es simulado con delays realistas
3. **Escalabilidad**: Estructura preparada para API real
4. **Mantenibilidad**: Código modular y documentado

---

## 🚀 Inicio Rápido

1. **Iniciar aplicación**:
   ```bash
   npm run dev
   ```

2. **Acceder al sistema**:
   - Login como administrador: `admin` / `admin123`
   - Ir a "Puntos NFC" en el menú

3. **Probar funcionalidades**:
   - Usar el lector NFC para detectar tarjetas
   - Registrar un cliente nuevo
   - Procesar un pago con puntos en Caja

¡El sistema está listo para usar! 🎉