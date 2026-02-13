# 📋 POR QUÉ LA ORDEN QUEDA EN BORRADOR Y CÓMO CAMBIAR EL ESTADO

## ❓ ¿POR QUÉ QUEDA EN BORRADOR?

### Es el Comportamiento Normal ✅

Cuando creas una orden (desde diagnóstico o manualmente), **siempre empieza en estado "Borrador"** por diseño.

**Razones:**
1. ✅ Te permite revisar y editar antes de enviar
2. ✅ Evita enviar órdenes incompletas por error
3. ✅ Te da control sobre cuándo marcar como "Enviada"
4. ✅ Flujo profesional: Borrador → Enviada → Aceptada → En Desarrollo → Completada

---

## 🔄 FLUJO DE ESTADOS DE UNA ORDEN

```
[Borrador] ──→ [Enviada] ──→ [Aceptada] ──→ [En Desarrollo] ──→ [Completada]
    │              │              │                │                  │
    │              │              │                │                  │
    └──────────────┴──────────────┴────────────────┴──────────────────┘
                              Puede cancelar en cualquier momento
```

### Estados Explicados:

1. **Borrador (Draft)** 🟡
   - Orden recién creada
   - Puedes editarla libremente
   - No se ha enviado al cliente

2. **Enviada (Sent)** 🔵
   - Ya enviaste la propuesta al cliente
   - Esperando respuesta del cliente
   - Puedes seguir editando si es necesario

3. **Aceptada (Accepted)** 🟢
   - Cliente aceptó la propuesta
   - Lista para comenzar desarrollo
   - Puedes empezar a trabajar

4. **En Desarrollo (In Development)** 🟣
   - Proyecto en curso
   - Estás desarrollando activamente
   - Puedes actualizar notas y avances

5. **Completada (Completed)** ✅
   - Proyecto terminado y entregado
   - Cliente tiene el producto final
   - Puedes generar manual de usuario

6. **Cancelada (Cancelled)** 🔴
   - Cliente canceló o no procedió
   - Proyecto no se realizará
   - Se mantiene registro histórico

---

## 📍 DÓNDE CAMBIAR EL ESTADO

### Opción 1: En el Detalle de la Orden (RECOMENDADO)

**Pasos:**

1. **Ve a la orden:**
   ```
   Admin Panel → Órdenes → Click en la orden que quieres cambiar
   ```

2. **Busca la sección "Gestión de la Orden":**
   ```
   ┌─────────────────────────────────────┐
   │  Gestión de la Orden                 │
   │                                       │
   │  Estado de la Orden:                 │
   │  [Borrador ▼]                        │
   │                                       │
   │  [Guardar Cambios]                   │
   └─────────────────────────────────────┘
   ```

3. **Selecciona el nuevo estado:**
   - Click en el dropdown
   - Selecciona el estado que quieres
   - Ejemplo: "Enviada"

4. **Click en "Guardar Cambios"**

**Resultado:** ✅ Estado actualizado

---

### Opción 2: Desde la Lista de Órdenes (Próximamente)

**Actualmente no disponible**, pero será agregado en futuras mejoras.

---

## 🎯 CASOS DE USO COMUNES

### Caso 1: Crear Orden y Enviarla Inmediatamente

**Escenario:** Creaste la orden y quieres enviarla al cliente ahora mismo.

**Pasos:**
1. Crea la orden (queda en "Borrador")
2. Ve al detalle de la orden
3. Cambia estado a **"Enviada"**
4. Guarda cambios
5. (Próximamente) Genera PDF del contrato
6. Envía el PDF al cliente por email

---

### Caso 2: Cliente Acepta la Propuesta

**Escenario:** El cliente aceptó la propuesta y quieres empezar a trabajar.

**Pasos:**
1. Ve al detalle de la orden
2. Cambia estado a **"Aceptada"**
3. Guarda cambios
4. Ahora puedes cambiar a **"En Desarrollo"** cuando empieces

---

### Caso 3: Empezar el Desarrollo

**Escenario:** Ya tienes todo listo y empiezas a desarrollar.

**Pasos:**
1. Ve al detalle de la orden
2. Cambia estado a **"En Desarrollo"**
3. Guarda cambios
4. Actualiza notas con avances mientras desarrollas

---

### Caso 4: Finalizar el Proyecto

**Escenario:** Terminaste el proyecto y lo entregaste al cliente.

**Pasos:**
1. Ve al detalle de la orden
2. Cambia estado a **"Completada"**
3. Guarda cambios
4. (Próximamente) Genera manual de usuario PDF
5. Entrégalo al cliente

---

## 💡 MEJORES PRÁCTICAS

### 1. **No Envíes Borradores**

**❌ Mal:**
- Crear orden → Enviar al cliente sin cambiar estado

**✅ Bien:**
- Crear orden → Revisar → Cambiar a "Enviada" → Enviar al cliente

---

### 2. **Actualiza Estados Según Avance**

**Flujo recomendado:**
```
Borrador → Enviada → Aceptada → En Desarrollo → Completada
```

**No saltes estados** a menos que sea necesario.

---

### 3. **Usa Notas para Contexto**

Cuando cambies el estado, agrega notas si es necesario:
- "Enviada el 15 de enero por email"
- "Cliente aceptó el 20 de enero"
- "Inicio de desarrollo el 25 de enero"

---

### 4. **Mantén Estados Actualizados**

**Beneficios:**
- ✅ Sabes exactamente en qué etapa está cada proyecto
- ✅ Puedes filtrar órdenes por estado
- ✅ Generas reportes precisos
- ✅ Mejoras tu flujo de trabajo

---

## 🔍 DÓNDE VER EL ESTADO ACTUAL

### En la Lista de Órdenes:

```
┌─────────────────────────────┐
│ ORD-2024-001                │
│ Gourmet Árabe               │
│ 💰 $900,000 CLP             │
│ [Borrador] ← Estado aquí    │
└─────────────────────────────┘
```

### En el Detalle de la Orden:

```
┌─────────────────────────────────────┐
│  Información General                │
│  • Número: ORD-2024-001            │
│  • Estado: [Borrador] ← Aquí       │
│  • Tipo: Sistema                   │
└─────────────────────────────────────┘
```

---

## ❓ PREGUNTAS FRECUENTES

### ¿Puedo cambiar el estado directamente después de crear la orden?

**Sí.** Puedes cambiar el estado inmediatamente después de crear la orden.

**Pasos:**
1. Crear orden → Te redirige al detalle
2. En la sección "Gestión de la Orden"
3. Cambiar estado → Guardar

---

### ¿Qué pasa si cambio el estado a "Completada" por error?

**Puedes cambiarlo de vuelta** a cualquier estado anterior. No hay restricciones.

---

### ¿Puedo tener múltiples órdenes en "En Desarrollo"?

**Sí.** Puedes tener tantas órdenes en desarrollo como necesites.

---

### ¿El estado afecta algo más?

**Actualmente:**
- Solo afecta cómo se muestra la orden
- Permite filtrar órdenes por estado
- (Próximamente) Puede afectar notificaciones y reportes

---

## 📝 RESUMEN RÁPIDO

1. **¿Por qué borrador?** → Es el estado inicial por diseño, te permite revisar antes de enviar
2. **¿Dónde cambiar?** → En el detalle de la orden, sección "Gestión de la Orden"
3. **¿Cómo cambiar?** → Selecciona nuevo estado del dropdown → Guardar cambios
4. **Flujo recomendado:** Borrador → Enviada → Aceptada → En Desarrollo → Completada

---

**¡Ahora puedes gestionar los estados de tus órdenes fácilmente!** 🚀
