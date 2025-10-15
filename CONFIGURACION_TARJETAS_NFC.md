# 🔧 Configuración Avanzada de Tarjetas NFC

## 📋 Descripción General

El sistema de puntos incluye una configuración avanzada que te permite personalizar completamente el comportamiento de las tarjetas NFC, el sistema de puntos, promociones y seguridad.

## 🎛️ Acceso a Configuración

### Para Administradores:
1. Inicia sesión como administrador (`admin` / `admin123`)
2. Ve al menú "Config. NFC" en la barra de administración
3. Ajusta las configuraciones según tus necesidades
4. Presiona "Guardar Configuración" para aplicar cambios

---

## ⚙️ Secciones de Configuración

### 1. 💰 **Configuración de Puntos**

#### Parámetros Configurables:
- **Puntos por peso gastado**: Cuántos puntos gana el cliente por cada peso
- **Valor del punto**: Cuántos pesos vale cada punto al canjearlo
- **Puntos mínimos para canjear**: Cantidad mínima requerida para canjear
- **Bonificación de bienvenida**: Puntos que recibe un cliente nuevo

#### Ejemplo de Configuración:
```
Puntos por peso: 1.5 pts/$1
Valor punto: $0.80
Mínimo canje: 150 pts
Bono bienvenida: 100 pts
```

**Resultado**: Un cliente que gasta $10,000 ganaría 15,000 puntos, podría canjear 150 puntos por $120 de descuento.

---

### 2. ⭐ **Sistema de Niveles**

#### Niveles Configurables:
- **Bronce**: Nivel inicial (configurable desde 0 puntos)
- **Plata**: Nivel intermedio (por defecto: 500+ puntos)
- **Oro**: Nivel avanzado (por defecto: 1000+ puntos)
- **Diamante**: Nivel premium (por defecto: 2000+ puntos)

#### Para Cada Nivel Puedes Configurar:
- **Puntos mínimos**: Cuántos puntos acumulados se necesitan
- **Multiplicador**: Bonus extra de puntos (ej: 1.2x = 20% más puntos)
- **Nombre personalizado**: Cambiar "Oro" por "VIP", etc.
- **Color**: Color que representa el nivel en la interfaz

#### Ejemplo de Configuración Personalizada:
```
Nivel "Principiante": 0 pts, 1.0x multiplicador, color #cd7f32
Nivel "Frecuente": 300 pts, 1.15x multiplicador, color #c0c0c0  
Nivel "VIP": 800 pts, 1.3x multiplicador, color #ffd700
Nivel "Elite": 1500 pts, 1.5x multiplicador, color #b9f2ff
```

---

### 3. 🔖 **Configuración de Tarjetas NFC**

#### Formato de Tarjetas:
- **Prefijo personalizable**: NFC, CARD, REST, etc. (hasta 5 caracteres)
- **Longitud total**: Entre 8 y 20 caracteres
- **Ejemplo**: Con prefijo "REST" y longitud 12 → "REST12345678"

#### Configuración Técnica:
- **Tiempo de lectura**: Cuánto tiempo toma leer una tarjeta (500-5000ms)
- **Intentos máximos**: Cuántas veces reintenta antes de fallar (1-10)
- **Validación estricta**: Si debe validar el formato exacto

#### Especificaciones NFC:
- **Frecuencia**: 13.56 MHz (estándar NFC)
- **Protocolos soportados**: ISO14443A, ISO14443B, ISO15693
- **Rango de lectura**: Típicamente 2-5 cm

#### Ejemplo de Configuración:
```
Prefijo: "CAFE"
Longitud: 14 caracteres
Resultado: "CAFE1234567890"
Tiempo lectura: 2000ms
Intentos máx: 3
Validación: Estricta ✓
```

---

### 4. 🎉 **Sistema de Promociones**

#### Promociones Configurables:

**Puntos Dobles en Horarios Especiales:**
- Días de la semana activos (por defecto: sábados y domingos)
- Hora de inicio y fin (ej: 18:00 - 22:00)
- Duplica automáticamente los puntos ganados

**Bonus de Cumpleaños:**
- Puntos extra en el mes de cumpleaños
- Cantidad configurable (por defecto: 200 puntos)
- Se activa automáticamente

#### Ejemplo de Configuración:
```
Puntos Dobles: ✓ Activo
- Viernes, Sábado, Domingo
- 17:00 - 23:00
- Duplica puntos automáticamente

Bonus Cumpleaños: ✓ Activo  
- 500 puntos extra
- Se aplica todo el mes
```

---

### 5. 🔒 **Configuración de Seguridad**

#### Bloqueo de Tarjetas:
- **Intentos fallidos máximos**: Cuántas veces puede fallar la lectura
- **Tiempo de bloqueo**: Duración del bloqueo temporal (en minutos)
- **Desbloqueo automático**: Se desbloquea automáticamente al expirar

#### Validaciones:
- **Email**: Verificar formato válido (@domain.com)
- **Teléfono**: Validar formato según patrón configurado
- **Logs de transacciones**: Registrar todas las operaciones

#### Ejemplo de Configuración:
```
Bloqueo Tarjetas: ✓ Activo
- Máximo 3 intentos fallidos
- Bloqueo por 15 minutos
- Desbloqueo automático

Validaciones: 
- Email: ✓ Formato requerido
- Teléfono: ⚪ Opcional
- Logs: ✓ Registrar todo
```

---

## 🔧 Configuración Técnica Avanzada

### Personalización del Generador de IDs

El sistema puede generar IDs automáticamente según tu formato:

```javascript
// Configuración
Prefijo: "REST"
Longitud total: 16

// IDs generados automáticamente:
REST123456789012
REST987654321098  
REST456789012345
```

### Integración con Hardware Real

La configuración está preparada para integrarse con lectores NFC físicos:

```javascript
// Parámetros para integración
Frecuencia: 13.56 MHz
Protocolos: ISO14443A/B, ISO15693
Tiempo respuesta: Configurable (500-5000ms)
Alcance: 2-5 cm típico
```

---

## 📊 Monitoreo de Configuración

### Información en Tiempo Real

El sistema muestra el estado actual de la configuración:

- **Panel de estado**: Resumen de configuraciones activas
- **Alertas visuales**: Indica promociones activas, seguridad, etc.
- **Métricas**: Impacto de las configuraciones en las estadísticas

### Ejemplo de Estado Mostrado:
```
Configuración actual: 1.2 pts/$1 • Canje desde 100 pts • 
Formato: NFC############# • 🎉 Promociones ON
```

---

## 🚀 Casos de Uso Comunes

### 1. **Restaurante Casual**
```
Puntos: 1 pt/$1
Valor: $1 por punto  
Mínimo: 50 puntos
Niveles estándar con multiplicadores bajos (1.1x, 1.2x)
```

### 2. **Restaurante Premium**
```
Puntos: 2 pts/$1
Valor: $0.50 por punto
Mínimo: 200 puntos  
Niveles exclusivos con multiplicadores altos (1.3x, 1.8x)
```

### 3. **Cafetería**
```
Puntos: 5 pts/$1 (compras pequeñas)
Valor: $0.20 por punto
Mínimo: 100 puntos
Promociones en horarios específicos
```

### 4. **Cadena de Restaurantes**
```
Prefijo personalizado: "CHAIN"
Longitud: 18 caracteres
Seguridad estricta activada
Logs detallados para auditoría
```

---

## ⚠️ Consideraciones Importantes

### Cambios de Configuración:
- ✅ **Se aplican inmediatamente** al guardar
- ✅ **No afectan puntos existentes** de clientes
- ✅ **Solo nuevas transacciones** usan nueva configuración
- ⚠️ **Cambios de formato NFC** solo aplican a nuevas tarjetas

### Respaldo y Restauración:
- Las configuraciones se guardan localmente
- Usa "Restaurar Defecto" para volver a configuración original
- Exporta/importa configuraciones para múltiples instalaciones

### Rendimiento:
- Configuraciones complejas pueden afectar ligeramente el rendimiento
- Logs extensivos requieren más espacio de almacenamiento
- Validaciones estrictas pueden hacer más lento el registro

---

## 🎯 Mejores Prácticas

### Para Configurar Puntos:
1. **Comienza simple**: 1 punto = $1 gastado y canjeado
2. **Ajusta gradualmente** según comportamiento de clientes
3. **Monitorea métricas** para ver el impacto

### Para Configurar Niveles:
1. **Niveles alcanzables**: No hagas muy difícil subir de nivel
2. **Beneficios atractivos**: Multiplicadores que motiven
3. **Nombres descriptivos**: Que reflejen el estatus

### Para Configurar Seguridad:
1. **Balance usabilidad/seguridad**: No muy restrictivo
2. **Tiempos de bloqueo razonables**: 15-30 minutos máximo
3. **Logs habilitados**: Para auditoría y resolución de problemas

### Para Configurar Promociones:
1. **Horarios estratégicos**: Cuando quieras más clientes
2. **Promociones limitadas**: No siempre activas
3. **Comunica claramente**: Informa a clientes sobre promociones

---

¡Con esta configuración avanzada, tu sistema de puntos NFC será completamente personalizable y adaptable a las necesidades específicas de tu restaurante! 🎉