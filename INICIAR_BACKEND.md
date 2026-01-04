# 🚀 CÓMO INICIAR EL BACKEND

## ⚠️ IMPORTANTE

El diagnóstico **requiere que el backend Nest.js esté corriendo**. Si ves el error "Servidor Backend No Disponible", sigue estos pasos:

---

## 📋 Pasos para Iniciar el Backend

### **Paso 1: Abrir una Nueva Terminal**

Abre una **nueva terminal** (no cierres la terminal donde corre el frontend Astro).

### **Paso 2: Navegar a la Carpeta Backend**

```bash
cd backend
```

### **Paso 3: Instalar Dependencias (Solo la Primera Vez)**

Si es la primera vez que ejecutas el backend:

```bash
npm install
```

### **Paso 4: Configurar Variables de Entorno**

Crea el archivo `.env` en la carpeta `backend/`:

```bash
# En Windows (PowerShell)
Copy-Item .env.example .env

# En Mac/Linux
cp .env.example .env
```

Luego edita `.env` y completa:
```env
PORT=3000
CORS_ORIGIN=http://localhost:4322
SUPABASE_URL=tu_url_de_supabase
SUPABASE_KEY=tu_service_role_key_de_supabase
NODE_ENV=development
```

### **Paso 5: Iniciar el Backend**

```bash
npm run start:dev
```

Deberías ver:
```
🚀 Backend API running on: http://localhost:3000/api
```

### **Paso 6: Verificar que Funciona**

Abre en tu navegador:
```
http://localhost:3000/api
```

Deberías ver una respuesta JSON (puede ser un error 404, pero significa que el servidor está corriendo).

---

## ✅ Verificación Rápida

**El backend está corriendo correctamente si:**
- ✅ Ves el mensaje: `🚀 Backend API running on: http://localhost:3000/api`
- ✅ No hay errores en la terminal
- ✅ Puedes acceder a `http://localhost:3000/api` en el navegador

---

## 🔧 Solución de Problemas

### **Error: "Cannot find module '@nestjs/core'"**

**Solución:**
```bash
cd backend
npm install
```

### **Error: "Port 3000 is already in use"**

**Solución:**
1. Busca qué proceso está usando el puerto 3000
2. Cierra ese proceso
3. O cambia el puerto en `backend/.env`: `PORT=3001`

### **Error: "SUPABASE_URL is not defined"**

**Solución:**
1. Crea el archivo `backend/.env`
2. Agrega las variables de entorno (ver Paso 4)

### **Error: "CORS policy"**

**Solución:**
1. Verifica que `CORS_ORIGIN` en `backend/.env` sea `http://localhost:4322`
2. Reinicia el backend después de cambiar `.env`

---

## 📝 Notas

- **Mantén el backend corriendo** mientras uses el diagnóstico
- **No cierres la terminal** donde corre el backend
- **El frontend y el backend deben correr simultáneamente**:
  - Terminal 1: Frontend (`npm run dev`)
  - Terminal 2: Backend (`cd backend && npm run start:dev`)

---

## 🎯 Comandos Rápidos

```bash
# Iniciar backend (desde la raíz del proyecto)
cd backend && npm run start:dev

# O si ya estás en la carpeta backend:
npm run start:dev
```

---

## ✅ Checklist

- [ ] Backend instalado (`npm install` en `backend/`)
- [ ] Archivo `.env` creado en `backend/`
- [ ] Variables de entorno configuradas
- [ ] Backend corriendo (`npm run start:dev`)
- [ ] Mensaje de éxito visible: `🚀 Backend API running on: http://localhost:3000/api`
- [ ] Frontend también corriendo en otra terminal

---

**Una vez que el backend esté corriendo, vuelve al diagnóstico y recarga la página.**


