# 📚 GUÍA COMPLETA: Sistema de Diagnóstico y Órdenes de Trabajo

## 🎯 PROPÓSITO DEL SISTEMA

Este sistema te permite:
1. **Captar leads** mediante un diagnóstico automatizado en tu sitio web
2. **Analizar necesidades** del cliente de forma estructurada
3. **Generar órdenes profesionales** con alcance, precios y términos claros
4. **Gestionar proyectos** desde el diagnóstico hasta la entrega
5. **Automatizar** la creación de contratos y manuales

---

## 🔄 FLUJO COMPLETO DEL SISTEMA

```
Cliente completa diagnóstico en tu sitio web
         ↓
Diagnóstico se guarda automáticamente en Supabase
         ↓
Tú revisas el diagnóstico en el Admin Panel
         ↓
Analizas necesidades y decides qué solución ofrecer
         ↓
Creas una Orden de Trabajo (desde diagnóstico o manual)
         ↓
Generas PDF del contrato y manual de usuario
         ↓
Cliente acepta → Proyecto en desarrollo
         ↓
Marcas orden como "Completada" al finalizar
```

---

## 📋 PASO 1: EL CLIENTE COMPLETA EL DIAGNÓSTICO

### ¿Qué pasa aquí?

El cliente visita tu sitio web (`http://localhost:4321` o tu dominio) y encuentra el **Wizard de Diagnóstico**.

### ¿Qué información captura el diagnóstico?

1. **Información básica:**
   - Nombre del cliente
   - Email
   - Teléfono
   - Empresa

2. **Tipo de negocio:**
   - Restaurante
   - Servicio Técnico
   - Taller Mecánico
   - Fábrica/Cotizador
   - Comercio
   - Servicios Profesionales

3. **Necesidades detectadas:**
   - Nivel digital actual
   - Objetivos del negocio
   - Tamaño del negocio
   - Necesidades adicionales

4. **Análisis automático:**
   - Solución principal recomendada
   - Soluciones complementarias
   - Estimación de costos y ahorros
   - ROI potencial
   - Urgencia (alta/media/baja)

### ¿Dónde se guarda?

**Automáticamente en Supabase** → Tabla `diagnosticos`

**No necesitas hacer nada**, el sistema lo guarda solo.

---

## 📊 PASO 2: REVISAR DIAGNÓSTICOS EN EL ADMIN PANEL

### Acceso

1. Abre el Admin Panel: `http://localhost:3001`
2. Inicia sesión con tu cuenta de admin
3. Ve a **"Diagnósticos"** en el sidebar

### ¿Qué verás?

- **Lista de todos los diagnósticos** realizados
- **Filtros** por estado, tipo de empresa, búsqueda
- **Información clave** de cada diagnóstico:
  - Cliente y contacto
  - Tipo de negocio
  - Solución recomendada
  - Urgencia
  - Estado actual

### Estados de Diagnóstico

- **Nuevo** → Recién completado, no contactado
- **Contactado** → Ya hablaste con el cliente
- **Cotizando** → Estás preparando propuesta
- **Proyecto** → Cliente aceptó, proyecto en curso
- **Cerrado** → Proyecto finalizado

### Acciones disponibles

1. **Ver detalle** → Click en cualquier diagnóstico
2. **Cambiar estado** → Actualizar según avance
3. **Agregar notas** → Información importante del cliente
4. **Registrar costos reales** → Para proyectos en curso
5. **Crear orden** → Convertir diagnóstico en orden de trabajo

---

## 🎯 PASO 3: ANALIZAR EL DIAGNÓSTICO Y DECIDIR LA SOLUCIÓN

### Ejemplo Real: Cliente quiere app para restaurante

**Diagnóstico muestra:**
- Tipo: Restaurante
- Necesidades: Menú digital, gestión de mesas, pedidos online
- Urgencia: Alta
- ROI estimado: $500,000 CLP/mes en ahorros

### ¿Qué hacer?

1. **Abre el diagnóstico** en detalle (`/diagnosticos/[id]`)
2. **Revisa toda la información:**
   - Datos del cliente
   - Solución recomendada por el sistema
   - Insights generados automáticamente
   - Mensaje personalizado

3. **Decide qué solución ofrecer:**
   - El sistema recomienda "Sistema para Restaurantes"
   - Puedes usar un **Solution Template** existente o crear uno personalizado

4. **Prepara la propuesta:**
   - Revisa qué módulos incluir
   - Define precio base
   - Estima tiempo de desarrollo
   - Prepara términos de pago

---

## 📋 PASO 4: CREAR ORDEN DE TRABAJO

Tienes **2 opciones**:

### OPCIÓN A: Crear Orden desde Diagnóstico (RECOMENDADO)

**Cuándo usar:** Cuando el diagnóstico tiene toda la información que necesitas.

**Pasos:**

1. Ve al diagnóstico (`/diagnosticos/[id]`)
2. Cambia el estado a **"Proyecto"** o **"Cerrado"**
3. Verás el botón **"📋 Crear Orden desde Diagnóstico"**
4. Click en el botón → Se abre un modal

**En el modal:**

1. **Selecciona Template de Solución:**
   - Ejemplo: "Sistema para Restaurantes"
   - El sistema carga automáticamente los módulos disponibles

2. **Selecciona Módulos a Incluir:**
   - ✅ Menú QR Digital (Requerido)
   - ✅ Gestión de Mesas
   - ✅ Sistema de Pedidos
   - ✅ Panel de Administración
   - ❌ Marketing Digital (opcional, desmarcar si no lo necesitan)

3. **Ajusta Precios (si es necesario):**
   - Precio base del template: $500,000 CLP
   - Módulos seleccionados: $200,000 CLP
   - Ajustes personalizados: $50,000 CLP (si hay algo extra)
   - Descuento: $0 CLP (o aplicar descuento si corresponde)
   - **Total calculado automáticamente: $750,000 CLP**

4. **Completa Términos:**
   - Términos de pago: "50% al inicio, 50% al finalizar"
   - Garantía: "3 meses de garantía en funcionalidades"
   - Mantenimiento: "Soporte técnico incluido por 1 mes"
   - Exclusiones: "No incluye hosting ni dominio"

5. **Click en "Crear Orden"**

**Resultado:**
- ✅ Orden creada con número único (ej: ORD-2024-001)
- ✅ Vinculada al diagnóstico original
- ✅ Información del cliente pre-cargada
- ✅ Módulos y precios definidos
- ✅ Redirección automática al detalle de la orden

---

### OPCIÓN B: Crear Orden Manualmente

**Cuándo usar:** Cuando el cliente no pasó por el diagnóstico o necesitas crear una orden desde cero.

**Pasos:**

1. Ve a **"Órdenes"** → Click en **"+ Nueva Orden Manual"**
2. Completa el formulario completo:

   **Sección 1: Información del Cliente**
   - Nombre del cliente *
   - Empresa
   - Email
   - Teléfono

   **Sección 2: Tipo de Proyecto**
   - Selecciona: Web, Sistema, App, Marketing, Otro
   - (Opcional) Selecciona Template de Solución

   **Sección 3: Módulos**
   - Si seleccionaste template, aparecen los módulos
   - Marca los que quieres incluir
   - Los módulos requeridos vienen marcados automáticamente

   **Sección 4: Alcance del Proyecto**
   - Describe qué se incluye
   - Características personalizadas

   **Sección 5: Aspectos Económicos**
   - Precio base
   - Precio de módulos (calculado automáticamente)
   - Ajustes personalizados
   - Descuento
   - **Total (calculado automáticamente)**

   **Sección 6: Términos de Pago**
   - Define cómo y cuándo se paga

   **Sección 7: Términos Legales**
   - Garantía
   - Mantenimiento
   - Exclusiones

   **Sección 8: Fechas Estimadas**
   - Fecha de inicio
   - Fecha de finalización

   **Sección 9: Notas**
   - Notas internas (solo para ti)
   - Notas para el cliente

3. Click en **"Crear Orden"**

---

## 📄 PASO 5: GESTIONAR LA ORDEN

### Ver Detalle de la Orden

Ve a `/ordenes/[id]` y verás:

- **Información General:**
  - Número de orden
  - Estado actual
  - Tipo de proyecto
  - Fechas

- **Información del Cliente:**
  - Todos los datos de contacto

- **Alcance del Proyecto:**
  - Descripción completa
  - Módulos incluidos

- **Aspectos Económicos:**
  - Desglose de precios
  - Total

- **Archivos Generados:**
  - PDF del contrato (cuando lo generes)
  - PDF del manual de usuario (cuando lo generes)

- **Notas:**
  - Notas internas
  - Notas para el cliente

### Estados de Orden

- **Borrador (Draft)** → Recién creada, puedes editar
- **Enviada (Sent)** → Ya enviaste la propuesta al cliente
- **Aceptada (Accepted)** → Cliente aceptó, listo para empezar
- **En Desarrollo (In Development)** → Proyecto en curso
- **Completada (Completed)** → Proyecto terminado
- **Cancelada (Cancelled)** → Cliente canceló o no procedió

### Cambiar Estado

1. Abre la orden
2. (Próximamente) Usa el formulario de edición para cambiar estado
3. O actualiza directamente desde la API

---

## 💼 CASO PRÁCTICO COMPLETO: Cliente quiere app para restaurante

### Escenario

**Cliente:** "Gourmet Árabe" - Restaurante que quiere digitalizar su negocio.

---

### PASO 1: Cliente completa diagnóstico

**En tu sitio web:**
- Cliente entra al wizard
- Selecciona "Restaurante"
- Completa información: nombre, email, teléfono
- El sistema detecta necesidades:
  - Menú digital
  - Gestión de mesas
  - Pedidos online
- Cliente completa el diagnóstico

**Resultado:** Diagnóstico guardado con:
- Estado: "Nuevo"
- Urgencia: "Alta"
- Solución recomendada: "Sistema para Restaurantes"
- ROI estimado: $500,000 CLP/mes

---

### PASO 2: Tú revisas el diagnóstico

**En Admin Panel (`/diagnosticos`):**

1. Ves el nuevo diagnóstico de "Gourmet Árabe"
2. Click para ver detalle
3. Revisas:
   - Cliente: Juan Pérez
   - Email: juan@gourmetarabe.cl
   - Teléfono: +56 9 1234 5678
   - Tipo: Restaurante
   - Solución recomendada: Sistema para Restaurantes
   - Urgencia: Alta

4. **Cambias estado a "Contactado"**
5. **Agregas nota:** "Cliente muy interesado, necesita solución rápida"

---

### PASO 3: Contactas al cliente

**Fuera del sistema:**
- Llamas o envías email
- Confirmas necesidades
- Discutes presupuesto
- Acuerdas alcance

**En el sistema:**
- Cambias estado a **"Cotizando"**
- Agregas más notas si es necesario

---

### PASO 4: Creas la orden

**Opción recomendada: Crear desde diagnóstico**

1. Ve al diagnóstico de Gourmet Árabe
2. Cambia estado a **"Proyecto"**
3. Click en **"📋 Crear Orden desde Diagnóstico"**

**En el modal:**

1. **Template:** Seleccionas "Sistema para Restaurantes"
   - Precio base: $500,000 CLP

2. **Módulos a incluir:**
   - ✅ Menú QR Digital (Requerido) - $150,000
   - ✅ Gestión de Mesas - $100,000
   - ✅ Sistema de Pedidos - $200,000
   - ✅ Panel de Administración (Requerido) - $50,000
   - ❌ Marketing Digital - No incluido

3. **Precios:**
   - Base: $500,000
   - Módulos: $350,000
   - Ajustes: $50,000 (personalización de diseño)
   - Descuento: $0
   - **Total: $900,000 CLP**

4. **Términos de pago:**
   - "50% ($450,000) al inicio del proyecto"
   - "50% ($450,000) al finalizar y entregar"

5. **Garantía:**
   - "3 meses de garantía en todas las funcionalidades"
   - "Soporte técnico incluido por 1 mes"

6. **Exclusiones:**
   - "No incluye hosting ni dominio"
   - "No incluye capacitación presencial"

7. Click en **"Crear Orden"**

**Resultado:**
- ✅ Orden creada: **ORD-2024-001**
- ✅ Vinculada al diagnóstico
- ✅ Cliente: Gourmet Árabe
- ✅ Total: $900,000 CLP
- ✅ Estado: Borrador

---

### PASO 5: Generas el contrato PDF

**Próximamente (FASE 7):**
- Click en "Generar Contrato PDF"
- El sistema crea un PDF profesional con:
  - Portada con logo
  - Información del cliente
  - Descripción del proyecto
  - Alcance incluido/excluido
  - Módulos detallados
  - Aspectos económicos
  - Términos legales
  - Fechas estimadas

- Descargas el PDF
- Lo envías al cliente por email

---

### PASO 6: Cliente acepta

**En el sistema:**
- Cambias estado de orden a **"Aceptada"**
- Agregas fecha de aceptación
- Actualizas notas si es necesario

---

### PASO 7: Desarrollo del proyecto

**En el sistema:**
- Cambias estado a **"En Desarrollo"**
- Agregas fecha de inicio
- Actualizas notas con avances

**Fuera del sistema:**
- Desarrollas la aplicación
- Pruebas con el cliente
- Haces ajustes

---

### PASO 8: Finalizas el proyecto

**En el sistema:**
- Cambias estado a **"Completada"**
- Agregas fecha de finalización
- Generas **Manual de Usuario PDF** (próximamente)

**El manual incluye:**
- Instrucciones para cada módulo incluido
- Cómo usar el menú QR
- Cómo gestionar mesas
- Cómo procesar pedidos
- Cómo usar el panel de administración

---

### PASO 9: Seguimiento

**En el diagnóstico original:**
- Puedes registrar:
  - Costo real del proyecto
  - Horas trabajadas
  - Notas finales

**Esto te ayuda a:**
- Mejorar estimaciones futuras
- Calcular rentabilidad real
- Aprender de cada proyecto

---

## 💡 MEJORES PRÁCTICAS PARA SACAR EL MÁXIMO PROVECHO

### 1. **Usa los Templates de Solución**

**Ventaja:** Ahorras tiempo y aseguras consistencia.

**Cómo:**
- Crea templates para cada tipo de negocio común
- Define módulos estándar para cada template
- Establece precios base realistas

**Ejemplo:**
- Template "Restaurantes" → $500,000 base
- Template "Taller Mecánico" → $600,000 base
- Template "Servicio Técnico" → $550,000 base

---

### 2. **Aprovecha el Diagnóstico para Personalizar**

**No solo uses el diagnóstico para crear la orden, úsalo para:**
- Entender mejor al cliente
- Identificar necesidades ocultas
- Ofrecer soluciones complementarias
- Justificar el precio con ROI estimado

**Ejemplo:**
- Diagnóstico muestra ROI de $500,000/mes
- Puedes decir: "En 2 meses recuperas la inversión"
- Esto justifica un precio más alto

---

### 3. **Mantén Estados Actualizados**

**Por qué es importante:**
- Sabes en qué etapa está cada proyecto
- Puedes filtrar y encontrar órdenes rápidamente
- Generas reportes precisos
- Mejoras tu flujo de trabajo

**Estados recomendados:**
- Diagnóstico: Nuevo → Contactado → Cotizando → Proyecto
- Orden: Borrador → Enviada → Aceptada → En Desarrollo → Completada

---

### 4. **Usa Notas Estratégicamente**

**Notas internas:** Para ti y tu equipo
- "Cliente muy exigente, revisar bien antes de enviar"
- "Presupuesto ajustado, no incluir extras"
- "Urgente, necesita para fecha X"

**Notas para cliente:** Visibles en el contrato
- "Incluye 1 sesión de capacitación"
- "Diseño personalizado según marca"
- "Soporte prioritario por 3 meses"

---

### 5. **Calcula Precios Realistas**

**Usa el sistema de módulos:**
- Precio base del template
- + Módulos adicionales
- + Ajustes personalizados
- - Descuentos (si aplica)
- = Total

**Ejemplo:**
- Base: $500,000
- Módulos: $350,000
- Personalización: $100,000
- Descuento: -$50,000 (primer cliente)
- **Total: $900,000**

---

### 6. **Vincula Diagnóstico con Orden**

**Siempre que sea posible:**
- Crea órdenes desde diagnósticos
- Mantén la trazabilidad
- Puedes ver el historial completo
- Mejoras tus estimaciones futuras

---

### 7. **Genera PDFs Profesionales**

**Cuando esté disponible (FASE 7):**
- Contrato PDF → Envíalo al cliente para firmar
- Manual PDF → Entrégalo al finalizar el proyecto

**Beneficios:**
- Documentación profesional
- Cliente tiene todo claro
- Reduces malentendidos
- Ahorras tiempo en explicaciones

---

## 📊 REPORTES Y ANÁLISIS

### ¿Qué puedes analizar?

1. **Diagnósticos:**
   - Cuántos nuevos tienes
   - Qué tipos de negocio son más comunes
   - Tasa de conversión (diagnóstico → orden)
   - ROI promedio estimado

2. **Órdenes:**
   - Total de órdenes creadas
   - Valor total de proyectos
   - Órdenes por estado
   - Tiempo promedio de desarrollo

3. **Rentabilidad:**
   - Comparar costos reales vs estimados
   - Identificar proyectos más rentables
   - Mejorar estimaciones futuras

---

## 🚀 PRÓXIMOS PASOS (FASES PENDIENTES)

### FASE 7: Generación de PDFs

**Contrato PDF:**
- Portada profesional
- Información completa del proyecto
- Términos legales
- Firmas (digitales)

**Manual de Usuario PDF:**
- Instrucciones por módulo
- Capturas de pantalla
- FAQ
- Contacto de soporte

### FASE 8: Mejoras Adicionales

- Edición de órdenes existentes
- Duplicar órdenes
- Envío de emails automáticos
- Dashboard con estadísticas
- Exportar a Excel/CSV

---

## ❓ PREGUNTAS FRECUENTES

### ¿Puedo crear una orden sin diagnóstico?

**Sí.** Usa "Nueva Orden Manual" y completa todos los campos.

### ¿Puedo editar una orden después de crearla?

**Próximamente.** Por ahora, puedes crear una nueva orden duplicando la anterior.

### ¿Cómo cambio el estado de una orden?

**Próximamente.** Por ahora, puedes hacerlo desde la API o esperar a la FASE 8.

### ¿Los módulos son obligatorios?

**Depende.** Algunos módulos están marcados como "requeridos" y no se pueden desmarcar. Otros son opcionales.

### ¿Puedo crear mis propios templates?

**Sí.** Los templates están en la base de datos. Puedes crear nuevos desde Supabase o esperar a la interfaz de gestión de templates.

### ¿Qué pasa si el cliente quiere cambios después de crear la orden?

**Crea una nueva versión** de la orden o actualiza la existente (cuando esté disponible la edición).

---

## 📞 SOPORTE

Si tienes dudas sobre cómo usar el sistema:
1. Revisa esta guía
2. Consulta la documentación técnica en `FASE2_DISENO_WORK_ORDERS.md`
3. Revisa los logs del backend para errores

---

**¡Listo para empezar!** 🚀

Ahora tienes todo lo necesario para gestionar clientes desde el diagnóstico hasta la entrega del proyecto.
