# 🎯 CÓMO CREAR ORDEN DESDE DIAGNÓSTICO - GUÍA RÁPIDA

## ✅ PROBLEMAS CORREGIDOS

1. ✅ **Import de CostosReales agregado** - Ya no debería dar error
2. ✅ **Botón visible desde "Cotizando"** - Ya no necesitas cambiar a "Proyecto" primero
3. ✅ **Botones separados** - Más claros y fáciles de encontrar

---

## 📍 DÓNDE ENCONTRAR EL BOTÓN

### Paso 1: Ve a Diagnósticos

```
Admin Panel → Diagnósticos (en el sidebar)
```

### Paso 2: Abre un Diagnóstico

```
Click en cualquier diagnóstico de la lista
```

### Paso 3: Busca el Botón Verde

**El botón aparece cuando el estado es:**
- ✅ **"Cotizando"** ← RECOMENDADO: Crea la orden aquí
- ✅ **"Proyecto"**
- ✅ **"Cerrado"**

**Ubicación del botón:**
```
┌─────────────────────────────────────┐
│  Detalle del Diagnóstico            │
│                                     │
│  [Formulario de gestión]            │
│                                     │
│  Botones:                           │
│  [Guardar Cambios]                  │
│  [📋 Crear Orden desde Diagnóstico] ← AQUÍ (botón verde)
│                                     │
│  (Si está en "Proyecto" también verás)│
│  [📄 Generar Orden PDF]             │
└─────────────────────────────────────┘
```

---

## 🚀 CÓMO USARLO - PASO A PASO

### Paso 1: Cambia el Estado a "Cotizando"

1. En el detalle del diagnóstico
2. Busca el campo **"Estado"**
3. Selecciona **"Cotizando"** del dropdown
4. Click en **"Guardar Cambios"**

**Resultado:** Ahora verás el botón verde **"📋 Crear Orden desde Diagnóstico"**

---

### Paso 2: Click en el Botón

```
Click en: [📋 Crear Orden desde Diagnóstico]
```

**Resultado:** Se abre un modal grande con el formulario

---

### Paso 3: Selecciona Template de Solución

**En el modal:**

1. Busca el campo **"Template de Solución"**
2. Click en el dropdown
3. Selecciona un template:
   - Sistema para Restaurantes
   - Sistema para Servicio Técnico
   - Sistema para Taller Mecánico
   - Sistema Cotizador / Fábrica
   - Sistema para Comercio
   - Sistema para Servicios Profesionales

**Ejemplo:** Selecciona "Sistema para Restaurantes"

**Resultado:** 
- ✅ Se cargan automáticamente los módulos disponibles
- ✅ Se establece el precio base del template
- ✅ Los módulos requeridos se marcan automáticamente

---

### Paso 4: Selecciona Módulos

**Verás una lista de módulos con checkboxes:**

```
☑ Menú QR Digital (Requerido) - $150,000 CLP
☑ Gestión de Mesas - $100,000 CLP
☑ Sistema de Pedidos - $200,000 CLP
☐ Marketing Digital - $50,000 CLP
```

**Qué hacer:**
- ✅ Los módulos **requeridos** ya vienen marcados (no puedes desmarcarlos)
- ☐ Marca los módulos **opcionales** que quieras incluir
- ☐ Desmarca los que **NO** quieras incluir

**Ejemplo:**
- Si el cliente NO quiere Marketing Digital → Desmárcalo
- Si quiere todo lo demás → Déjalo marcado

---

### Paso 5: Ajusta Precios (Opcional)

**Campos disponibles:**

1. **Ajustes Personalizados:**
   - Si hay algo extra que no está en los módulos
   - Ejemplo: $50,000 por diseño personalizado

2. **Descuento:**
   - Si quieres aplicar un descuento
   - Ejemplo: $100,000 de descuento

**El total se calcula automáticamente:**
```
Precio Base: $500,000
+ Módulos: $350,000
+ Ajustes: $50,000
- Descuento: $0
─────────────────────
TOTAL: $900,000 CLP
```

---

### Paso 6: Completa Términos

**Términos de Pago:**
```
Ejemplo: "50% al inicio del proyecto, 50% al finalizar"
```

**Características Personalizadas (Opcional):**
```
Ejemplo: "Diseño personalizado según marca del restaurante"
```

**Click en "Crear Orden"**

---

### Paso 7: ¡Listo!

**Resultado:**
- ✅ Orden creada con número único (ej: ORD-2024-001)
- ✅ Redirección automática al detalle de la orden
- ✅ Puedes ver toda la información de la orden
- ✅ Puedes generar PDFs (próximamente)

---

## 🎨 VISTA VISUAL DEL MODAL

```
┌─────────────────────────────────────────────┐
│  Crear Orden desde Diagnóstico        [✕]  │
├─────────────────────────────────────────────┤
│                                             │
│  📋 Información del Diagnóstico:           │
│  Cliente: Gourmet Árabe                    │
│  Tipo: Restaurante                         │
│                                             │
│  🎯 Template de Solución: *                │
│  [Sistema para Restaurantes ▼]             │
│                                             │
│  📦 Módulos a Incluir:                     │
│  ┌─────────────────────────────────────┐  │
│  │ ☑ Menú QR Digital (Requerido)       │  │
│  │    $150,000 CLP                      │  │
│  │ ☑ Gestión de Mesas                  │  │
│  │    $100,000 CLP                      │  │
│  │ ☑ Sistema de Pedidos                │  │
│  │    $200,000 CLP                      │  │
│  │ ☐ Marketing Digital                  │  │
│  │    $50,000 CLP                       │  │
│  └─────────────────────────────────────┘  │
│                                             │
│  💰 Ajustes de Precio:                     │
│  Ajustes: [$50,000]                        │
│  Descuento: [$0]                           │
│                                             │
│  📝 Términos de Pago:                      │
│  [50% al inicio, 50% al finalizar...]     │
│                                             │
│  ────────────────────────────────────────  │
│  [Cancelar]              [Crear Orden]      │
└─────────────────────────────────────────────┘
```

---

## ❓ PREGUNTAS FRECUENTES

### ¿Por qué no veo el botón?

**Posibles razones:**
1. El estado del diagnóstico es "Nuevo" o "Contactado"
   - **Solución:** Cambia el estado a "Cotizando" o superior

2. No has guardado los cambios después de cambiar el estado
   - **Solución:** Click en "Guardar Cambios" primero

3. Error de carga de la página
   - **Solución:** Recarga la página (F5)

---

### ¿Qué pasa si selecciono un template pero no veo módulos?

**Posibles razones:**
1. El template no tiene módulos configurados
   - **Solución:** Verifica en Supabase que el template tenga módulos

2. Error al cargar módulos
   - **Solución:** Revisa la consola del navegador (F12) para ver errores

---

### ¿Puedo crear la orden sin seleccionar template?

**No.** El template es obligatorio porque:
- Define el precio base
- Carga los módulos disponibles
- Estructura la orden

**Si no hay template adecuado:**
- Crea uno nuevo en Supabase, o
- Usa "Nueva Orden Manual" en lugar de crear desde diagnóstico

---

### ¿Qué diferencia hay entre "Crear Orden desde Diagnóstico" y "Nueva Orden Manual"?

**Crear Orden desde Diagnóstico:**
- ✅ Información del cliente pre-cargada
- ✅ Vinculada al diagnóstico original
- ✅ Más rápido
- ✅ Trazabilidad completa

**Nueva Orden Manual:**
- ✅ Más control sobre todos los campos
- ✅ Útil si el cliente no pasó por diagnóstico
- ✅ Puedes crear desde cero

---

## 🎯 RESUMEN RÁPIDO

1. **Ve a Diagnósticos** → Abre un diagnóstico
2. **Cambia estado a "Cotizando"** → Guarda cambios
3. **Click en botón verde** → "📋 Crear Orden desde Diagnóstico"
4. **Selecciona template** → Elige uno de la lista
5. **Marca módulos** → Los que quieras incluir
6. **Ajusta precios** → Si es necesario
7. **Completa términos** → Términos de pago
8. **Click "Crear Orden"** → ¡Listo!

---

**¡Ahora deberías poder crear órdenes sin problemas!** 🚀
