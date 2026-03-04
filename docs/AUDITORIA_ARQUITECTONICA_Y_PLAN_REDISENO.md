# Auditoría arquitectónica y plan de rediseño — Sistema de agencia digital

**Documento:** Auditoría completa y plan de rediseño para convertir el sistema actual en una plataforma de nivel agencia de alto nivel.

**Alcance:** Backend (NestJS), frontend (Astro), admin panel (Next.js), base de datos (Supabase/Postgres), flujos de diagnóstico, propuestas, órdenes, garantías y PDFs.

---

# PARTE 1 — ENTENDIMIENTO DEL SISTEMA ACTUAL

## 1.1 Cómo funciona el sistema hoy

### Flujo general

1. **Captación:** El usuario entra al sitio (Astro), hace el wizard de diagnóstico conversacional (sector → preguntas por sector → servicios recomendados → contacto) y envía.
2. **Diagnóstico:** El frontend calcula summary, insights, mensaje personalizado y envelope; envía todo al backend (`POST /api/diagnostic`). El backend guarda en `diagnosticos` y devuelve el ID. El usuario ve resultado en `/diagnostico/[id]`.
3. **Admin:** Un admin entra al panel (Next.js), ve diagnósticos, puede cambiar estado (nuevo/contactado/cotizando/proyecto/cerrado o según migración: contactado/aprobado/rechazado/no_contesto).
4. **Propuesta/Orden:** No existe entidad "propuesta". La "propuesta" es una **orden de trabajo** creada desde el diagnóstico: en detalle de diagnóstico se usa "Crear orden desde diagnóstico", se elige `solution_template`, se marcan módulos, y se llama `POST /api/orders/from-diagnostic`. La orden se guarda en `orders` y el diagnóstico se actualiza a `estado = 'aprobado'`.
5. **Órdenes manuales:** También se pueden crear órdenes sin diagnóstico (`POST /api/orders`) desde "Nueva orden".
6. **Work orders:** Las órdenes (`orders`) tienen estados: draft, sent, accepted, in_development, completed, cancelled. Se gestionan en admin: listado, detalle, edición, cambio de estado.
7. **Garantías:** Las plantillas están en `legal_templates` (por categoría: web, app, system, combined). Al crear una orden se aplica automáticamente la plantilla por defecto según `project_type` y se guarda en `order_terms` y copia en `orders` (warranty_text, maintenance_policy, exclusions_text).
8. **PDFs:** Generación solo en cliente (jsPDF + html2canvas): "Orden PDF" desde diagnóstico (propuesta inicial) y "Contrato PDF" desde la orden (contrato formal). No hay generación en servidor.
9. **Clientes:** Tabla `clientes` con CRUD básico vía backend; el admin solo lista clientes (paginado). No hay flujo claro Lead → Cliente.
10. **Proyectos:** La tabla `proyectos` existe en el schema pero **no hay módulo Nest ni CRUD en backend**. La sección "Proyectos" del admin muestra en realidad **diagnósticos filtrados por estado = 'proyecto'**, no registros de la tabla `proyectos`.

### Workflow actual (resumido)

```
Sitio web → Wizard diagnóstico → POST /diagnostic → diagnosticos (estado: nuevo/contactado/…)
     ↓
Admin ve diagnósticos → Cambia estado → "Crear orden desde diagnóstico"
     ↓
POST /orders/from-diagnostic → orders + order_modules + order_terms (diagnóstico → aprobado)
     ↓
Admin edita orden, cambia status (draft → sent → accepted → in_development → completed)
     ↓
PDF contrato se genera en navegador (opcional subida de URL)
```

No hay flujo explícito: Lead → Propuesta enviada → Negociación → Aprobación → Orden de trabajo → Proyecto → Entrega → Cierre.

---

## 1.2 Entidades actuales

| Entidad | Tabla | Uso real |
|--------|--------|----------|
| **Diagnóstico** | `diagnosticos` | Wizard → backend → guardado. Estados según migración: contactado, aprobado, rechazado, no_contesto (schema original: nuevo, contactado, cotizando, proyecto, cerrado). |
| **Cliente** | `clientes` | CRUD backend; listado en admin. Relación opcional con `diagnostico_id`. Estados: lead, cliente, activo, inactivo. |
| **Proyecto** | `proyectos` | Definida en schema, **no usada por backend ni admin**. Admin "Proyectos" = lista de diagnósticos con estado proyecto. |
| **Orden (work order)** | `orders` | Propuesta + orden de trabajo en una sola entidad. Relación con diagnostico_id, cliente_id, solution_template_id. order_modules, order_terms. |
| **Plantilla de solución** | `solution_templates` | Catálogo de "soluciones" (restaurantes, servicio-técnico, etc.) con base_price. |
| **Módulo de solución** | `solution_modules` | Módulos por template (requeridos/opcionales), precios, contenido para manual. |
| **Términos legales** | `legal_templates` | Garantía, mantenimiento, exclusiones por categoría (web, app, system, combined). |
| **Términos por orden** | `order_terms` | Una fila por orden: garantía, mantenimiento, exclusiones, pagos, IP. |
| **Orden de cambio** | `change_orders` | Modificaciones de alcance/costo ligadas a una orden. |
| **Configuración de precios** | `pricing_config` | Precios por tipo (template, module, hora, etc.). |
| **Reglas de pricing** | `pricing_rules` | Usadas por pricing-calculator para app custom / web. |
| **Usuario admin** | `usuarios_admin` | Extensión de auth.users para RLS y permisos. |

No existe entidad **Lead** separada: el lead es el diagnóstico con datos de contacto. No existe entidad **Propuesta** separada: la orden en estado draft/sent hace de propuesta.

---

## 1.3 Flujos actuales

- **Diagnóstico:** Frontend (ConversationalDiagnosticWizard) → createDiagnostic() → POST /api/diagnostic → DiagnosticService (motor conversacional/mejorado/legacy) → insert en `diagnosticos`.
- **Listar diagnósticos:** GET /api/diagnostic?estado=… → Admin lista y filtra.
- **Crear orden desde diagnóstico:** Admin elige template y módulos → POST /api/orders/from-diagnostic → OrdersService (SolutionTypeDeterminer, legal_templates, precios) → createOrder() → insert orders + order_modules + order_terms; update diagnosticos.estado = 'aprobado'.
- **Crear orden manual:** POST /api/orders con CreateOrderDto.
- **Cambiar estado de orden:** PUT /api/orders/:id/status (draft → sent → accepted → in_development → completed).
- **Clientes:** GET /api/clients (paginado). No hay creación automática desde diagnóstico ni vinculación clara a pipeline.
- **Proyectos:** No hay flujo; tabla sin uso.

---

# PARTE 2 — PROBLEMAS IDENTIFICADOS

## 2.1 Problemas arquitectónicos

1. **Propuesta y orden son la misma entidad:** No hay distinción entre "propuesta enviada al cliente" y "orden de trabajo aceptada". Una misma fila en `orders` hace de propuesta y de contrato. No hay versión ni historial de propuestas.
2. **Proyectos no implementados:** La tabla `proyectos` existe pero no hay módulo en backend ni pantallas que la usen. "Proyectos" en admin son diagnósticos filtrados, no proyectos reales.
3. **Lead = Diagnóstico:** No hay entidad Lead. Quien completa el diagnóstico es el lead, pero no hay modelo unificado (lead con o sin diagnóstico, origen, scoring).
4. **Duplicación de motores de diagnóstico:** Hay diagnostic-engine (legacy), enhanced-diagnostic-engine y flujo conversacional en frontend. Tres caminos distintos y código duplicado en backend y root.
5. **Clientes desconectados del pipeline:** `clientes` se lista pero no se crea/actualiza automáticamente desde diagnósticos ni desde órdenes. Relación cliente ↔ diagnóstico ↔ orden no está estandarizada.
6. **Sin capa de servicios de dominio:** Lógica repartida en controllers y services sin conceptos claros de Pipeline, Lead, Proposal, Project. Difícil escalar y mantener.

## 2.2 Problemas de modelo de datos

1. **Estados de diagnóstico inconsistentes:** Schema original (nuevo, contactado, cotizando, proyecto, cerrado) vs migración (contactado, aprobado, rechazado, no_contesto). Código y admin pueden seguir usando "nuevo" y "proyecto"; riesgo de constraint violation si se aplicó la migración.
2. **Orden como "todo en uno":** Incluye snapshot de cliente, términos, precios, estado de propuesta y estado de ejecución. No hay separación Proposal vs WorkOrder.
3. **Sin entidad Delivery/Entrega:** No hay registro de "entrega realizada", documentos de entrega ni confirmación del cliente.
4. **Garantías solo como texto:** Garantías en legal_templates y order_terms son texto libre. No hay entidad "Guarantee" con vigencia, tipo, condiciones claras.

## 2.3 Problemas de UX y admin

1. **Pipeline inexistente:** No hay vista de pipeline (kanban o etapas). Los diagnósticos tienen estado pero no hay flujo visual Lead → Propuesta → Orden → Proyecto.
2. **Proyectos engañosos:** La sección Proyectos muestra diagnósticos, no proyectos. El usuario puede creer que gestiona proyectos cuando en realidad son leads aprobados.
3. **Sin sección Leads unificada:** Leads son diagnósticos; no hay lista "Leads" con origen (web, scraper, manual), estado y siguiente acción.
4. **Precios y Templates separados:** Precios y Templates y Módulos están en secciones distintas; no hay una vista "Servicios" que una planes, módulos y precios.
5. **PDFs solo en cliente:** Generación en navegador implica límites de tamaño, fuentes y consistencia. No hay plantillas PDF en servidor ni auditoría de documentos generados.

## 2.4 Problemas de escalabilidad y mantenimiento

1. **Sin API versionada:** Rutas tipo /api/diagnostic, /api/orders. No hay /v1/ ni estrategia de versionado.
2. **Configuración de precios fragmentada:** pricing_config, base_price en solution_templates y solution_modules, y pricing_rules. Tres fuentes de verdad para precios.
3. **Garantías por categoría fija:** legal_templates por categoría (web, app, system, combined). No hay garantías por plan (Basic, Pro, Enterprise) ni por tipo de servicio.
4. **Documentación de flujos insuficiente:** Flujos repartidos en varios MD; no hay un único documento de arquitectura de negocio y datos.

---

# PARTE 3 — ESTRUCTURA IDEAL (NIVEL AGENCIA)

## 3.1 Conceptos objetivo

- **Lead:** Registro de contacto/oportunidad, con o sin diagnóstico. Origen: web, scraper, manual. Un lead puede tener 0 o 1 diagnóstico.
- **Diagnóstico:** Resultado del wizard; se asocia a un lead. No es el lead en sí.
- **Propuesta:** Documento oferta (versión, precios, alcance) ligado a un lead/diagnóstico. Estados: borrador, enviada, vista, negociación, aceptada, rechazada.
- **Cliente:** Entidad cuando el lead se convierte en cliente (ej. propuesta aceptada o primera orden aceptada).
- **Pipeline:** Etapas por las que pasa un lead/oportunidad hasta cierre.
- **Work Order (orden de trabajo):** Compromiso formal tras propuesta aceptada; tiene estados de ejecución (en progreso, completado, etc.).
- **Proyecto:** Contenedor de uno o más work orders y entregas; fechas, presupuesto, estado.
- **Entrega:** Registro de qué se entregó (URL, repositorio, manual, etc.) y opcionalmente confirmación del cliente.
- **Documento final de entrega:** PDF/artefacto que certifica cierre (entrega + aceptación).

## 3.2 Flujo ideal de datos

```
Lead (origen: web/scraper/manual)
  → opcional: Diagnóstico (wizard)
  → Propuesta (una o más versiones)
  → Propuesta aceptada → Cliente (si no existía) + Work Order
  → Work Order asociada a Proyecto
  → Entregas (manual, URL, PDF)
  → Confirmación cliente → Documento final → Cierre
```

---

# PARTE 4 — PIPELINE DE VENTAS IDEAL

## 4.1 Etapas

| Etapa | Descripción | Entidad principal |
|-------|-------------|-------------------|
| **Lead** | Contacto captado (formulario, diagnóstico, scraper). | Lead |
| **Diagnosed** | Diagnóstico completado; se conoce necesidad. | Lead + Diagnostic |
| **Proposal Sent** | Propuesta generada y enviada al cliente. | Proposal (status: sent) |
| **Negotiation** | En revisión o negociación. | Proposal (status: negotiation) |
| **Approved** | Cliente aceptó; se genera orden de trabajo. | Proposal (accepted) → WorkOrder |
| **Work Order** | Orden creada y confirmada. | WorkOrder (draft/sent/accepted) |
| **In Progress** | Trabajo en ejecución. | WorkOrder (in_development) |
| **Completed** | Desarrollo terminado; pendiente entrega formal. | WorkOrder (completed) |
| **Delivered** | Entregado al cliente (URL, manual, etc.). | Delivery |
| **Closed** | Cliente confirma; proyecto cerrado. | Project/Delivery (confirmed) |

## 4.2 Transiciones

- **Lead → Diagnosed:** Al guardar diagnóstico y asociarlo al lead.
- **Diagnosed → Proposal Sent:** Al crear propuesta y marcarla como "enviada".
- **Proposal Sent → Negotiation:** Cambio manual o al detectar interacción (ej. abrió PDF).
- **Negotiation → Approved:** Cliente acepta; creación de Work Order y opcionalmente Cliente.
- **Approved → Work Order:** Work Order creada y en estado sent/accepted.
- **Work Order → In Progress:** Cambio de estado a in_development.
- **In Progress → Completed:** Cambio de estado a completed.
- **Completed → Delivered:** Se registra una entrega (Delivery).
- **Delivered → Closed:** Cliente confirma entrega o se marca como cerrado.

El sistema debe permitir mover el lead/oportunidad entre etapas y reflejarlo en una vista Pipeline (kanban o lista por etapa).

---

# PARTE 5 — ESTRUCTURA IDEAL DE SERVICIOS

## 5.1 Jerarquía

```
Service (producto de la agencia, ej. "Sistema para Restaurantes", "Sitio Web Corporativo")
  └── ServicePlan (Basic, Pro, Enterprise)
        ├── Incluye módulos (ServiceModule) por defecto
        ├── Precio del plan
        └── Guarantee (garantía por plan)
  └── ServiceModule (opcional/add-on)
        ├── Precio
        ├── Requerido u opcional para cada plan
        └── Contenido para manual
```

## 5.2 Relaciones

- **Service Template** (o Service): Lo que hoy es `solution_templates` — catálogo de "qué vendemos".
- **Service Plan:** Planes por servicio (Basic, Pro, Enterprise). Cada plan tiene precio base y conjunto de módulos incluidos. Hoy no existe; todo está en un solo "base_price" por template.
- **Service Module:** Módulos reutilizables (hoy `solution_modules`). Un módulo puede pertenecer a varios templates; por plan se define si es incluido u opcional y precio.
- **Guarantee:** Por plan o por categoría: duración, condiciones, texto. Hoy solo texto en legal_templates.

## 5.3 Cómo se usa en propuesta

- Al armar una propuesta se elige **Service** (template) y **Plan** (Basic/Pro/Enterprise).
- El sistema sugiere módulos incluidos y opcionales según el plan.
- Se pueden añadir módulos extra con precio. Los precios vienen de ServicePlan y ServiceModule (una sola fuente de verdad con pricing_config o campos en las entidades).

---

# PARTE 6 — ESTRUCTURA IDEAL DE PDFs

## 6.1 Propuesta (Proposal PDF)

- **Cabecera:** Logo agencia, título "Propuesta comercial", número de propuesta, fecha, vigencia.
- **Cliente:** Nombre, empresa, email, teléfono.
- **Contexto:** Resumen del diagnóstico (si existe) o motivo de la propuesta.
- **Alcance:** Servicio/plan elegido, módulos incluidos, opcionales y excluidos; descripción breve.
- **Precios:** Desglose: plan base, módulos, ajustes, descuentos; total; moneda; condiciones de pago.
- **Plazos:** Fechas estimadas de inicio y fin.
- **Términos:** Garantía (resumen), mantenimiento, exclusiones; referencia a documento legal completo si aplica.
- **Aceptación:** Espacio para firma/fecha o enlace a aceptación en línea.
- **Pie:** Contacto agencia, validez de la oferta.

## 6.2 Orden de trabajo (Work Order PDF / Contrato)

- **Identificación:** Número de orden, fecha, partes (agencia vs cliente).
- **Antecedentes:** Referencia a propuesta aceptada (número, fecha).
- **Objeto:** Descripción del trabajo (alcance congelado).
- **Precio y forma de pago:** Total, cronograma de pagos, método.
- **Plazos:** Inicio, hitos, entrega estimada.
- **Garantía:** Texto completo de garantía (días, condiciones).
- **Mantenimiento y soporte:** Qué incluye y qué no.
- **Exclusiones:** Lista clara.
- **Propiedad intelectual y código fuente:** Según contrato.
- **Anexos:** Lista de módulos/entregables.
- **Firmas:** Espacio para firma cliente y agencia (o equivalente legal).

## 6.3 Entrega (Delivery PDF)

- **Documento de entrega (manual):** Lista de entregables (URLs, repositorios, manual de usuario, credenciales resumidas), fecha de entrega, versión. Firma/checklist de recepción.
- **Confirmación de entrega:** Documento corto que el cliente puede firmar o aceptar por sistema: "He recibido los entregables y acepto el cierre del proyecto según contrato". Opcional: adjunto del PDF de entrega generado.

Idealmente los PDFs se generan en servidor (plantillas HTML → PDF o librería tipo Puppeteer/PDFKit) y se guardan (URL) en proposal, order y delivery para trazabilidad.

---

# PARTE 7 — ESTRUCTURA IDEAL DEL ADMIN

## 7.1 Secciones

| Sección | Contenido |
|--------|-----------|
| **Dashboard** | KPIs: leads nuevos, en pipeline, propuestas enviadas, ganadas, en curso; gráficos por etapa y por periodo. Accesos rápidos a tareas. |
| **Leads** | Lista/kanban de leads. Filtros: origen, etapa, asignado. Crear lead manual; ver detalle (contacto, diagnóstico si existe, propuestas, órdenes). Mover etapa. |
| **Pipeline** | Vista kanban por etapa (Lead → … → Closed). Arrastrar tarjeta entre columnas para cambiar etapa. Filtros por responsable, fecha. |
| **Clients** | CRUD clientes. Origen desde lead; ver proyectos y órdenes del cliente. |
| **Proposals** | Lista de propuestas; estado (borrador, enviada, negociación, aceptada, rechazada). Crear desde lead/diagnóstico. Generar PDF propuesta. |
| **Work Orders** | Lista de órdenes de trabajo; estado; vinculación a propuesta y proyecto. Crear desde propuesta aceptada. Generar PDF contrato. |
| **Projects** | Lista de proyectos (tabla `proyectos` real). Cada proyecto agrupa work orders y entregas; estado (cotizando, desarrollo, producción, completado, cancelado). |
| **Deliveries** | Por proyecto/orden: registrar entrega (URL, archivos, manual); generar PDF entrega; marcar confirmación cliente. |
| **Services** | Catálogo de servicios (templates). |
| **Plans** | Planes por servicio (Basic, Pro, Enterprise) con precios y módulos. |
| **Modules** | Módulos reutilizables; asignación a servicios/planes. |
| **Templates** | Plantillas legales (garantías, términos) por categoría o por plan. |
| **PDF Templates** | Plantillas para generación de PDF (propuesta, contrato, entrega) si se hace en servidor. |
| **Settings** | Usuarios admin, roles, configuración general, integraciones (ej. scraper). |

## 7.2 Flujo UX ideal

1. Entrar al Dashboard → ver indicadores y siguientes pasos.
2. Leads: abrir lead → ver diagnóstico (si hay) → botón "Crear propuesta" → elegir servicio/plan/módulos → guardar borrador o marcar "Enviada".
3. Pipeline: ver todas las oportunidades en columnas; arrastrar para cambiar etapa; al aceptar propuesta, crear Work Order y opcionalmente Proyecto.
4. Work Orders: listar por estado; al completar, ir a Proyecto y registrar Entrega.
5. Proyectos: ver proyectos activos; dentro de cada uno: órdenes, entregas, documento final.
6. Configuración: Servicios → Planes → Módulos → Templates legales y PDF.

---

# PARTE 8 — INTEGRACIÓN IDEAL DEL LEAD SCRAPER

## 8.1 Supuestos

- Existe o existirá un scraper que obtiene leads de fuentes externas (redes, directorios, etc.).
- Cada lead debe tener: origen (ej. `scraper`), fuente concreta (ej. `linkedin`), datos de contacto (nombre, empresa, email, teléfono si hay), y fecha de captación.

## 8.2 Flujo de integración

1. **Entrada del lead:** El scraper llama una API dedicada, ej. `POST /api/leads` (o `POST /api/leads/import`) con payload: `{ source: 'scraper', source_detail: 'linkedin', name, company, email?, phone?, ... }`. El backend crea registro en `leads` con estado "Lead" (primera etapa).
2. **Aparece en Leads:** El lead se lista en la sección Leads del admin (y en Pipeline en columna "Lead"). Filtro por origen = scraper.
3. **Diagnóstico opcional:** Si el lead luego hace el diagnóstico en la web, al guardar el diagnóstico se busca lead por email (o se crea lead desde diagnóstico) y se asocia `diagnostic_id` al lead y se mueve a "Diagnosed". Si el lead viene solo del scraper, puede quedarse en "Lead" hasta que se le asigne diagnóstico manual o se contacte.
4. **Propuesta:** Desde el detalle del lead (con o sin diagnóstico) el admin crea propuesta; al enviarla el lead pasa a "Proposal Sent" y la propuesta tiene estado "sent".
5. **Pipeline:** Cualquier lead (web o scraper) sigue las mismas etapas; la única diferencia es el campo `origin` y `source_detail` para reportes y filtros.

## 8.3 Requisitos técnicos

- Endpoint de ingreso de leads (API key o auth para el scraper).
- Entidad Lead con `origin`, `source_detail`, `diagnostic_id` (opcional), y relación 1:1 o N:1 con Client cuando se convierta.
- No duplicar leads por email (regla de negocio: mismo email = mismo lead o merge).

---

# PARTE 9 — ESTRUCTURA IDEAL DE BASE DE DATOS

## 9.1 Entidades y relaciones

- **Lead**  
  - id, created_at, updated_at  
  - origin (web | scraper | manual), source_detail  
  - name, email, phone, company  
  - status (pipeline stage) o relación a PipelineStage  
  - diagnostic_id (FK nullable)  
  - client_id (FK nullable; cuando se convierte)  
  - assigned_to, notes  

- **Diagnostic**  
  - id, lead_id (FK), created_at  
  - Campos actuales (tipo_empresa, sector, respuestas, envelope_data, etc.)  
  - Estado solo para el diagnóstico en sí (completado, etc.); el estado comercial es del Lead.

- **Client**  
  - id, created_at  
  - name, email, phone, company  
  - lead_id (FK, opcional; lead que originó el cliente)  
  - Estado: activo, inactivo  

- **Proposal**  
  - id, lead_id, created_at, version  
  - status (draft | sent | viewed | negotiation | accepted | rejected)  
  - service_id (template), plan_id (si existe), included_modules, excluded_modules  
  - base_price, modules_price, adjustments, discount, total  
  - payment_terms, validity_until  
  - proposal_pdf_url  
  - accepted_at, rejected_at  

- **Service (Template)**  
  - Equivalente a solution_templates actual: id, slug, name, description, base_price (o delegar a plans), is_active, etc.  

- **ServicePlan**  
  - id, service_id, code (basic|pro|enterprise), name, base_price, is_default  
  - Incluye qué módulos van incluidos (tabla service_plan_modules).  

- **ServiceModule**  
  - Equivalente a solution_modules: id, code, name, description, base_price, is_required (por plan), manual_*, solution_template_id → service_id.  

- **WorkOrder**  
  - id, order_number, proposal_id (FK), project_id (FK nullable), client_id  
  - Snapshot cliente, solution_template_id, project_type  
  - status (draft | sent | accepted | in_development | completed | cancelled)  
  - base_price, modules_price, total_price, payment_terms  
  - sent_at, accepted_at, started_at, completed_at  
  - contract_pdf_url  
  - order_terms (warranty, maintenance, exclusions) en tabla order_terms como hoy.  

- **Project**  
  - id, name, client_id, diagnostico_id (opcional)  
  - status (cotizando | desarrollo | produccion | completado | cancelado)  
  - fecha_inicio, fecha_fin_estimada, fecha_fin_real  
  - presupuesto_estimado, presupuesto_real  
  - Relación 1:N con WorkOrder.  

- **Delivery**  
  - id, work_order_id (o project_id), delivered_at  
  - delivery_type (urls | manual | repo | other)  
  - payload JSON (urls, notes)  
  - delivery_pdf_url  
  - confirmed_by_client_at  

- **Guarantee**  
  - id, name, service_plan_id o category  
  - warranty_days, warranty_text  
  - maintenance_included, maintenance_months  
  - (O seguir con legal_templates por categoría y referenciar desde plan.)  

Relaciones resumidas:

- Lead 1:1 Diagnostic (opcional)  
- Lead N:1 Client (cuando convierte)  
- Lead 1:N Proposal  
- Proposal 1:1 WorkOrder (cuando accepted)  
- WorkOrder N:1 Project  
- Project 1:N WorkOrder, 1:N Delivery (o Delivery por WorkOrder)  
- Service 1:N ServicePlan, 1:N ServiceModule (con tabla intermedia para plan–module)  

---

# PARTE 10 — PLAN MAESTRO DE TRANSFORMACIÓN

## Paso 1 — Estabilizar y unificar modelo actual (sin romper producción)

1.1 Definir un único conjunto de estados de diagnóstico y aplicarlo en schema, backend y admin (ej. contactado, cotizando, aprobado, rechazado, no_contesto) y migrar datos si hace falta.  
1.2 Documentar en un solo sitio: entidades actuales, flujos actuales, y dónde está la inconsistencia (proyectos vs diagnósticos).  
1.3 Unificar motores de diagnóstico: un solo punto de entrada (conversacional como estándar) y deprecar o encapsular legacy/enhanced en el backend.  
1.4 Añadir relación explícita: al crear orden desde diagnóstico, crear o actualizar `clientes` con los datos del diagnóstico y asignar `cliente_id` y `diagnostico_id` en la orden.

## Paso 2 — Introducir Lead y Proposal sin sustituir aún la orden

2.1 Crear tabla `leads` (origen, contacto, diagnostic_id, estado simple). Migrar: por cada diagnóstico existente, crear lead asociado (o considerar diagnósticos como “lead” y migrar después).  
2.2 Crear tabla `proposals` (lead_id, diagnostico_id, status, version, precios, alcance, pdf_url).  
2.3 Flujo: “Crear orden desde diagnóstico” → primero crear propuesta (estado draft) y opcionalmente guardar PDF; “Enviar propuesta” → status sent; “Aceptar” → crear orden como hoy y marcar propuesta accepted. La orden sigue siendo la fuente de verdad de trabajo; la propuesta es el historial oferta.  
2.4 En admin: sección Leads (lista de leads con diagnóstico o no); desde lead, botón “Crear propuesta” que rellena desde diagnóstico y guarda en `proposals`.  
2.5 Pipeline simple: vista por estado de lead (o por estado de propuesta) en columnas; sin borrar aún la vista actual de diagnósticos/órdenes.

## Paso 3 — Proyectos, entregas y cierre

3.1 Activar uso de `proyectos`: módulo Nest para proyectos (CRUD). Al crear work order desde propuesta aceptada, crear o reutilizar proyecto (por cliente o por propuesta) y asociar la orden al proyecto.  
3.2 Tabla `deliveries`: work_order_id, delivered_at, tipo, payload, delivery_pdf_url, confirmed_by_client_at.  
3.3 En admin: sección Proyectos que liste tabla `proyectos`; dentro de cada proyecto: work orders y entregas. Registrar entrega (URLs, manual) y opcionalmente generar PDF de entrega y marcar confirmación.  
3.4 Estados de proyecto alineados con órdenes: cuando todas las órdenes del proyecto están completed y hay al menos una entrega confirmada, marcar proyecto completado/cerrado.

## Paso 4 — Servicios, planes, garantías y PDFs

4.1 Introducir **ServicePlan** (por service/template): tabla y CRUD; precios por plan; módulos por plan (incluidos/opcionales). Propuestas y órdenes referencian plan + módulos.  
4.2 Unificar precios: una sola fuente (pricing por plan y por módulo) y que solution_templates.base_price pase a ser derivado del plan por defecto o se deprecie.  
4.3 Garantías: asociar legal_templates a categoría y/o a plan; al crear propuesta/orden, elegir plantilla por plan.  
4.4 PDFs en servidor: plantillas (HTML o diseño) para propuesta, contrato y entrega; generación en backend; guardar URL en proposal, order y delivery. Mantener generación en cliente como fallback si se desea.  
4.5 Sección Settings: PDF Templates, integraciones (webhook o API para scraper).

## Paso 5 — Pipeline completo y scraper

5.1 Pipeline kanban: etapas = estados de lead (o de “opportunity” si se desacopla). Mover lead entre etapas actualiza estado y, si aplica, crea propuesta/work order/project.  
5.2 Endpoint `POST /api/leads` (o `/api/leads/import`) para scraper; crear lead con origin=scraper; idempotencia por email si se define.  
5.3 Dashboard con KPIs por etapa, origen y periodo.  
5.4 Limpieza: ocultar o eliminar vistas que confundan (ej. “Proyectos” como lista de diagnósticos); una sola fuente de verdad para proyectos, órdenes y entregas.

---

**Fin del documento.** Este plan permite pasar del sistema actual (diagnóstico → orden única como propuesta+contrato, proyectos sin usar) a un modelo claro Lead → Diagnóstico → Propuesta → Work Order → Proyecto → Entrega → Cierre, con integración de scraper y PDFs trazables, manteniendo compatibilidad gradual con los datos existentes.
