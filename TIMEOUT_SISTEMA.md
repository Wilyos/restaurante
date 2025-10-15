# Sistema de Timeout de Sesión - Documentación

## 🔒 Sistema de Seguridad por Inactividad Implementado

Se ha implementado un sistema completo de timeout de sesión por inactividad para mejorar la seguridad del sistema NFC del restaurante.

## 🚀 Componentes Implementados

### 1. **Hook de Inactividad** (`src/hooks/useInactivityTimer.js`)
```javascript
// Funcionalidades principales:
- useInactivityTimer(): Timer básico de inactividad
- useInactivityWithWarning(): Timer con advertencias previas

// Eventos monitoreados:
- mousedown, mousemove, keypress, scroll
- touchstart, click, keydown

// Configuraciones:
- Timeout personalizable (por defecto 30 minutos)
- Advertencia previa (por defecto 5 minutos antes)
- Throttling para evitar resets excesivos
```

### 2. **Diálogo de Advertencia** (`src/components/InactivityWarningDialog.jsx`)
- **Interfaz Visual**: Diálogo modal con countdown
- **Progreso Visual**: Barra de progreso y estados de urgencia
- **Acciones**: Extender sesión o cerrar manualmente
- **Estados de Color**:
  - 🟢 Verde: Más de 2 minutos restantes
  - 🟠 Naranja: Entre 1-2 minutos
  - 🔴 Rojo: Menos de 1 minuto

### 3. **Timer de Sesión** (`src/components/SessionTimer.jsx`)
- **Indicador Visual**: Chip en la barra superior
- **Estados de Sesión**:
  - ✅ **Activa**: Más de 10 minutos restantes
  - ⚠️ **Advertencia**: 5-10 minutos restantes
  - 🚨 **Crítica**: Menos de 5 minutos
  - ❌ **Expirada**: Sesión terminada
- **Tooltip Informativo**: Explica el estado actual

### 4. **Configuración Avanzada** (`src/components/ConfiguracionTimeout.jsx`)
- **Presets Rápidos**:
  - 5 minutos (Muy seguro - Terminales públicas)
  - 15 minutos (Seguro - Uso compartido)
  - 30 minutos (Equilibrado - Recomendado) ⭐
  - 1 hora (Cómodo - Uso personal)
  - 2 horas (Extendido - Jornadas largas)
  - Sin timeout (Solo desarrollo - No recomendado)
- **Configuración Personalizada**: Segundos, minutos u horas
- **Tiempo de Advertencia**: Configurable de 30s a 10 minutos

## 🔧 Integración en el Sistema

### **AuthContext Actualizado** (`src/context/AuthContext.jsx`)
```javascript
// Nuevas funcionalidades:
- Hook de inactividad integrado
- Manejo automático de timeout
- Diálogo de advertencia automático
- Extensión de sesión
- Cierre automático por inactividad
```

### **Layout Mejorado** (`src/components/Layout.jsx`)
```javascript
// Timer visible en barra superior:
- Indicador de tiempo restante
- Estados visuales de la sesión
- Tooltip con información de seguridad
```

### **Nueva Pestaña en Configuración**
- **Ubicación**: Configuración NFC → Pestaña "Timeout"
- **Acceso**: Solo para administradores
- **Funciones**: Configuración completa del sistema de timeout

## ⚙️ Configuración por Defecto

```javascript
const DEFAULT_CONFIG = {
  sessionTimeout: 30 * 60 * 1000,  // 30 minutos
  warningTime: 5 * 60 * 1000,      // 5 minutos de advertencia
  enabled: true,                    // Habilitado por defecto
  customTimeout: false              // Usar presets por defecto
};
```

## 🎯 Cómo Funciona el Sistema

### **1. Detección de Actividad**
- Monitorea continuamente la actividad del usuario
- Eventos: clicks, movimiento del mouse, teclas, scroll, touch
- Throttling de 1 segundo para evitar exceso de procesamiento

### **2. Timer de Inactividad**
- Se resetea con cada actividad del usuario
- Cuenta regresiva desde el tiempo configurado
- Ejecuta advertencia cuando quedan 5 minutos (configurable)

### **3. Advertencia de Timeout**
- Diálogo modal con countdown visual
- Opciones: "Continuar Sesión" o "Cerrar Sesión"
- Progreso visual y estados de urgencia por color

### **4. Cierre Automático**
- Si no hay respuesta a la advertencia
- Logout automático y redirección al login
- Limpieza de datos de sesión

## 🛡️ Características de Seguridad

### **Protección Multicapa**
- ✅ **Timeout por Inactividad**: Cierre automático
- ✅ **Advertencias Visuales**: Usuario informado
- ✅ **Configuración Flexible**: Adaptable al contexto
- ✅ **Estados Visuales**: Feedback constante
- ✅ **Limpieza de Sesión**: Logout completo

### **Casos de Uso**
- 🏪 **Terminal Compartida**: 5-15 minutos (seguridad alta)
- 👤 **Uso Personal**: 30 minutos - 1 hora (equilibrado)
- 🏢 **Oficina Privada**: 1-2 horas (comodidad)
- 🚫 **Desarrollo**: Sin timeout (solo testing)

## 📱 Interfaz de Usuario

### **Indicador en Tiempo Real**
```
[🕒 25m 30s] ← Timer siempre visible
    ↳ Verde: Sesión activa
    ↳ Naranja: Próxima a expirar  
    ↳ Rojo: Crítica
```

### **Diálogo de Advertencia**
```
⚠️ Sesión por Expirar        [🕒 4:30]
───────────────────────────────────────
Su sesión expirará por inactividad

Tiempo restante: ████████░░ 4:30

Para mantener su sesión activa:
• Haga clic en "Continuar Sesión"
• Mueva el mouse o toque la pantalla

[Cerrar Sesión] [Continuar Sesión]
```

## 🎮 Para Usar el Sistema

### **1. Configuración Inicial**
- Ve a: **Configuración NFC → Pestaña "Timeout"**
- Selecciona preset o configura tiempo personalizado
- Ajusta tiempo de advertencia
- Guarda configuración

### **2. Durante el Uso**
- El timer se muestra en la barra superior
- Observa los cambios de color para el estado
- Responde a las advertencias cuando aparezcan

### **3. Extensión de Sesión**
- Haz clic en "Continuar Sesión" en el diálogo
- Realiza cualquier actividad (click, tecla, movimiento)
- El timer se resetea automáticamente

## ⚡ Optimizaciones Implementadas

### **Performance**
- **Throttling**: Evita resets excesivos (1 segundo)
- **Event Delegation**: Listeners eficientes
- **Memory Management**: Limpieza automática de timers

### **UX/UI**
- **Estados Visuales**: Colores intuitivos
- **Feedback Inmediato**: Timer siempre visible  
- **Advertencias Progresivas**: Del verde al rojo
- **Acciones Claras**: Botones descriptivos

## 🔐 Configuraciones Recomendadas por Contexto

| Contexto | Timeout | Advertencia | Justificación |
|----------|---------|-------------|---------------|
| **Caja/Terminal Público** | 5-15 min | 1-2 min | Máxima seguridad |
| **Oficina Compartida** | 30 min | 5 min | Equilibrio seguridad/comodidad |
| **Administración** | 1 hora | 10 min | Comodidad para tareas largas |
| **Desarrollo** | Deshabilitado | N/A | Solo para testing |

---

## ✅ Sistema Completamente Funcional

El sistema de timeout de sesión está completamente implementado y listo para usar. Proporciona seguridad robusta manteniendo la usabilidad y permitiendo configuración flexible según las necesidades del restaurante.

**🎯 Beneficios Principales:**
- ✅ Seguridad automática por inactividad
- ✅ Interfaz intuitiva y responsive  
- ✅ Configuración flexible y granular
- ✅ Advertencias claras y progresivas
- ✅ Integración transparente con el sistema existente