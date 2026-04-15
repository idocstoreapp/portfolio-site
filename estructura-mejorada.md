 Análisis Completo del Sistema Admin

    PROBLEMAS PRINCIPALES QUE IDENTIFICO:

    1. No hay gestión real de clientes
    Actualmente los clientes son un "efecto secundario" - se crean indirectamente through diagnósticos/ordenes, pero:
     - No puedes ver un listado de todos tus clientes con su historial
     - No hay forma de seleccionar un cliente existente al crear una orden
     - No puedes ver qué proyectos ha tenido un cliente
     - La tabla clientes existe pero apenas tiene funcionalidad (solo un GET endpoint sin UI)

    2. No existen órdenes de mantenimiento
    El sistema solo sabe crear órdenes para proyectos nuevos:
     - No hay workflow para mantenimiento recurrente
     - No hay forma de vincular mantenimiento a un proyecto existente
     - Los campos de maintenance_text, maintenance_months existen pero son solo texto, no funcionalidad real
     - No hay UI para crear "Contrato de Mantenimiento Mensual"

    3. El flujo de creación de órdenes es forzado
    Ambos formularios (CreateOrderFromDiagnostic y CreateOrderForm) tienen problemas:
     - Demasiado largo - 10+ secciones con muchos campos
     - Requiere seleccionar template - ¿Qué pasa si es un trabajo personalizado?
     - No reutiliza información - Si el cliente ya existe, tienes que escribir todo de nuevo
     - No hay borradores - Si cancelas, pierdes todo

    4. Precios: ¿Es útil en la vida real?
    El sistema de templates + módulos es demasiado rígido:
     - ✅ Bueno: Templates predefinidos para soluciones comunes (restaurantes, etc.)
     - ❌ Malo: No hay forma fácil de pricing para trabajos custom que no encajen en templates
     - ❌ Complicado: Calcular precios manualmente (base_price + modules_price + custom_adjustments - discount_amount)
     - ❌ No hay historial: No puedes ver cuánto cobraste en proyectos similares

    ---

    MEJORAS QUE RECOMIENDO (Por Prioridad):

    🔥 PRIORIDAD ALTA (Lo que más impacta):

    ##### A. Sistema de Gestión de Clientes Completo

    Qué agregar:
     1. Página `/admin/clientes` - Listado completo con:
        - Nombre, empresa, email, teléfono
        - Número de proyectos realizados
        - Estado (lead, activo, inactivo)
        - Búsqueda y filtros

     2. Página `/admin/clientes/[id]` - Detalle del cliente:
        - Datos de contacto
        - Historial de proyectos/ordenes (línea de tiempo)
        - Total invertido por el cliente
        - Notas internas
        - Tags (ej: "restaurante", "recurrente", "premium")

     3. Al crear orden: Selector de cliente existente O crear nuevo

    Estructura visual:

      1 ┌─────────────────────────────────────┐
      2 │  Lista de Clientes                  │
      3 ├─────────────────────────────────────┤
      4 │ [🔍 Buscar cliente...]              │
      5 │                                     │
      6 │ 👤 Juan Pérez                      │
      7 │    🏢 Restaurante El Sabor          │
      8 │    📋 3 proyectos | 💰 $2,400 USD   │
      9 │    📊 ● Activo                      │
     10 │                                     │
     11 │ 👤 María González                  │
     12 │    🏢 Taller Mecánico Rapid          │
     13 │    📋 1 proyecto | 💰 $800 USD      │
     14 │    📊 ○ Inactivo                    │
     15 └─────────────────────────────────────┘

    ##### B. Órdenes de Mantenimiento

    Nuevo tipo de orden: maintenance (además de sistema, web, combinado, custom)

    Workflow propuesto:

     1. Crear orden de mantenimiento:
        - Seleccionar cliente existente (obligatorio)
        - Seleccionar proyecto existente del cliente (opcional)
        - Tipo de mantenimiento:
          - mensual - Contrato recurrente
          - puntual - Una sola vez
          - por_horas - Bolsa de horas
        - Descripción del trabajo
        - Precio (mensual fijo, o por hora)
        - Duración (si aplica)

     2. Vista de mantenimientos activos:
        - Lista de contratos vigentes
        - Fecha de inicio/fin
        - Estado (activo, vencido, renovable)
        - Recordatorios de renovación

    Estructura de base de datos adicional:

     1 ALTER TABLE orders ADD COLUMN order_type TEXT CHECK (order_type IN ('project', 'maintenance', 'support'));
     2 ALTER TABLE orders ADD COLUMN maintenance_type TEXT CHECK (maintenance_type IN ('monthly', 'one_time',
       'hourly_bank'));
     3 ALTER TABLE orders ADD COLUMN maintenance_start_date DATE;
     4 ALTER TABLE orders ADD COLUMN maintenance_end_date DATE;
     5 ALTER TABLE orders ADD COLUMN hourly_bank_total DECIMAL; -- Total de horas compradas
     6 ALTER TABLE orders ADD COLUMN hourly_bank_used DECIMAL;  -- Horas usadas
     7 ALTER TABLE orders ADD COLUMN related_order_id UUID REFERENCES orders(id); -- Vinculado a proyecto

    Formulario simplificado:

      1 ┌──────────────────────────────────────┐
      2 │  Nueva Orden de Mantenimiento        │
      3 ├──────────────────────────────────────┤
      4 │                                      │
      5 │  Cliente: [Seleccionar...] 🔍        │
      6 │  👤 Juan Pérez - Restaurante El Sabor│
      7 │                                      │
      8 │  Proyecto relacionado (opcional):    │
      9 │  [Sistema de Reservas - ORD-2024-003]│
     10 │                                      │
     11 │  Tipo de mantenimiento:              │
     12 │  ○ Mensual ($X/mes)                  │
     13 │  ○ Puntual (una sola vez)            │
     14 │  ○ Bolsa de horas (X horas)          │
     15 │                                      │
     16 │  Descripción del trabajo:            │
     17 │  [Actualizaciones de seguridad,      │
     18 │   backups, soporte técnico...]       │
     19 │                                      │
     20 │  Precio: [$50] /mes                  │
     21 │  Duración: [6] meses                 │
     22 │                                      │
     23 │  [Crear Orden]                       │
     24 └──────────────────────────────────────┘

    ##### C. Simplificar Creación de Órdenes

    Problema actual: 10 secciones, demasiados campos obligatorios

    Solución: Wizard de 3 pasos

    Paso 1: Cliente y Tipo
     - Seleccionar cliente (existente o nuevo)
     - Tipo: Proyecto nuevo / Mantenimiento / Soporte
     - Si es proyecto: seleccionar template o "custom"

    Paso 2: Alcance y Precio
     - Descripción breve (1 campo de texto)
     - Módulos (si usa template) o características (si es custom)
     - Precio calculado o manual
     - Términos de pago (1 campo)

    Paso 3: Revisión y Crear
     - Resumen visual
     - Generar contrato PDF (opcional)
     - Crear orden

    ---

    ⚡ PRIORIDAD MEDIA (Mejora la experiencia):

    ##### D. Dashboard de Clientes

    En vez de solo ver diagnósticos, el dashboard debería mostrar:

      1 ┌─────────────────────────────────────┐
      2 │  Dashboard Admin                     │
      3 ├─────────────────────────────────────┤
      4 │                                     │
      5 │  📊 Resumen                          │
      6 │  ┌──────┐ ┌──────┐ ┌──────┐        │
      7 │  │  15  │ │  8   │ │  3   │        │
      8 │  │Clientes│Activos│Nuevos │        │
      9 │  └──────┘ └──────┘ └──────┘        │
     10 │                                     │
     11 │  💰 Ingresos                         │
     12 │  Este mes: $2,400 USD               │
     13 │  Mes pasado: $1,800 USD             │
     14 │                                     │
     15 │  🔔 Alertas                          │
     16 │  ⚠️ 3 mantenimientos vencen este mes│
     17 │  📞 2 leads sin contactar           │
     18 │                                     │
     19 │  📈 Actividad Reciente               │
     20 │  ✅ ORD-2024-005 completada         │
     21 │  🆕 Nuevo cliente: María González   │
     22 │  💳 Pago recibido: ORD-2024-003     │
     23 └─────────────────────────────────────┘

    ##### E. Plantillas de Órdenes Rápidas

    Para trabajos repetitivos, crear "mini-templates":
     - "Mantenimiento Web Básico" - $50/mes
     - "Soporte Técnico" - $30/hora
     - "Actualización de Contenido" - $100

    Un clic y se crea la orden automáticamente con todos los campos pre-rellenados.

    ##### F. Historial de Precios Inteligente

    Al crear una orden nueva, mostrar:

      1 💡 Proyectos similares:
      2 ┌──────────────────────────────────┐
      3 │ ORD-2024-002 - Restaurante similar│
      4 │ Precio: $1,200 USD               │
      5 │ Tiempo: 3 semanas                │
      6 ├──────────────────────────────────┤
      7 │ ORD-2023-015 - Sistema reservas   │
      8 │ Precio: $800 USD                 │
      9 │ Tiempo: 2 semanas                │
     10 └──────────────────────────────────┘

    ---

    🎨 PRIORIDAD BAJA (Nice to have):

    ##### G. Mejoras en UX de Páginas Existentes

     1. Lista de órdenes/proyectos:
        - Agregar filtros por cliente, estado, fecha
        - Vista de calendario (deadlines)
        - Exportar a CSV

     2. Detalle de orden:
        - Timeline visual del progreso
        - Chat/notas con el cliente
        - Subir archivos (contratos firmados, assets)

     3. Generación de propuestas:
        - Antes de crear orden, generar propuesta/PDF para enviar al cliente
        - Templates de propuestas profesionales

    ##### H. Sistema de Facturación Simple

    No un sistema completo, pero sí:
     - Registrar pagos (parciales/totales)
     - Ver órdenes sin pagar
     - Recordatorios automáticos

    ---

    📋 ESTRUCTURA PROPUESTA DEL ADMIN:

      1 /admin
      2 ├── /dashboard                    # Resumen completo (clientes, ingresos, alertas)
      3 ├── /clientes                     # ✨ NUEVO: Lista de clientes
      4 │   └── /[id]                     # ✨ NUEVO: Detalle + historial
      5 ├── /ordenes
      6 │   ├── /nueva                    # Rediseñado: wizard 3 pasos
      7 │   │   ├── paso-1: cliente-tipo  # Seleccionar cliente y tipo
      8 │   │   ├── paso-2: alcance       # Alcance y precio
      9 │   │   └── paso-3: revision      # Revisar y crear
     10 │   ├── /[id]                     # Detalle + edición completa
     11 │   └── /mantenimientos           # ✨ NUEVO: Solo mantenimientos activos
     12 ├── /diagnosticos                 # Leads/diagnósticos (actual)
     13 │   └── /[id]                     # Detalle (actual)
     14 ├── /proyectos                    # Filtrar órdenes activas (actual pero mejorado)
     15 ├── /templates                    # Templates de soluciones (actual)
     16 ├── /precios                      # Configuración de precios (actual)
     17 └── /configuracion                # ✨ NUEVO: Settings generales
     18     ├── usuarios-admin            # Mover desde donde esté
     19     ├── plantillas-propuestas
     20     └── plantillas-rapidas        # ✨ NUEVO: Órdenes pre-configuradas

    ---

    ¿Es útil en la vida real?

    Sí, pero necesita simplificación:

    ✅ Lo que SÍ funciona:
     - Diagnósticos como punto de entrada (captura leads profesionales)
     - Templates para soluciones repetitivas (restaurantes, talleres)
     - Generación de contratos PDF
     - Change orders para modificaciones

    ❌ Lo que NO funciona:
     - Demasiados pasos para crear una orden simple
     - No poder reutilizar clientes existentes
     - No tener mantenimientos como órdenes propias
     - Pricing demasiado manual y complicado

    ---

    🚀 MI RECOMENDACIÓN: Por dónde empezar

    Semana 1: Crear gestión de clientes (lista + detalle)
    Semana 2: Implementar órdenes de mantenimiento
    Semana 3: Rediseñar formulario de creación de órdenes (wizard)
    Semana 4: Agregar selector de cliente en creación de órdenes
    Semana 5: Dashboard mejorado con métricas de clientes

    ¿Quieres que empiece a implementar alguna de estas mejoras? Puedo empezar por:
     1. Página de lista de clientes (más rápido, más impacto)
     2. Órdenes de mantenimiento (lo que más necesitas según tu descripción)
     3. Rediseñar el wizard de creación de órdenes (mejora UX inmediata)