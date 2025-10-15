# 🚀 GUÍA COMPLETA DE DEPLOYMENT

## 📋 RESUMEN
- **Frontend**: Vercel (`https://restaurante-ivory.vercel.app`)
- **Backend**: Render/Railway (servidor separado)

## 🎯 PASO A PASO

### 1️⃣ PREPARAR BACKEND (Render.com - GRATIS)

1. **Crear cuenta en [Render.com](https://render.com)**
2. **Crear nuevo repositorio** solo para el backend:
   ```bash
   # Copiar carpeta /server a un nuevo repo
   ```
3. **Conectar repo a Render**:
   - Service: `Web Service`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`

4. **Variables de entorno en Render**:
   ```
   NODE_ENV=production
   PORT=10000
   ```

### 2️⃣ PREPARAR FRONTEND (Vercel)

1. **Subir proyecto a GitHub**
2. **Conectar repo a Vercel**
3. **Configurar variables de entorno**:
   ```
   VITE_API_URL=https://tu-app.onrender.com
   ```

### 3️⃣ CONFIGURACIÓN DE DOMINIOS

#### Backend URL (ejemplo):
```
https://restaurante-api-xyz.onrender.com
```

#### Frontend URL (tu objetivo):
```
https://restaurante-ivory.vercel.app
```

## 🔧 COMANDOS ÚTILES

### Construir para producción:
```bash
npm run build
```

### Probar build localmente:
```bash
npm run preview
```

## 📋 CHECKLIST DEPLOYMENT

- [ ] Backend deployado en Render
- [ ] Variables CORS configuradas
- [ ] Frontend deployado en Vercel
- [ ] Variable VITE_API_URL configurada
- [ ] Pruebas multi-dispositivo funcionando

## 💰 COSTOS
- **Vercel**: GRATIS (plan hobby)
- **Render**: GRATIS (750 horas/mes)
- **Total**: $0 USD/mes

## 🆘 TROUBLESHOOTING

### Error de CORS:
- Verificar que el dominio de Vercel esté en la configuración de CORS del backend

### Variables de entorno:
- Verificar que VITE_API_URL esté configurada correctamente

### Backend dormido:
- Render duerme las apps gratuitas después de 15 min de inactividad
- Primera carga puede tardar 30-60 segundos