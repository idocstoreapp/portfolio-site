-- ============================================
-- MIGRACIÓN: MEJORAS PROFESIONALES DEL SISTEMA
-- ============================================
-- Fecha: 2024
-- ============================================
-- Agrega:
-- 1. Sistema de configuración de precios
-- 2. Sistema de Change Orders
-- 3. Garantías y términos legales pre-escritos
-- 4. Scope freeze y aprobaciones
-- 5. Límites cuantificables
-- ============================================

-- ============================================
-- 1. TABLA: pricing_config
-- ============================================
-- Configuración de precios para templates, módulos y servicios
-- ============================================

CREATE TABLE IF NOT EXISTS pricing_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Tipo de precio
  price_type TEXT NOT NULL CHECK (price_type IN (
    'template',           -- Precio de un solution_template
    'module',              -- Precio de un solution_module
    'customization_hour',  -- Precio por hora de personalización
    'revision',            -- Precio por revisión adicional
    'support_hour',        -- Precio por hora de soporte
    'maintenance_month'    -- Precio por mes de mantenimiento
  )),
  
  -- Referencia al item (NULL para tipos globales como customization_hour)
  item_id UUID, -- UUID del template o módulo
  item_code TEXT, -- Código del item (slug o code)
  
  -- Precio
  base_price DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'CLP',
  
  -- Configuración
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_to DATE,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(price_type, item_id, item_code, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_pricing_config_type ON pricing_config(price_type);
CREATE INDEX IF NOT EXISTS idx_pricing_config_item_id ON pricing_config(item_id);
CREATE INDEX IF NOT EXISTS idx_pricing_config_active ON pricing_config(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_config_effective ON pricing_config(effective_from, effective_to);

COMMENT ON TABLE pricing_config IS 'Configuración de precios para todos los servicios y productos';
COMMENT ON COLUMN pricing_config.price_type IS 'Tipo de precio: template, module, customization_hour, etc.';
COMMENT ON COLUMN pricing_config.item_id IS 'ID del template o módulo (NULL para tipos globales)';
COMMENT ON COLUMN pricing_config.item_code IS 'Código del item (slug o code) para referencia rápida';

-- ============================================
-- 2. TABLA: legal_templates
-- ============================================
-- Plantillas de garantías y términos legales pre-escritos
-- ============================================

CREATE TABLE IF NOT EXISTS legal_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Identificación
  code TEXT NOT NULL UNIQUE, -- 'web-basic', 'app-standard', 'system-enterprise', 'marketing-basic'
  name TEXT NOT NULL, -- 'Garantía Web Básica', 'Términos Sistema Empresarial'
  category TEXT NOT NULL CHECK (category IN (
    'web',           -- Páginas web
    'app',            -- Aplicaciones web
    'system',         -- Sistemas de gestión
    'marketing',      -- Marketing digital
    'combined',       -- Combinado
    'custom'          -- Personalizado
  )),
  
  -- Contenido
  warranty_text TEXT NOT NULL, -- Texto de garantía
  warranty_days INTEGER DEFAULT 30, -- Días de garantía
  
  maintenance_text TEXT, -- Política de mantenimiento
  maintenance_months INTEGER DEFAULT 0, -- Meses de mantenimiento incluido
  
  exclusions_text TEXT NOT NULL, -- Exclusiones estándar
  exclusions_list JSONB, -- Lista de exclusiones específicas
  
  -- Términos adicionales
  payment_terms_template TEXT, -- Plantilla de términos de pago
  intellectual_property TEXT DEFAULT 'Cliente', -- 'Cliente', 'Compartido', 'Proveedor'
  source_code_access BOOLEAN DEFAULT false,
  
  -- Términos automáticos
  automatic_clause TEXT, -- Cláusula automática estándar
  
  -- Configuración
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false, -- Si es la plantilla por defecto para su categoría
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_legal_templates_code ON legal_templates(code);
CREATE INDEX IF NOT EXISTS idx_legal_templates_category ON legal_templates(category);
CREATE INDEX IF NOT EXISTS idx_legal_templates_active ON legal_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_legal_templates_default ON legal_templates(category, is_default);

COMMENT ON TABLE legal_templates IS 'Plantillas de garantías y términos legales pre-escritos por tipo de proyecto';
COMMENT ON COLUMN legal_templates.code IS 'Código único de la plantilla (ej: web-basic, app-standard)';
COMMENT ON COLUMN legal_templates.category IS 'Categoría del proyecto: web, app, system, marketing, etc.';
COMMENT ON COLUMN legal_templates.is_default IS 'Si es la plantilla por defecto para su categoría';

-- ============================================
-- 3. TABLA: change_orders
-- ============================================
-- Órdenes de cambio para modificaciones fuera del scope original
-- ============================================

CREATE TABLE IF NOT EXISTS change_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Relación con orden original
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  
  -- Número de orden de cambio
  change_order_number TEXT NOT NULL UNIQUE, -- 'CO-2024-001'
  
  -- Descripción del cambio
  title TEXT NOT NULL, -- Título corto del cambio
  description TEXT NOT NULL, -- Descripción detallada
  reason TEXT, -- Razón del cambio
  
  -- Impacto estimado
  estimated_hours DECIMAL(10,2),
  estimated_cost DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'CLP',
  
  -- Estado
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',      -- Pendiente de aprobación
    'approved',      -- Aprobado por cliente
    'rejected',      -- Rechazado por cliente
    'in_progress',   -- En desarrollo
    'completed',     -- Completado
    'cancelled'      -- Cancelado
  )),
  
  -- Aprobación
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,
  
  -- Tracking real
  actual_hours DECIMAL(10,2),
  actual_cost DECIMAL(12,2),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Notas
  internal_notes TEXT,
  client_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_change_orders_order_id ON change_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_change_orders_status ON change_orders(status);
CREATE INDEX IF NOT EXISTS idx_change_orders_number ON change_orders(change_order_number);
CREATE INDEX IF NOT EXISTS idx_change_orders_created_at ON change_orders(created_at DESC);

COMMENT ON TABLE change_orders IS 'Órdenes de cambio para modificaciones fuera del scope original';
COMMENT ON COLUMN change_orders.change_order_number IS 'Número único legible de la orden de cambio';
COMMENT ON COLUMN change_orders.estimated_cost IS 'Costo estimado del cambio';
COMMENT ON COLUMN change_orders.actual_cost IS 'Costo real del cambio (puede diferir del estimado)';

-- ============================================
-- 4. CAMPOS ADICIONALES EN orders
-- ============================================
-- Scope freeze, límites cuantificables, etc.
-- ============================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS scope_approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scope_approved_by UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS scope_frozen BOOLEAN DEFAULT false;

-- Límites de revisiones
ALTER TABLE orders ADD COLUMN IF NOT EXISTS revisiones_incluidas INTEGER DEFAULT 2;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS revisiones_usadas INTEGER DEFAULT 0;

-- Límites de personalización
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customization_hours_included DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customization_hours_used DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customization_hour_rate DECIMAL(12,2);

-- Referencia a plantilla legal
ALTER TABLE orders ADD COLUMN IF NOT EXISTS legal_template_id UUID REFERENCES legal_templates(id);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_orders_scope_frozen ON orders(scope_frozen);
CREATE INDEX IF NOT EXISTS idx_orders_scope_approved ON orders(scope_approved_at);

COMMENT ON COLUMN orders.scope_frozen IS 'Si el scope está congelado (después de aprobar, solo se permiten Change Orders)';
COMMENT ON COLUMN orders.revisiones_incluidas IS 'Número de revisiones incluidas en el precio base';
COMMENT ON COLUMN orders.revisiones_usadas IS 'Número de revisiones ya utilizadas';
COMMENT ON COLUMN orders.customization_hours_included IS 'Horas de personalización incluidas en el precio base';
COMMENT ON COLUMN orders.customization_hours_used IS 'Horas de personalización ya utilizadas';
COMMENT ON COLUMN orders.customization_hour_rate IS 'Precio por hora de personalización adicional';

-- ============================================
-- FUNCIÓN: Generar número de Change Order
-- ============================================

CREATE OR REPLACE FUNCTION generate_change_order_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
  new_number TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Obtener el siguiente número de secuencia para este año
  SELECT COALESCE(MAX(CAST(SUBSTRING(change_order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO seq_num
  FROM change_orders
  WHERE change_order_number LIKE 'CO-' || year_part || '-%';
  
  -- Formatear: CO-YYYY-NNN
  new_number := 'CO-' || year_part || '-' || LPAD(seq_num::TEXT, 3, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS INICIALES: Plantillas Legales
-- ============================================

-- Plantilla para Web Básica
INSERT INTO legal_templates (code, name, category, warranty_text, warranty_days, maintenance_text, maintenance_months, exclusions_text, exclusions_list, payment_terms_template, automatic_clause, is_default, display_order)
VALUES (
  'web-basic',
  'Garantía Web Básica',
  'web',
  'Garantía de 30 días en todas las funcionalidades desarrolladas y descritas en este documento. Cubre exclusivamente corrección de bugs críticos y problemas de funcionamiento que impidan el uso normal del sitio web. NO cubre: cambios de diseño, nuevas funcionalidades, modificaciones de contenido, problemas causados por el cliente o terceros, incompatibilidades con navegadores o dispositivos no especificados, ni mejoras de rendimiento. La garantía se activa solo después del pago completo del proyecto.',
  30,
  'Soporte técnico incluido por 1 mes después de la entrega y pago completo. Incluye corrección de bugs críticos y asistencia técnica básica por email. NO incluye: modificaciones de diseño, nuevas funcionalidades, actualizaciones de contenido, capacitación presencial, soporte telefónico, ni mantenimiento después del período incluido.',
  1,
  'EXCLUSIONES EXPLÍCITAS: No incluye hosting, dominio, certificado SSL, ni servicios de terceros. No incluye capacitación presencial ni soporte telefónico. No incluye cambios mayores después de la aprobación del diseño. No incluye integraciones con sistemas externos sin cotización previa. No incluye mantenimiento después del período incluido. No incluye migración de datos desde sistemas anteriores. No incluye optimización SEO avanzada ni marketing digital. No incluye cambios de contenido después de la entrega. No incluye soporte para navegadores o dispositivos no especificados en el alcance.',
  '["hosting", "dominio", "certificado SSL", "servicios de terceros", "capacitación presencial", "soporte telefónico", "cambios mayores post-aprobación", "integraciones externas", "mantenimiento extendido", "migración de datos", "SEO avanzado", "marketing digital", "cambios de contenido", "soporte navegadores no especificados"]'::jsonb,
  'El pago del proyecto se realizará en dos partes: 50% del total como adelanto antes de iniciar el desarrollo, y 50% restante al momento de la entrega y antes de activar la garantía. El proyecto no iniciará hasta recibir el pago del 50% adelantado. En caso de cancelación por parte del cliente después de iniciado el proyecto, el adelanto no será reembolsable.',
  'Cualquier funcionalidad, característica o requisito no explícitamente descrito y detallado en este documento NO está incluida en el alcance del proyecto y requerirá una orden de cambio adicional con costo adicional. El alcance del proyecto está limitado exclusivamente a lo descrito en este documento.',
  true,
  1
) ON CONFLICT (code) DO UPDATE SET
  warranty_text = EXCLUDED.warranty_text,
  maintenance_text = EXCLUDED.maintenance_text,
  exclusions_text = EXCLUDED.exclusions_text,
  exclusions_list = EXCLUDED.exclusions_list,
  payment_terms_template = EXCLUDED.payment_terms_template,
  automatic_clause = EXCLUDED.automatic_clause;

-- Plantilla para App Web
INSERT INTO legal_templates (code, name, category, warranty_text, warranty_days, maintenance_text, maintenance_months, exclusions_text, exclusions_list, payment_terms_template, automatic_clause, is_default, display_order)
VALUES (
  'app-standard',
  'Garantía App Web Estándar',
  'app',
  'Garantía de 60 días en todas las funcionalidades desarrolladas y descritas en este documento. Cubre exclusivamente corrección de bugs críticos, problemas de funcionamiento que impidan el uso normal de la aplicación, y optimizaciones menores de rendimiento. NO cubre: cambios de diseño, nuevas funcionalidades, modificaciones de estructura de datos, problemas causados por el cliente o terceros, incompatibilidades con navegadores o dispositivos no especificados, escalabilidad para más usuarios de los especificados, ni mejoras de UX/UI. La garantía se activa solo después del pago completo del proyecto.',
  60,
  'Soporte técnico incluido por 2 meses después de la entrega y pago completo. Incluye corrección de bugs críticos, asistencia técnica por email, y actualizaciones de seguridad menores. NO incluye: modificaciones de diseño, nuevas funcionalidades, cambios en estructura de datos, capacitación presencial, soporte telefónico, ni mantenimiento después del período incluido.',
  2,
  'EXCLUSIONES EXPLÍCITAS: No incluye hosting, servidor, base de datos, ni servicios de terceros. No incluye capacitación presencial ni soporte telefónico. No incluye cambios mayores después de la aprobación del diseño. No incluye integraciones con sistemas externos sin cotización previa. No incluye mantenimiento después del período incluido. No incluye migración de datos desde sistemas anteriores. No incluye escalabilidad para más usuarios de los especificados. No incluye cambios en estructura de datos después de la entrega. No incluye soporte para navegadores o dispositivos no especificados en el alcance. No incluye optimización de rendimiento para cargas superiores a las especificadas.',
  '["hosting", "servidor", "base de datos", "servicios de terceros", "capacitación presencial", "soporte telefónico", "cambios mayores post-aprobación", "integraciones externas", "mantenimiento extendido", "migración de datos", "escalabilidad adicional", "cambios estructura datos", "soporte navegadores no especificados", "optimización carga superior"]'::jsonb,
  'El pago del proyecto se realizará en dos partes: 50% del total como adelanto antes de iniciar el desarrollo, y 50% restante al momento de la entrega y antes de activar la garantía. El proyecto no iniciará hasta recibir el pago del 50% adelantado. En caso de cancelación por parte del cliente después de iniciado el proyecto, el adelanto no será reembolsable.',
  'Cualquier funcionalidad, característica o requisito no explícitamente descrito y detallado en este documento NO está incluida en el alcance del proyecto y requerirá una orden de cambio adicional con costo adicional. El alcance del proyecto está limitado exclusivamente a lo descrito en este documento.',
  true,
  2
) ON CONFLICT (code) DO UPDATE SET
  warranty_text = EXCLUDED.warranty_text,
  maintenance_text = EXCLUDED.maintenance_text,
  exclusions_text = EXCLUDED.exclusions_text,
  exclusions_list = EXCLUDED.exclusions_list,
  payment_terms_template = EXCLUDED.payment_terms_template,
  automatic_clause = EXCLUDED.automatic_clause;

-- Plantilla para Sistema de Gestión
INSERT INTO legal_templates (code, name, category, warranty_text, warranty_days, maintenance_text, maintenance_months, exclusions_text, exclusions_list, payment_terms_template, automatic_clause, is_default, display_order)
VALUES (
  'system-enterprise',
  'Garantía Sistema Empresarial',
  'system',
  'Garantía de 90 días en todas las funcionalidades desarrolladas y descritas en este documento. Cubre exclusivamente corrección de bugs críticos, problemas de funcionamiento que impidan el uso normal del sistema, optimizaciones menores de rendimiento, y ajustes menores de configuración. NO cubre: cambios de diseño, nuevas funcionalidades, modificaciones de estructura de datos, problemas causados por el cliente o terceros, incompatibilidades con sistemas operativos o navegadores no especificados, escalabilidad para más usuarios de los especificados, ni mejoras de UX/UI. La garantía se activa solo después del pago completo del proyecto.',
  90,
  'Soporte técnico incluido por 3 meses después de la entrega y pago completo. Incluye corrección de bugs críticos, asistencia técnica por email, actualizaciones de seguridad menores, y optimizaciones menores. Se incluye documentación escrita y videos tutoriales. NO incluye: modificaciones de diseño, nuevas funcionalidades, cambios en estructura de datos, capacitación presencial, soporte telefónico, ni mantenimiento después del período incluido.',
  3,
  'EXCLUSIONES EXPLÍCITAS: No incluye hosting, servidor, base de datos, ni servicios de terceros. No incluye capacitación presencial (solo documentación y videos). No incluye cambios mayores después de la aprobación del diseño. No incluye integraciones con sistemas externos sin cotización previa. No incluye mantenimiento después del período incluido. No incluye migración de datos desde sistemas anteriores. No incluye hardware ni equipos. No incluye escalabilidad para más usuarios de los especificados. No incluye cambios en estructura de datos después de la entrega. No incluye soporte para sistemas operativos o navegadores no especificados en el alcance. No incluye optimización de rendimiento para cargas superiores a las especificadas.',
  '["hosting", "servidor", "base de datos", "servicios de terceros", "capacitación presencial", "soporte telefónico", "cambios mayores post-aprobación", "integraciones externas", "mantenimiento extendido", "migración de datos", "hardware", "equipos", "escalabilidad adicional", "cambios estructura datos", "soporte SO no especificados", "optimización carga superior"]'::jsonb,
  'El pago del proyecto se realizará en dos partes: 50% del total como adelanto antes de iniciar el desarrollo, y 50% restante al momento de la entrega y antes de activar la garantía. El proyecto no iniciará hasta recibir el pago del 50% adelantado. En caso de cancelación por parte del cliente después de iniciado el proyecto, el adelanto no será reembolsable.',
  'Cualquier funcionalidad, característica o requisito no explícitamente descrito y detallado en este documento NO está incluida en el alcance del proyecto y requerirá una orden de cambio adicional con costo adicional. El alcance del proyecto está limitado exclusivamente a lo descrito en este documento.',
  true,
  3
) ON CONFLICT (code) DO UPDATE SET
  warranty_text = EXCLUDED.warranty_text,
  maintenance_text = EXCLUDED.maintenance_text,
  exclusions_text = EXCLUDED.exclusions_text,
  exclusions_list = EXCLUDED.exclusions_list,
  payment_terms_template = EXCLUDED.payment_terms_template,
  automatic_clause = EXCLUDED.automatic_clause;

-- Plantilla para Marketing Digital
INSERT INTO legal_templates (code, name, category, warranty_text, warranty_days, maintenance_text, maintenance_months, exclusions_text, exclusions_list, payment_terms_template, automatic_clause, is_default, display_order)
VALUES (
  'marketing-basic',
  'Garantía Marketing Digital',
  'marketing',
  'Garantía de 30 días en todas las funcionalidades desarrolladas y descritas en este documento. Cubre exclusivamente corrección de bugs críticos y problemas de funcionamiento que impidan el uso normal de las herramientas de marketing. NO cubre: cambios de diseño, nuevas funcionalidades, creación de contenido adicional, gestión de campañas publicitarias, problemas causados por el cliente o terceros, ni mejoras de rendimiento. La garantía se activa solo después del pago completo del proyecto.',
  30,
  'Soporte técnico incluido por 1 mes después de la entrega y pago completo. Incluye corrección de bugs críticos y asistencia técnica básica por email. NO incluye: modificaciones de diseño, nuevas funcionalidades, creación de contenido, gestión de campañas, capacitación presencial, soporte telefónico, ni mantenimiento después del período incluido.',
  1,
  'EXCLUSIONES EXPLÍCITAS: No incluye gestión de campañas publicitarias ni creación de contenido adicional. No incluye capacitación presencial ni soporte telefónico. No incluye cambios mayores después de la aprobación del diseño. No incluye integraciones con sistemas externos sin cotización previa. No incluye mantenimiento después del período incluido. No incluye optimización SEO avanzada ni análisis de métricas. No incluye cambios de contenido después de la entrega.',
  '["gestión de campañas", "creación de contenido adicional", "capacitación presencial", "soporte telefónico", "cambios mayores post-aprobación", "integraciones externas", "mantenimiento extendido", "SEO avanzado", "análisis métricas", "cambios de contenido"]'::jsonb,
  'El pago del proyecto se realizará en dos partes: 50% del total como adelanto antes de iniciar el desarrollo, y 50% restante al momento de la entrega y antes de activar la garantía. El proyecto no iniciará hasta recibir el pago del 50% adelantado. En caso de cancelación por parte del cliente después de iniciado el proyecto, el adelanto no será reembolsable.',
  'Cualquier funcionalidad, característica o requisito no explícitamente descrito y detallado en este documento NO está incluida en el alcance del proyecto y requerirá una orden de cambio adicional con costo adicional. El alcance del proyecto está limitado exclusivamente a lo descrito en este documento.',
  true,
  4
) ON CONFLICT (code) DO UPDATE SET
  warranty_text = EXCLUDED.warranty_text,
  maintenance_text = EXCLUDED.maintenance_text,
  exclusions_text = EXCLUDED.exclusions_text,
  exclusions_list = EXCLUDED.exclusions_list,
  payment_terms_template = EXCLUDED.payment_terms_template,
  automatic_clause = EXCLUDED.automatic_clause;

-- Plantilla Combinada
INSERT INTO legal_templates (code, name, category, warranty_text, warranty_days, maintenance_text, maintenance_months, exclusions_text, exclusions_list, payment_terms_template, automatic_clause, is_default, display_order)
VALUES (
  'combined-standard',
  'Garantía Proyecto Combinado',
  'combined',
  'Garantía de 60 días en todas las funcionalidades desarrolladas y descritas en este documento. Cubre exclusivamente corrección de bugs críticos, problemas de funcionamiento que impidan el uso normal del sistema, y optimizaciones menores de rendimiento. NO cubre: cambios de diseño, nuevas funcionalidades, modificaciones de estructura de datos, problemas causados por el cliente o terceros, incompatibilidades con sistemas no especificados, escalabilidad adicional, ni mejoras de UX/UI. La garantía se activa solo después del pago completo del proyecto.',
  60,
  'Soporte técnico incluido por 2 meses después de la entrega y pago completo. Incluye corrección de bugs críticos, asistencia técnica por email, y actualizaciones de seguridad menores. NO incluye: modificaciones de diseño, nuevas funcionalidades, cambios en estructura de datos, capacitación presencial, soporte telefónico, ni mantenimiento después del período incluido.',
  2,
  'EXCLUSIONES EXPLÍCITAS: No incluye hosting, dominio, servidor, base de datos, ni servicios de terceros. No incluye capacitación presencial ni soporte telefónico. No incluye cambios mayores después de la aprobación del diseño. No incluye integraciones con sistemas externos sin cotización previa. No incluye mantenimiento después del período incluido. No incluye migración de datos desde sistemas anteriores. No incluye escalabilidad adicional. No incluye cambios en estructura de datos después de la entrega. No incluye soporte para sistemas no especificados en el alcance.',
  '["hosting", "dominio", "servidor", "base de datos", "servicios de terceros", "capacitación presencial", "soporte telefónico", "cambios mayores post-aprobación", "integraciones externas", "mantenimiento extendido", "migración de datos", "escalabilidad adicional", "cambios estructura datos", "soporte sistemas no especificados"]'::jsonb,
  'El pago del proyecto se realizará en dos partes: 50% del total como adelanto antes de iniciar el desarrollo, y 50% restante al momento de la entrega y antes de activar la garantía. El proyecto no iniciará hasta recibir el pago del 50% adelantado. En caso de cancelación por parte del cliente después de iniciado el proyecto, el adelanto no será reembolsable.',
  'Cualquier funcionalidad, característica o requisito no explícitamente descrito y detallado en este documento NO está incluida en el alcance del proyecto y requerirá una orden de cambio adicional con costo adicional. El alcance del proyecto está limitado exclusivamente a lo descrito en este documento.',
  true,
  5
) ON CONFLICT (code) DO UPDATE SET
  warranty_text = EXCLUDED.warranty_text,
  maintenance_text = EXCLUDED.maintenance_text,
  exclusions_text = EXCLUDED.exclusions_text,
  exclusions_list = EXCLUDED.exclusions_list,
  payment_terms_template = EXCLUDED.payment_terms_template,
  automatic_clause = EXCLUDED.automatic_clause;

-- ============================================
-- DATOS INICIALES: Precios por Defecto
-- ============================================

-- Precio por hora de personalización (global)
INSERT INTO pricing_config (price_type, base_price, currency, is_active, notes)
VALUES (
  'customization_hour',
  50000,
  'CLP',
  true,
  'Precio por hora de personalización adicional'
) ON CONFLICT DO NOTHING;

-- Precio por revisión adicional (global)
INSERT INTO pricing_config (price_type, base_price, currency, is_active, notes)
VALUES (
  'revision',
  50000,
  'CLP',
  true,
  'Precio por revisión adicional después de las incluidas'
) ON CONFLICT DO NOTHING;

-- Precio por hora de soporte (global)
INSERT INTO pricing_config (price_type, base_price, currency, is_active, notes)
VALUES (
  'support_hour',
  40000,
  'CLP',
  true,
  'Precio por hora de soporte técnico adicional'
) ON CONFLICT DO NOTHING;

-- Precio por mes de mantenimiento (global)
INSERT INTO pricing_config (price_type, base_price, currency, is_active, notes)
VALUES (
  'maintenance_month',
  100000,
  'CLP',
  true,
  'Precio por mes de mantenimiento extendido'
) ON CONFLICT DO NOTHING;

-- ============================================
-- RLS (Row Level Security)
-- ============================================

-- Habilitar RLS en las nuevas tablas
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

-- Políticas para pricing_config (solo admins pueden ver/editar)
DROP POLICY IF EXISTS "Admins can view pricing_config" ON pricing_config;
CREATE POLICY "Admins can view pricing_config" ON pricing_config
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert pricing_config" ON pricing_config;
CREATE POLICY "Admins can insert pricing_config" ON pricing_config
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update pricing_config" ON pricing_config;
CREATE POLICY "Admins can update pricing_config" ON pricing_config
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete pricing_config" ON pricing_config;
CREATE POLICY "Admins can delete pricing_config" ON pricing_config
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para legal_templates (todos pueden leer, solo admins pueden editar)
DROP POLICY IF EXISTS "Anyone can view legal_templates" ON legal_templates;
CREATE POLICY "Anyone can view legal_templates" ON legal_templates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert legal_templates" ON legal_templates;
CREATE POLICY "Admins can insert legal_templates" ON legal_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update legal_templates" ON legal_templates;
CREATE POLICY "Admins can update legal_templates" ON legal_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete legal_templates" ON legal_templates;
CREATE POLICY "Admins can delete legal_templates" ON legal_templates
  FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para change_orders (solo admins pueden ver/editar)
DROP POLICY IF EXISTS "Admins can view change_orders" ON change_orders;
CREATE POLICY "Admins can view change_orders" ON change_orders
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can insert change_orders" ON change_orders;
CREATE POLICY "Admins can insert change_orders" ON change_orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can update change_orders" ON change_orders;
CREATE POLICY "Admins can update change_orders" ON change_orders
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins can delete change_orders" ON change_orders;
CREATE POLICY "Admins can delete change_orders" ON change_orders
  FOR DELETE USING (auth.role() = 'authenticated');
