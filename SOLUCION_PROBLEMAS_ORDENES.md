# 🔧 SOLUCIÓN DE PROBLEMAS COMUNES - ÓRDENES

## ❓ ¿QUÉ ESTÁ MAL?

Si algo no funciona, aquí están las soluciones más comunes:

---

## 🐛 PROBLEMA 1: El estado no se actualiza

### Síntomas:
- Cambias el estado pero no se guarda
- El estado vuelve al anterior después de guardar

### Solución:
1. Verifica que el estado esté seleccionado correctamente
2. Asegúrate de hacer click en "Guardar Cambios"
3. Revisa la consola del navegador (F12) para ver errores
4. Verifica que el backend esté corriendo (`http://localhost:3000`)

---

## 🐛 PROBLEMA 2: Error al guardar estado

### Síntomas:
- Aparece un error al hacer click en "Guardar Cambios"
- Mensaje: "Error al actualizar"

### Solución:
1. **Verifica que el backend esté corriendo:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Verifica la conexión:**
   - Abre `http://localhost:3000/api/orders`
   - Debería responder (aunque sea vacío)

3. **Revisa la consola del navegador (F12):**
   - Busca errores en rojo
   - Copia el mensaje de error completo

4. **Verifica las variables de entorno:**
   - `backend/.env` debe tener `SUPABASE_SERVICE_ROLE_KEY`
   - `backend/admin-panel/.env.local` debe tener `NEXT_PUBLIC_BACKEND_URL`

---

## 🐛 PROBLEMA 3: El formulario no aparece

### Síntomas:
- No ves la sección "Gestión de la Orden"
- La página carga pero no muestra el formulario

### Solución:
1. **Recarga la página (F5)**
2. **Verifica que la orden exista:**
   - Ve a `/ordenes` y verifica que la orden esté en la lista
3. **Revisa la consola del navegador:**
   - Busca errores de importación
   - Verifica que `OrderForm` esté importado correctamente

---

## 🐛 PROBLEMA 4: El estado se muestra incorrectamente

### Síntomas:
- El estado muestra código en lugar de texto (ej: "draft" en vez de "Borrador")
- El dropdown no muestra el estado actual

### Solución:
1. **Verifica que el estado sea válido:**
   - Debe ser uno de: `draft`, `sent`, `accepted`, `in_development`, `completed`, `cancelled`
2. **Recarga la página** para sincronizar

---

## 🐛 PROBLEMA 5: No puedo crear orden desde diagnóstico

### Síntomas:
- El botón "Crear Orden desde Diagnóstico" no aparece
- El modal no se abre

### Solución:
1. **Verifica el estado del diagnóstico:**
   - Debe ser "Cotizando", "Proyecto" o "Cerrado"
   - Si es "Nuevo" o "Contactado", cambia el estado primero

2. **Guarda los cambios del diagnóstico** antes de crear la orden

3. **Recarga la página** si el botón no aparece

---

## 🐛 PROBLEMA 6: Error al crear orden

### Síntomas:
- Error al hacer click en "Crear Orden"
- Mensaje de error en el modal

### Solución:
1. **Verifica que hayas seleccionado un template:**
   - El campo "Template de Solución" es obligatorio
   - Debe tener un valor seleccionado

2. **Verifica que el backend esté corriendo**

3. **Revisa la consola del navegador** para el error completo

---

## 🔍 CÓMO DIAGNOSTICAR PROBLEMAS

### Paso 1: Abre la Consola del Navegador
```
F12 → Pestaña "Console"
```

### Paso 2: Busca Errores
- Errores en rojo = problema crítico
- Advertencias en amarillo = posible problema

### Paso 3: Revisa la Red
```
F12 → Pestaña "Network"
```
- Busca requests a `/api/orders`
- Verifica el código de respuesta:
  - 200 = OK
  - 400 = Error del cliente (datos incorrectos)
  - 500 = Error del servidor (backend)

### Paso 4: Verifica el Backend
```
http://localhost:3000/api/orders
```
- Debería responder (aunque sea vacío)
- Si no responde, el backend no está corriendo

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de reportar un problema, verifica:

- [ ] Backend está corriendo (`http://localhost:3000`)
- [ ] Admin panel está corriendo (`http://localhost:3001`)
- [ ] Variables de entorno configuradas correctamente
- [ ] No hay errores en la consola del navegador
- [ ] La orden existe en la base de datos
- [ ] El estado es válido (uno de los 6 estados permitidos)
- [ ] Has recargado la página después de cambios

---

## 📞 SI NADA FUNCIONA

1. **Copia el error completo** de la consola del navegador
2. **Toma una captura de pantalla** del problema
3. **Describe qué estabas haciendo** cuando ocurrió el error
4. **Verifica los logs del backend** en la terminal

---

## 🛠️ SOLUCIONES RÁPIDAS

### Reiniciar Todo:
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Admin Panel
cd backend/admin-panel
npm run dev
```

### Limpiar Caché:
- Ctrl + Shift + R (recarga forzada)
- O F12 → Click derecho en recargar → "Vaciar caché y recargar"

### Verificar Base de Datos:
- Ve a Supabase Dashboard
- Verifica que las tablas `orders` y `diagnosticos` existan
- Verifica que haya datos

---

**¿Qué error específico estás viendo?** Comparte el mensaje de error completo para ayudarte mejor.
