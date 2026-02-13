# ✏️ CÓMO EDITAR UNA ORDEN COMPLETA

## ✅ PROBLEMA RESUELTO

Ahora puedes editar **TODOS** los campos de una orden después de crearla desde un diagnóstico.

---

## 📍 DÓNDE EDITAR LA ORDEN

### **Paso 1: Ve al Detalle de la Orden**

```
Admin Panel → Órdenes → Click en la orden que quieres editar
```

### **Paso 2: Busca el Botón "✏️ Editar Orden"**

En la sección **"Gestión de la Orden"** al inicio de la página:

```
┌─────────────────────────────────────┐
│  Gestión de la Orden                 │
│                                       │
│  Estado actual: Borrador             │
│                                       │
│  [✏️ Editar Orden]                   │
└─────────────────────────────────────┘
```

### **Paso 3: Click en "✏️ Editar Orden"**

Se expande un formulario completo con todas las secciones editables.

---

## 📋 QUÉ PUEDES EDITAR

### **1. Estado de la Orden**
- Cambiar entre: Borrador, Enviada, Aceptada, En Desarrollo, Completada, Cancelada

### **2. Descripción del Alcance**
- Texto completo del alcance del proyecto
- Qué se incluye y qué no

### **3. Características Personalizadas**
- Funcionalidades adicionales acordadas
- Personalizaciones específicas

### **4. Aspectos Económicos**
- **Precio Base:** Precio base del template
- **Precio de Módulos:** Suma de módulos seleccionados
- **Ajustes Personalizados:** Montos adicionales
- **Descuento:** Descuento aplicado
- **Total:** Se calcula automáticamente (puedes sobrescribir)

### **5. Términos de Pago**
- Cómo y cuándo se paga
- Porcentajes y fechas
- Ejemplo: "50% al inicio, 50% al finalizar"

### **6. Fechas Estimadas**
- **Fecha de Inicio:** Cuándo empieza el proyecto
- **Fecha de Finalización:** Cuándo termina

### **7. Términos Legales**
- **Garantía:** Texto de garantía del proyecto
- **Política de Mantenimiento:** Qué incluye el mantenimiento
- **Exclusiones:** Qué NO está incluido

### **8. Notas**
- **Notas Internas:** Solo para ti y tu equipo
- **Notas para el Cliente:** Visibles en el contrato PDF

---

## 🎯 CASO DE USO: Completar Orden desde Diagnóstico

### **Escenario:**
Creaste una orden desde un diagnóstico, pero necesitas agregar:
- Términos de pago específicos
- Garantías detalladas
- Fechas estimadas
- Ajustes de precio

### **Pasos:**

1. **Crea la orden desde diagnóstico**
   - Ve al diagnóstico
   - Click en "Crear Orden desde Diagnóstico"
   - Selecciona template y módulos
   - Click en "Crear Orden"
   - **Resultado:** Orden creada en estado "Borrador"

2. **Ve al detalle de la orden**
   - Te redirige automáticamente
   - O ve a `/ordenes` y busca la orden

3. **Click en "✏️ Editar Orden"**

4. **Completa los campos faltantes:**

   **Términos de Pago:**
   ```
   50% ($450,000 CLP) al inicio del proyecto
   50% ($450,000 CLP) al finalizar y entregar
   ```

   **Garantía:**
   ```
   3 meses de garantía en todas las funcionalidades desarrolladas.
   Soporte técnico incluido por 1 mes después de la entrega.
   ```

   **Política de Mantenimiento:**
   ```
   Soporte técnico incluido por 1 mes.
   Actualizaciones de seguridad incluidas por 3 meses.
   Modificaciones adicionales se cotizan por separado.
   ```

   **Exclusiones:**
   ```
   No incluye hosting ni dominio.
   No incluye capacitación presencial.
   No incluye cambios mayores después de la aprobación del diseño.
   ```

   **Fechas Estimadas:**
   - Inicio: Selecciona fecha
   - Finalización: Selecciona fecha (ej: 4 semanas después)

   **Ajustes de Precio (si es necesario):**
   - Si hay algo extra: Agrega en "Ajustes Personalizados"
   - Si hay descuento: Agrega en "Descuento"
   - El total se recalcula automáticamente

5. **Click en "Guardar Cambios"**

6. **Genera el PDF del contrato**
   - Click en "📄 Generar Contrato PDF"
   - El PDF incluirá TODA la información que acabas de agregar

---

## 💡 MEJORES PRÁCTICAS

### **1. Completa la Orden Antes de Enviar**

**❌ Mal:**
- Crear orden → Generar PDF → Enviar (falta información)

**✅ Bien:**
- Crear orden → Editar y completar → Generar PDF → Enviar

---

### **2. Usa Términos Claros y Específicos**

**❌ Mal:**
```
Garantía: "Garantía estándar"
```

**✅ Bien:**
```
Garantía: "3 meses de garantía en todas las funcionalidades desarrolladas. 
Cubre corrección de bugs y problemas de funcionamiento. 
No cubre cambios de diseño ni nuevas funcionalidades."
```

---

### **3. Define Fechas Realistas**

- Considera el tiempo de desarrollo real
- Agrega buffer para imprevistos
- Comunica claramente al cliente

---

### **4. Detalla las Exclusiones**

**Importante:** Especifica claramente qué NO está incluido para evitar malentendidos.

**Ejemplo:**
```
Exclusiones:
- No incluye hosting ni dominio
- No incluye capacitación presencial
- No incluye cambios mayores después de aprobación
- No incluye integraciones con sistemas externos
```

---

### **5. Calcula Precios Correctamente**

El sistema calcula automáticamente:
```
Total = Precio Base + Módulos + Ajustes - Descuento
```

Puedes sobrescribir el total manualmente si es necesario.

---

## 📊 VISTA DEL FORMULARIO

```
┌─────────────────────────────────────┐
│  Editar Orden                    [✕]│
├─────────────────────────────────────┤
│                                     │
│  Estado: [Borrador ▼]              │
│                                     │
│  Descripción del Alcance:           │
│  [Textarea grande...]               │
│                                     │
│  Características Personalizadas:    │
│  [Textarea...]                      │
│                                     │
│  ────────────────────────────────  │
│  Aspectos Económicos:               │
│  Precio Base: [$500,000]            │
│  Módulos: [$350,000]                │
│  Ajustes: [$50,000]                 │
│  Descuento: [$0]                    │
│  Total: [$900,000]                  │
│                                     │
│  ────────────────────────────────  │
│  Términos de Pago:                  │
│  [Textarea...]                      │
│                                     │
│  ────────────────────────────────  │
│  Fechas Estimadas:                  │
│  Inicio: [Fecha]                    │
│  Finalización: [Fecha]              │
│                                     │
│  ────────────────────────────────  │
│  Términos Legales:                  │
│  Garantía: [Textarea...]            │
│  Mantenimiento: [Textarea...]       │
│  Exclusiones: [Textarea...]          │
│                                     │
│  ────────────────────────────────  │
│  Notas:                             │
│  Internas: [Textarea...]             │
│  Cliente: [Textarea...]              │
│                                     │
│  [Cancelar] [Guardar Cambios]       │
└─────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO RECOMENDADO

```
1. Cliente completa diagnóstico
         ↓
2. Tú creas orden desde diagnóstico
         ↓
3. Orden queda en "Borrador"
         ↓
4. Click "✏️ Editar Orden"
         ↓
5. Completa TODOS los campos:
   - Términos de pago
   - Garantías
   - Fechas
   - Exclusiones
   - Ajustes de precio
         ↓
6. Guarda cambios
         ↓
7. Genera PDF del contrato
         ↓
8. Cambia estado a "Enviada"
         ↓
9. Envía PDF al cliente
```

---

## ❓ PREGUNTAS FRECUENTES

### ¿Puedo editar una orden después de enviarla?

**Sí.** Puedes editar cualquier campo en cualquier momento. Sin embargo:
- Si ya enviaste el PDF, considera crear una nueva versión
- O actualiza la orden y regenera el PDF

### ¿Los cambios se reflejan en el PDF?

**Sí.** Después de editar y guardar:
1. Genera un nuevo PDF
2. El PDF incluirá todos los cambios que hiciste

### ¿Puedo cambiar los módulos incluidos?

**Actualmente:** Los módulos se muestran pero no se pueden editar desde el formulario.
**Próximamente:** Se agregará la funcionalidad para editar módulos.

### ¿Qué pasa si cambio el precio después de enviar?

**Puedes hacerlo**, pero:
- Considera comunicar el cambio al cliente
- Regenera el PDF con el nuevo precio
- Actualiza el estado si es necesario

---

## ✅ RESUMEN

1. **Ve a la orden** (`/ordenes/[id]`)
2. **Click en "✏️ Editar Orden"**
3. **Completa todos los campos** que faltan
4. **Guarda cambios**
5. **Genera PDF** con toda la información completa

---

**¡Ahora puedes completar tus órdenes con toda la información necesaria!** 🚀
