# Documentos: trabajo entregado y mantenimiento

Objetivo: que todo quede **organizado, escrito y con comprobantes**: actas de entrega, órdenes de mantenimiento y precios claros.

---

## 1. Qué hay hoy en el sistema

| Recurso | Uso |
|--------|-----|
| **orders** | Órdenes de trabajo (estados: draft → sent → accepted → in_development → **completed**). Incluyen cliente, alcance, precios, términos. |
| **order_terms** | Términos por orden (garantía, revisiones, mantenimiento incluido, etc.). |
| **change_orders** | Órdenes de cambio (cambios de alcance, costos extra, aprobación cliente). |
| **legal_templates** | Plantillas de garantías, mantenimiento, exclusiones, términos de pago. |
| **pricing_config** | Precios por tipo: hora personalización, revisión, hora soporte, **mes de mantenimiento**. |
| **proposals** | Propuestas comerciales (PDF con mockups, precios, plantillas por rubro). |

---

## 2. PDF “Trabajo entregado” (acta de entrega)

**Objetivo:** Cuando una orden pasa a **completed**, tener un comprobante que el cliente pueda firmar o aceptar: “Se entrega el trabajo según orden ORD-2024-XXX”.

**Qué podría incluir el PDF:**
- Número de orden y fecha de entrega.
- Cliente y proyecto (nombre, alcance resumido).
- Resumen de lo entregado (módulos, entregables).
- Referencia a garantía y soporte incluido (según `order_terms` / `legal_templates`).
- Espacio para firma/aceptación (opcional).

**Dónde implementarlo:**
- Backend: endpoint `GET /api/orders/:id/acta-entrega` o `GET /api/orders/:id/documents/acta-entrega` que genere un PDF a partir de la orden y sus términos.
- Plantilla: nueva plantilla HTML (como las de propuestas) o reutilizar lógica de `legal_templates` si hay una plantilla “acta de entrega”.
- Admin: en la vista de detalle de orden, botón “Descargar acta de entrega” cuando `status === 'completed'`.

**Datos a usar:** `orders` (client_name, order_number, completed_at, scope, etc.), `order_terms`, `order_modules` (resumen de lo incluido).

---

## 3. Documentos cuando piden mantenimiento

**Objetivo:** Cuando el cliente pide mantenimiento (soporte, cambios pequeños, extensión de mantenimiento), generar un documento que deje claro **qué se pide**, **a qué precio** y **qué queda registrado**.

**Precios de mantenimiento (ya en el sistema):**
- En **Precios** (admin) y en **pricing_config**:
  - **Precio por hora de personalización**
  - **Precio por hora de soporte**
  - **Precio por mes de mantenimiento**
  - **Precio por revisión adicional**

**Tipos de documento útiles:**

| Documento | Cuándo | Contenido sugerido |
|-----------|--------|---------------------|
| **Solicitud / Orden de mantenimiento** | Cliente pide soporte o mantenimiento por tiempo (ej. 3 meses más). | Cliente, orden original, tipo (soporte X horas, mantenimiento X meses), precios sacados de **pricing_config**, total, aceptación. |
| **Comprobante de pago (mantenimiento)** | Después de cobrar. | Cliente, concepto (ej. “Mantenimiento marzo–mayo 2025”), monto, fecha. |
| **Orden de cambio (change order)** | Si el “mantenimiento” es un cambio de alcance (nueva funcionalidad, etc.). | Ya existe **change_orders**: título, descripción, costo estimado, aprobación. Se puede generar PDF de la change order para que el cliente lo firme. |

**Flujo sugerido:**
1. Cliente pide mantenimiento → en el admin se crea un registro (nueva tabla “solicitudes_mantenimiento” o se reutiliza **change_orders** con tipo “mantenimiento” si se extiende el modelo).
2. Se elige tipo (horas soporte, meses mantenimiento, etc.) y el sistema toma el precio de **pricing_config** (o el usuario lo ajusta).
3. Se genera PDF “Orden de mantenimiento” o “Solicitud de mantenimiento” con precios y condiciones.
4. Tras el pago o la realización del trabajo, se puede generar “Comprobante de trabajo entregado” o “Comprobante de pago” para esa solicitud.

**Dónde implementarlo:**
- Backend: endpoints para crear “solicitud de mantenimiento” y para generar PDF de esa solicitud (usando precios de `pricing_config`).
- Opcional: tabla `maintenance_requests` (cliente, order_id, tipo, cantidad horas/meses, precio_unitario, total, estado, pdf_url).
- Admin: sección “Mantenimiento” o dentro de la ficha de la orden: “Solicitar mantenimiento” → formulario → generar PDF.

---

## 4. Resumen de pasos recomendados

1. **Precios (hecho en esta iteración):**
   - En la página **Precios** del admin ya se muestran **Descripción / Notas** para distinguir varias tarifas del mismo tipo (ej. varias “hora de personalización”).
   - Se puede marcar “Incluir precios inactivos” para ver y editar todos.
   - Usar **Notas** para identificar cada fila (ej. “Estándar”, “Premium”).

2. **Acta de entrega (trabajo entregado):**
   - Añadir plantilla HTML para “Acta de entrega” o “Comprobante de trabajo entregado”.
   - Endpoint en backend que, dado `order_id`, genere el PDF usando datos de la orden y de `order_terms`.
   - En el admin, botón “Descargar acta de entrega” en órdenes con estado **completed**.

3. **Documentos de mantenimiento:**
   - Definir si se usa solo **change_orders** (con tipo “mantenimiento”) o una tabla nueva `maintenance_requests`.
   - Plantilla “Orden de mantenimiento” o “Solicitud de mantenimiento” que use precios de **pricing_config** (maintenance_month, support_hour, etc.).
   - En el admin, flujo “Solicitar mantenimiento” desde una orden (o desde cliente) → formulario → generación de PDF con precios y condiciones.

4. **Comprobantes de pago:**
   - Opcional: plantilla genérica “Comprobante de pago” (cliente, concepto, monto, fecha) para entregas y mantenimientos.
   - Se puede generar desde la misma orden o desde la solicitud de mantenimiento una vez registrado el pago.

Con esto se cubre: **ver y editar precios con descripción**, **comprobante de trabajo entregado** (acta de entrega) y **documentos de mantenimiento** con precios claros y trazabilidad.
