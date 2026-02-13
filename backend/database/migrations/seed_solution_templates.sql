-- ============================================
-- SEED: DATOS INICIALES DE SOLUTION TEMPLATES
-- ============================================
-- Este script inserta los templates de soluciones
-- basados en las páginas estáticas existentes
-- ============================================

-- ============================================
-- 1. SOLUTION TEMPLATE: Restaurantes
-- ============================================

INSERT INTO solution_templates (slug, name, description, icon, base_price, currency, display_order, is_active)
VALUES (
  'restaurantes',
  'Sistema para Restaurantes',
  'Menú QR, POS, gestión de mesas y comandas. Deja el papel atrás.',
  '🍽️',
  160.00,
  'USD',
  1,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  base_price = EXCLUDED.base_price,
  updated_at = NOW();

-- ============================================
-- 2. SOLUTION TEMPLATE: Servicio Técnico
-- ============================================

INSERT INTO solution_templates (slug, name, description, icon, base_price, currency, display_order, is_active)
VALUES (
  'servicio-tecnico',
  'Sistema para Servicio Técnico',
  'Gestiona reparaciones, inventario, comisiones y clientes desde un solo sistema.',
  '🔧',
  200.00,
  'USD',
  2,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  base_price = EXCLUDED.base_price,
  updated_at = NOW();

-- ============================================
-- 3. SOLUTION TEMPLATE: Taller Mecánico
-- ============================================

INSERT INTO solution_templates (slug, name, description, icon, base_price, currency, display_order, is_active)
VALUES (
  'taller-mecanico',
  'Sistema para Taller Mecánico',
  'Organiza reparaciones, repuestos, comisiones y clientes de forma profesional.',
  '🚗',
  200.00,
  'USD',
  3,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  base_price = EXCLUDED.base_price,
  updated_at = NOW();

-- ============================================
-- 4. SOLUTION TEMPLATE: Cotizador Fábrica
-- ============================================

INSERT INTO solution_templates (slug, name, description, icon, base_price, currency, display_order, is_active)
VALUES (
  'cotizador-fabrica',
  'Sistema Cotizador / Fábrica',
  'Cotizaciones personalizadas con cálculo automático de costos reales.',
  '🏭',
  180.00,
  'USD',
  4,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  base_price = EXCLUDED.base_price,
  updated_at = NOW();

-- ============================================
-- 5. SOLUTION TEMPLATE: Desarrollo Web
-- ============================================

INSERT INTO solution_templates (slug, name, description, icon, base_price, currency, display_order, is_active)
VALUES (
  'desarrollo-web',
  'Desarrollo Web Profesional',
  'Páginas web que convierten visitantes en clientes.',
  '🌐',
  120.00,
  'USD',
  5,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  base_price = EXCLUDED.base_price,
  updated_at = NOW();

-- ============================================
-- MÓDULOS PARA RESTAURANTES
-- ============================================

-- Obtener el ID del template de restaurantes
DO $$
DECLARE
  restaurantes_template_id UUID;
BEGIN
  SELECT id INTO restaurantes_template_id FROM solution_templates WHERE slug = 'restaurantes';

  -- Menú Digital con QR
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'menu-qr',
    'Menú Digital con Código QR',
    'Crea un menú digital con fotos de tus platos. Genera código QR que los clientes escanean. Cambias precios en 2 clics, el QR siempre actualizado.',
    'core',
    restaurantes_template_id,
    0.00,
    true,
    'Menú Digital con Código QR',
    'Tu menú digital accesible desde cualquier dispositivo mediante código QR.',
    '1. Escanea el código QR de tu mesa\n2. Navega por las categorías del menú\n3. Selecciona los platos que deseas\n4. El menú se actualiza automáticamente cuando cambias precios',
    1,
    8.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Sistema de Mesas y Pedidos (POS)
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'pos-system',
    'Sistema de Mesas y Pedidos (POS)',
    'Ves todas tus mesas en pantalla (libre/ocupada). Creas pedidos tocando la mesa. Agregas platos tocando en el menú. La app calcula el total automáticamente.',
    'core',
    restaurantes_template_id,
    0.00,
    true,
    'Sistema de Mesas y Pedidos',
    'Gestiona todas tus mesas y pedidos desde un solo lugar.',
    '1. Selecciona una mesa en el mapa\n2. Crea un nuevo pedido\n3. Agrega platos desde el menú\n4. El sistema calcula el total automáticamente\n5. Marca el pedido como "En Preparación" cuando lo envíes a cocina',
    2,
    12.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Impresión Automática de Comandas
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'auto-print-comandas',
    'Impresión Automática de Comandas',
    'Cuando cambias pedido a "En Preparación", se imprime automáticamente en cocina. Cuando el cliente paga, se imprime la boleta automáticamente.',
    'core',
    restaurantes_template_id,
    0.00,
    true,
    'Impresión Automática de Comandas',
    'Las comandas y boletas se imprimen automáticamente.',
    '1. Configura tu impresora en la sección de Configuración\n2. Las comandas se imprimen automáticamente cuando cambias el estado del pedido\n3. Las boletas se imprimen cuando el cliente paga',
    3,
    4.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Control de Inventario y Stock
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'inventory-control',
    'Control de Inventario y Stock',
    'Registras todos tus ingredientes. La app te avisa cuando algo se está acabando. Ajustas stock al comprar o usar.',
    'advanced',
    restaurantes_template_id,
    20.00,
    false,
    'Control de Inventario',
    'Gestiona tu inventario y recibe alertas cuando algo se está acabando.',
    '1. Registra todos tus ingredientes en la sección de Inventario\n2. Establece niveles mínimos de stock\n3. Recibirás alertas cuando algo esté por acabarse\n4. Actualiza el stock cuando compres o uses ingredientes',
    4,
    10.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Recetas y Costos de Platos
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'recipes-costs',
    'Recetas y Costos de Platos',
    'Registras recetas de tus platos (qué ingredientes lleva cada uno). La app calcula cuánto cuesta hacer cada plato.',
    'advanced',
    restaurantes_template_id,
    15.00,
    false,
    'Recetas y Costos',
    'Calcula automáticamente el costo de cada plato basado en sus ingredientes.',
    '1. Crea recetas para cada plato en la sección de Recetas\n2. Agrega los ingredientes y sus cantidades\n3. El sistema calcula automáticamente el costo\n4. Ve el margen de ganancia de cada plato',
    5,
    8.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Registro de Compras a Proveedores
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'supplier-purchases',
    'Registro de Compras a Proveedores',
    'Registras cada compra que haces. La app actualiza automáticamente tu inventario. Tienes historial de todas tus compras.',
    'advanced',
    restaurantes_template_id,
    10.00,
    false,
    'Registro de Compras',
    'Registra todas tus compras y actualiza el inventario automáticamente.',
    '1. Ve a la sección de Compras\n2. Selecciona el proveedor\n3. Agrega los productos comprados\n4. El inventario se actualiza automáticamente',
    6,
    6.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Control de Gastos
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'expense-control',
    'Control de Gastos',
    'Registras todos tus gastos (luz, agua, sueldos, etc.). La app los organiza por categorías. Ves cuánto gastaste este mes.',
    'advanced',
    restaurantes_template_id,
    10.00,
    false,
    'Control de Gastos',
    'Organiza y categoriza todos tus gastos.',
    '1. Registra gastos en la sección de Gastos\n2. Selecciona la categoría (luz, agua, sueldos, etc.)\n3. Ve reportes mensuales de gastos\n4. Analiza en qué gastas más',
    7,
    6.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Dashboard y Reportes
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'dashboard-reports',
    'Dashboard y Reportes',
    'Ves en tiempo real: cuánto vendiste hoy, cuántas mesas están ocupadas, cuántos pedidos pendientes, cuánto gastaste este mes.',
    'core',
    restaurantes_template_id,
    0.00,
    true,
    'Dashboard y Reportes',
    'Vista general de tu negocio en tiempo real.',
    '1. Accede al Dashboard desde el menú principal\n2. Ve métricas en tiempo real: ventas, mesas, pedidos\n3. Explora reportes detallados por fecha\n4. Exporta reportes en PDF o Excel',
    8,
    8.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Gestión de Empleados y Propinas
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'employees-tips',
    'Gestión de Empleados y Propinas',
    'Registras a tus empleados (meseros, cocineros, etc.). Asignas propinas a cada empleado. La app calcula cuánto corresponde a cada uno.',
    'advanced',
    restaurantes_template_id,
    15.00,
    false,
    'Gestión de Empleados y Propinas',
    'Gestiona tu equipo y distribuye propinas de forma justa.',
    '1. Registra empleados en la sección de Empleados\n2. Asigna propinas por turno o por día\n3. El sistema calcula la distribución automática\n4. Genera reportes de propinas por empleado',
    9,
    8.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Menú Imprimible
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'printable-menu',
    'Menú Imprimible',
    'Genera un menú en formato PDF listo para imprimir. Puedes imprimirlo y ponerlo en las mesas. Se actualiza automáticamente cuando cambias precios.',
    'addon',
    restaurantes_template_id,
    5.00,
    false,
    'Menú Imprimible',
    'Genera menús en PDF para imprimir.',
    '1. Ve a la sección de Menú\n2. Haz clic en "Generar PDF"\n3. Descarga el PDF y imprímelo\n4. El PDF se actualiza automáticamente con los precios actuales',
    10,
    2.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

END $$;

-- ============================================
-- MÓDULOS PARA SERVICIO TÉCNICO
-- ============================================

DO $$
DECLARE
  servicio_tecnico_template_id UUID;
BEGIN
  SELECT id INTO servicio_tecnico_template_id FROM solution_templates WHERE slug = 'servicio-tecnico';

  -- Gestión de Órdenes de Reparación
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'repair-orders',
    'Gestión de Órdenes de Reparación',
    'Crea órdenes de reparación, registra problemas, estado de dispositivos, y seguimiento completo del proceso.',
    'core',
    servicio_tecnico_template_id,
    0.00,
    true,
    'Gestión de Órdenes de Reparación',
    'Crea y gestiona todas tus órdenes de reparación.',
    '1. Crea una nueva orden desde el botón "Nueva Orden"\n2. Ingresa los datos del cliente y dispositivo\n3. Describe el problema\n4. Completa el checklist del dispositivo\n5. Asigna técnico y prioridad',
    1,
    15.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Inventario de Repuestos
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'parts-inventory',
    'Inventario de Repuestos',
    'Gestiona tu inventario de repuestos, recibe alertas de stock bajo, y registra compras.',
    'advanced',
    servicio_tecnico_template_id,
    20.00,
    false,
    'Inventario de Repuestos',
    'Gestiona tu inventario de repuestos y componentes.',
    '1. Registra repuestos en la sección de Inventario\n2. Establece niveles mínimos\n3. Recibe alertas cuando algo se esté acabando\n4. Registra compras y actualiza stock',
    2,
    10.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Gestión de Clientes
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'client-management',
    'Gestión de Clientes',
    'Base de datos completa de clientes con historial de reparaciones y dispositivos.',
    'core',
    servicio_tecnico_template_id,
    0.00,
    true,
    'Gestión de Clientes',
    'Gestiona tu base de datos de clientes.',
    '1. Registra clientes en la sección de Clientes\n2. Ve el historial completo de reparaciones\n3. Accede rápidamente a información de contacto\n4. Genera reportes por cliente',
    3,
    8.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Sistema de Comisiones
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'commission-system',
    'Sistema de Comisiones',
    'Calcula comisiones automáticamente para técnicos basado en reparaciones completadas.',
    'advanced',
    servicio_tecnico_template_id,
    25.00,
    false,
    'Sistema de Comisiones',
    'Calcula y gestiona comisiones de técnicos.',
    '1. Configura porcentajes de comisión por técnico\n2. El sistema calcula automáticamente al completar reparaciones\n3. Ve reportes de comisiones por período\n4. Genera reportes para pago',
    4,
    10.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

  -- Reportes y Estadísticas
  INSERT INTO solution_modules (code, name, description, category, solution_template_id, base_price, is_required, manual_title, manual_description, manual_instructions, display_order, estimated_hours, is_active)
  VALUES (
    'reports-stats',
    'Reportes y Estadísticas',
    'Dashboard con métricas clave: órdenes pendientes, ingresos, tiempos promedio, etc.',
    'core',
    servicio_tecnico_template_id,
    0.00,
    true,
    'Reportes y Estadísticas',
    'Analiza el rendimiento de tu negocio.',
    '1. Accede al Dashboard para ver métricas en tiempo real\n2. Explora reportes por fecha, técnico, o tipo de reparación\n3. Exporta reportes en PDF o Excel\n4. Analiza tendencias y patrones',
    5,
    8.0,
    true
  )
  ON CONFLICT (code) DO UPDATE SET
    solution_template_id = EXCLUDED.solution_template_id,
    updated_at = NOW();

END $$;

-- ============================================
-- NOTA: Agregar más módulos para otras soluciones
-- siguiendo el mismo patrón cuando sea necesario
-- ============================================

-- ============================================
-- FIN DEL SEED
-- ============================================
