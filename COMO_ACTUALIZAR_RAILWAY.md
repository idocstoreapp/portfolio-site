# 🚀 CÓMO ACTUALIZAR CÓDIGO EN RAILWAY

## 📋 RESUMEN RÁPIDO

Railway se conecta automáticamente a tu repositorio de GitHub. Cada vez que haces `git push`, Railway detecta los cambios y despliega automáticamente.

---

## 🔄 PROCESO AUTOMÁTICO

### **1. Hacer Cambios en el Código**

```bash
# En tu máquina local
cd backend
# Haz tus cambios en el código
```

### **2. Commit y Push a GitHub**

```bash
# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "Actualizar lógica de órdenes: agregar validación de fechas"

# Push a GitHub
git push origin main
```

### **3. Railway Detecta y Despliega Automáticamente**

- ✅ Railway detecta el nuevo commit en GitHub
- ✅ Inicia un nuevo build automáticamente
- ✅ Instala dependencias (`npm install`)
- ✅ Compila el proyecto (`npm run build`)
- ✅ Reinicia el servidor con el nuevo código
- ✅ Tu backend queda actualizado

**Tiempo estimado:** 2-5 minutos

---

## 📊 VERIFICAR EL DESPLIEGUE

### **En Railway:**

1. Ve a [railway.app](https://railway.app)
2. Selecciona tu proyecto backend
3. Ve a la pestaña **"Deployments"**
4. Verás el historial de despliegues:
   - ✅ Verde = Desplegado correctamente
   - ⚠️ Amarillo = En progreso
   - ❌ Rojo = Error

### **En los Logs:**

1. En Railway, ve a la pestaña **"Logs"**
2. Verás el proceso de build en tiempo real:
   ```
   Installing dependencies...
   Building project...
   Starting server...
   ```

---

## 🔧 CONFIGURACIÓN MANUAL (Si es necesario)

### **Forzar Re-despliegue:**

Si necesitas forzar un re-despliegue sin hacer cambios:

1. Ve a Railway → Tu proyecto
2. Click en **"Settings"**
3. Scroll hasta **"Deploy"**
4. Click en **"Redeploy"**

### **Cambiar Branch:**

Si trabajas en una rama diferente:

1. Ve a Railway → Tu proyecto
2. Click en **"Settings"**
3. En **"Source"**, selecciona la rama que quieres desplegar
4. Railway desplegará automáticamente esa rama

---

## ⚙️ VARIABLES DE ENTORNO

Si cambias variables de entorno:

1. Ve a Railway → Tu proyecto
2. Click en **"Variables"**
3. Agrega o modifica variables
4. Railway reiniciará automáticamente con las nuevas variables

**No necesitas hacer push** - Los cambios se aplican inmediatamente.

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error: Build Fallido**

**Síntomas:**
- El despliegue muestra ❌ rojo
- Los logs muestran errores de compilación

**Solución:**
1. Revisa los logs en Railway
2. Corrige el error en tu código local
3. Haz `git push` de nuevo
4. Railway intentará desplegar automáticamente

### **Error: Servidor No Inicia**

**Síntomas:**
- Build exitoso pero el servidor no responde

**Solución:**
1. Verifica que `package.json` tenga el script `start:prod`
2. Verifica que el puerto esté configurado correctamente
3. Revisa los logs para ver el error específico

### **Cambios No Se Aplican**

**Síntomas:**
- Hiciste push pero Railway no detecta cambios

**Solución:**
1. Verifica que el push fue exitoso en GitHub
2. Ve a Railway → Deployments y verifica que hay un nuevo deployment
3. Si no, haz click en "Redeploy" manualmente

---

## 📝 MEJORES PRÁCTICAS

### **1. Commits Descriptivos**

```bash
# ✅ Bueno
git commit -m "Agregar validación de fechas en órdenes"
git commit -m "Corregir cálculo de precios de módulos"

# ❌ Malo
git commit -m "cambios"
git commit -m "fix"
```

### **2. Probar Localmente Primero**

Antes de hacer push:

```bash
# Probar que compile
npm run build

# Probar que funcione
npm run start:prod
```

### **3. Usar Branches para Features Grandes**

```bash
# Crear branch para feature
git checkout -b feature/nueva-funcionalidad

# Trabajar en el branch
# ... hacer cambios ...

# Push del branch
git push origin feature/nueva-funcionalidad

# Railway puede desplegar el branch si lo configuras
```

---

## 🎯 FLUJO COMPLETO DE ACTUALIZACIÓN

```
┌─────────────────────────────────────────┐
│  1. Hacer cambios en código local       │
│     cd backend                          │
│     # Editar archivos...                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  2. Commit y Push                       │
│     git add .                           │
│     git commit -m "Descripción"         │
│     git push origin main                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  3. GitHub recibe el push               │
│     ✅ Código actualizado en GitHub      │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  4. Railway detecta cambios             │
│     ✅ Inicia build automático           │
│     ✅ Instala dependencias              │
│     ✅ Compila proyecto                  │
│     ✅ Reinicia servidor                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  5. Backend actualizado                  │
│     ✅ Nuevo código en producción        │
│     ✅ Servidor corriendo                │
└─────────────────────────────────────────┘
```

---

## ⏱️ TIEMPOS ESTIMADOS

- **Push a GitHub:** 5-10 segundos
- **Railway detecta cambios:** 10-30 segundos
- **Build y despliegue:** 2-5 minutos
- **Total:** ~3-6 minutos

---

## ✅ CHECKLIST DE ACTUALIZACIÓN

- [ ] Cambios probados localmente
- [ ] Código commiteado con mensaje descriptivo
- [ ] Push a GitHub exitoso
- [ ] Railway detecta el nuevo deployment
- [ ] Build exitoso (verde en Railway)
- [ ] Servidor responde correctamente
- [ ] Probar endpoint en producción

---

## 🆘 AYUDA ADICIONAL

**Documentación de Railway:**
- https://docs.railway.app/deploy/builds
- https://docs.railway.app/deploy/deployments

**Soporte:**
- Railway tiene soporte en Discord
- O revisa los logs en Railway para errores específicos

---

**En resumen:** Solo haz `git push` y Railway hace el resto automáticamente. 🚀
