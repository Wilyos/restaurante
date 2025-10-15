# 🚀 DEPLOYMENT EN VERCEL (FULL-STACK)

## ✨ **VENTAJAS DE ESTA CONFIGURACIÓN**

- **Frontend + Backend en el mismo dominio**: Sin problemas de CORS
- **Serverless Functions**: Escalado automático y cero configuración
- **Deploy automático**: Cada push a GitHub despliega automáticamente
- **Gratis**: Hasta 100GB bandwidth y 100GB-hrs compute/mes
- **Rápido**: CDN global de Vercel

## 🏗️ **ARQUITECTURA**

```
https://restaurante-ivory.vercel.app/
├── / (Frontend React)
├── /api/health (Health check)
├── /api/auth/login (Login)
├── /api/users (Gestión usuarios)
├── /api/clientes (Gestión clientes NFC)
├── /api/transacciones (Puntos y canjes)
├── /api/configuracion (Configuración sistema)
└── /api/estadisticas (Dashboard datos)
```

## 📋 **PASOS PARA DEPLOYMENT**

### **1. Preparar el proyecto**
```bash
# Construir para producción
npm run build

# Probar localmente (opcional)
npm run preview
```

### **2. Subir a GitHub**
```bash
git add .
git commit -m "feat: Configuración completa para Vercel"
git push origin main
```

### **3. Desplegar en Vercel**

1. **Ir a [vercel.com](https://vercel.com)**
2. **Conectar con GitHub**
3. **Importar el repositorio `restaurante`**
4. **Configurar proyecto**:
   - **Framework**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Configurar variables de entorno**:
   ```
   VITE_API_URL=https://restaurante-ivory.vercel.app
   ```

6. **Deploy** 🚀

### **4. Verificar funcionamiento**

Una vez desplegado, probar:
- ✅ Frontend: `https://restaurante-ivory.vercel.app`
- ✅ API Health: `https://restaurante-ivory.vercel.app/api/health`
- ✅ Login: POST a `https://restaurante-ivory.vercel.app/api/auth/login`

## 🔧 **CONFIGURACIÓN AVANZADA**

### **Dominios personalizados**
En Vercel → Settings → Domains → Add custom domain

### **Variables de entorno adicionales**
```env
NODE_ENV=production
VERCEL_ENV=production
```

### **Funciones con más memoria/timeout**
```json
// vercel.json
"functions": {
  "api/**/*.js": {
    "runtime": "nodejs18.x",
    "maxDuration": 10
  }
}
```

## 📊 **PERSISTENCIA DE DATOS**

### **Actual: Memoria (Temporal)**
- Los datos se reinician con cada deploy
- Perfecto para demos y desarrollo

### **Opción 1: Vercel KV (Recomendado)**
```bash
# Instalar Vercel KV
npm install @vercel/kv
```

### **Opción 2: MongoDB Atlas (Gratuito)**
```bash
# Instalar MongoDB
npm install mongodb
```

### **Opción 3: Supabase (Gratuito)**
```bash
# Instalar Supabase
npm install @supabase/supabase-js
```

## 🎯 **RESULTADO ESPERADO**

✅ **URL única**: `https://restaurante-ivory.vercel.app`
✅ **Frontend + API en el mismo dominio**
✅ **Deploy automático con cada commit**
✅ **Escalado automático**
✅ **SSL certificado automático**
✅ **CDN global**

## 💡 **PRÓXIMOS PASOS**

1. **Probar deployment** siguiendo los pasos
2. **Configurar persistencia real** (KV, MongoDB, etc.)
3. **Añadir monitoring** (Vercel Analytics)
4. **Configurar dominio personalizado** (opcional)

¿Necesitas ayuda con algún paso específico? 🤔