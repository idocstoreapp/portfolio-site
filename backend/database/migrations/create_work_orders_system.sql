-- ============================================
-- MIGRACIÓN: SISTEMA DE WORK ORDERS
-- ============================================
-- FASE 3: Extensión de Base de Datos
-- Fecha: 2024
-- ============================================
-- IMPORTANTE: Esta migración NO modifica tablas existentes
-- Solo agrega nuevas tablas para el sistema de Work Orders
-- ============================================

-- ============================================
-- 1. TABLA: solution_templates
-- ============================================
-- Almacena templates de soluciones extraídos de páginas estáticas
-- ============================================

CREATE TABLE IF NOT EXISTS solution_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Identificación
  slug TEXT NOT NULL UNIQUE, -- 'restaurantes', 'servicio-tecnico', etc.
  name TEXT NOT NULL, -- 'Sistema para Restaurantes'
  description TEXT, -- Descripción corta
  icon TEXT, -- Emoji o icono
  
  -- Precio base
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  -- Contenido (opcional, para referencia)
  marketing_content JSONB -- Contenido de la página estática
);

-- Índices para solution_templates
CREATE INDEX IF NOT EXISTS idx_solution_templates_slug ON solution_templates(slug);
CREATE INDEX IF NOT EXISTS idx_solution_templates_active ON solution_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_solution_templates_display_order ON solution_templates(display_order);

-- Comentarios
COMMENT ON TABLE solution_templates IS 'Templates de soluciones que pueden usarse para crear órdenes de trabajo';
COMMENT ON COLUMN solution_templates.slug IS 'Identificador único legible (usado en URLs)';
COMMENT ON COLUMN solution_templates.base_price IS 'Precio base de la solución sin módulos adicionales';
COMMENT ON COLUMN solution_templates.marketing_content IS 'Contenido de marketing extraído de la página estática (opcional)';

-- ============================================
-- 2. TABLA: solution_modules
-- ============================================
-- Módulos reutilizables que pueden incluirse en órdenes
-- ============================================

CREATE TABLE IF NOT EXISTS solution_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Identificación
  code TEXT NOT NULL UNIQUE, -- 'menu-qr', 'pos-system', 'inventory', etc.
  name TEXT NOT NULL, -- 'Menú Digital con Código QR'
  description TEXT, -- Descripción detallada
  
  -- Categoría
  category TEXT, -- 'core', 'advanced', 'addon'
  solution_template_id UUID REFERENCES solution_templates(id) ON DELETE SET NULL,
  
  -- Precio
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_required BOOLEAN DEFAULT false, -- Si es obligatorio para la solución
  
  -- Contenido para manual
  manual_title TEXT, -- Título para el manual
  manual_description TEXT, -- Descripción para el manual
  manual_instructions TEXT, -- Instrucciones de uso básicas
  manual_screenshots JSONB, -- URLs de screenshots (opcional)
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  estimated_hours DECIMAL(5,2) -- Horas estimadas de desarrollo
);

-- Índices para solution_modules
CREATE INDEX IF NOT EXISTS idx_solution_modules_code ON solution_modules(code);
CREATE INDEX IF NOT EXISTS idx_solution_modules_template ON solution_modules(solution_template_id);
CREATE INDEX IF NOT EXISTS idx_solution_modules_active ON solution_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_solution_modules_category ON solution_modules(category);
CREATE INDEX IF NOT EXISTS idx_solution_modules_display_order ON solution_modules(display_order);

-- Comentarios
COMMENT ON TABLE solution_modules IS 'Módulos reutilizables que pueden incluirse en órdenes de trabajo';
COMMENT ON COLUMN solution_modules.code IS 'Código único legible del módulo';
COMMENT ON COLUMN solution_modules.is_required IS 'Si es true, este módulo es obligatorio cuando se selecciona el template';
COMMENT ON COLUMN solution_modules.manual_title IS 'Título que aparecerá en el manual de usuario';
COMMENT ON COLUMN solution_modules.manual_instructions IS 'Instrucciones básicas de uso para el manual';

-- ============================================
-- 3. TABLA: orders (Work Orders)
-- ============================================
-- Órdenes de trabajo profesionales
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Número de orden (único, legible)
  order_number TEXT NOT NULL UNIQUE, -- 'ORD-2024-001'
  
  -- Relaciones
  diagnostico_id UUID REFERENCES diagnosticos(id) ON DELETE SET NULL,
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  solution_template_id UUID REFERENCES solution_templates(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id), -- Admin que creó la orden
  
  -- Información del cliente (snapshot al momento de creación)
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_company TEXT,
  
  -- Estado del proyecto
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',           -- Borrador (no enviado)
    'sent',            -- Enviado al cliente
    'accepted',        -- Aceptado por cliente
    'in_development',  -- En desarrollo
    'completed',       -- Completado
    'cancelled'        -- Cancelado
  )),
  
  -- Tipo de proyecto
  project_type TEXT NOT NULL CHECK (project_type IN (
    'sistema',         -- Sistema completo
    'web',             -- Página web
    'combinado',       -- Sistema + Web
    'custom'           -- Personalizado
  )),
  
  -- Alcance del proyecto
  scope_description TEXT, -- Descripción general del alcance
  included_modules JSONB, -- Array de IDs de módulos incluidos
  excluded_modules JSONB, -- Array de IDs de módulos explícitamente excluidos
  custom_features TEXT, -- Features personalizados no en módulos estándar
  
  -- Personalización
  branding_logo_url TEXT, -- URL del logo del cliente
  branding_colors JSONB, -- {primary: '#3b82f6', secondary: '#1e40af'}
  branding_notes TEXT, -- Notas sobre personalización
  
  -- Aspectos económicos
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  modules_price DECIMAL(12,2) NOT NULL DEFAULT 0, -- Suma de módulos adicionales
  custom_adjustments DECIMAL(12,2) NOT NULL DEFAULT 0, -- Ajustes manuales
  discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0, -- Descuento aplicado
  total_price DECIMAL(12,2) NOT NULL DEFAULT 0, -- Precio total final
  currency TEXT DEFAULT 'USD',
  
  -- Términos de pago
  payment_terms TEXT, -- '50% adelanto, 50% al finalizar'
  payment_schedule JSONB, -- [{amount: 500, due_date: '2024-02-01', status: 'pending'}]
  
  -- Términos legales (referencia a order_terms)
  warranty_text TEXT, -- Texto de garantía personalizado
  maintenance_policy TEXT, -- Política de mantenimiento
  exclusions_text TEXT, -- Qué NO está incluido
  
  -- Fechas
  sent_at TIMESTAMP WITH TIME ZONE, -- Cuando se envió al cliente
  accepted_at TIMESTAMP WITH TIME ZONE, -- Cuando el cliente aceptó
  started_at TIMESTAMP WITH TIME ZONE, -- Cuando comenzó desarrollo
  completed_at TIMESTAMP WITH TIME ZONE, -- Cuando se completó
  
  -- Fechas estimadas
  estimated_start_date DATE,
  estimated_completion_date DATE,
  
  -- Archivos generados
  contract_pdf_url TEXT, -- URL del PDF del contrato
  manual_pdf_url TEXT, -- URL del PDF del manual de usuario
  contract_generated_at TIMESTAMP WITH TIME ZONE,
  manual_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Notas internas
  internal_notes TEXT, -- Notas para el equipo
  client_notes TEXT, -- Notas/comentarios del cliente
  
  -- Metadata
  version INTEGER DEFAULT 1, -- Versión de la orden (si se modifica)
  parent_order_id UUID REFERENCES orders(id) ON DELETE SET NULL -- Si es una modificación
);

-- Índices para orders
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_diagnostico_id ON orders(diagnostico_id);
CREATE INDEX IF NOT EXISTS idx_orders_cliente_id ON orders(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_solution_template_id ON orders(solution_template_id);
CREATE INDEX IF NOT EXISTS idx_orders_project_type ON orders(project_type);

-- Comentarios
COMMENT ON TABLE orders IS 'Órdenes de trabajo profesionales generadas desde diagnósticos o manualmente';
COMMENT ON COLUMN orders.order_number IS 'Número único legible de la orden (formato: ORD-YYYY-NNN)';
COMMENT ON COLUMN orders.included_modules IS 'Array JSON de UUIDs de módulos incluidos en la orden';
COMMENT ON COLUMN orders.excluded_modules IS 'Array JSON de UUIDs de módulos explícitamente excluidos';
COMMENT ON COLUMN orders.total_price IS 'Precio total calculado: base_price + modules_price + custom_adjustments - discount_amount';

-- ============================================
-- 4. TABLA: order_modules
-- ============================================
-- Relación detallada entre órdenes y módulos
-- ============================================

CREATE TABLE IF NOT EXISTS order_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  module_id UUID NOT NULL REFERENCES solution_modules(id) ON DELETE CASCADE,
  
  -- Precio personalizado (puede diferir del base_price del módulo)
  custom_price DECIMAL(12,2),
  
  -- Estado del módulo en esta orden
  status TEXT DEFAULT 'included' CHECK (status IN ('included', 'excluded', 'optional')),
  
  -- Notas específicas para este módulo en esta orden
  notes TEXT,
  
  UNIQUE(order_id, module_id)
);

-- Índices para order_modules
CREATE INDEX IF NOT EXISTS idx_order_modules_order_id ON order_modules(order_id);
CREATE INDEX IF NOT EXISTS idx_order_modules_module_id ON order_modules(module_id);
CREATE INDEX IF NOT EXISTS idx_order_modules_status ON order_modules(status);

-- Comentarios
COMMENT ON TABLE order_modules IS 'Relación detallada entre órdenes y módulos con precios personalizados';
COMMENT ON COLUMN order_modules.custom_price IS 'Precio personalizado para este módulo en esta orden (NULL = usar base_price del módulo)';
COMMENT ON COLUMN order_modules.status IS 'Estado del módulo: included (incluido), excluded (excluido), optional (opcional)';

-- ============================================
-- 5. TABLA: order_terms
-- ============================================
-- Términos legales personalizables por orden
-- ============================================

CREATE TABLE IF NOT EXISTS order_terms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Términos personalizados
  warranty_days INTEGER DEFAULT 30,
  warranty_text TEXT, -- Texto completo de garantía
  maintenance_included BOOLEAN DEFAULT false,
  maintenance_months INTEGER DEFAULT 0,
  maintenance_text TEXT,
  
  -- Exclusiones
  exclusions JSONB, -- Array de exclusiones específicas
  exclusions_text TEXT, -- Texto completo de exclusiones
  
  -- Términos de pago
  payment_terms_text TEXT,
  late_payment_fee DECIMAL(12,2) DEFAULT 0,
  cancellation_policy TEXT,
  
  -- Términos de propiedad
  intellectual_property TEXT, -- 'Cliente', 'Compartido', 'Proveedor'
  source_code_access BOOLEAN DEFAULT false,
  
  -- Términos adicionales
  additional_terms TEXT, -- Términos adicionales personalizados
  
  UNIQUE(order_id)
);

-- Índices para order_terms
CREATE INDEX IF NOT EXISTS idx_order_terms_order_id ON order_terms(order_id);

-- Comentarios
COMMENT ON TABLE order_terms IS 'Términos legales personalizables por orden de trabajo';
COMMENT ON COLUMN order_terms.exclusions IS 'Array JSON de exclusiones específicas';
COMMENT ON COLUMN order_terms.intellectual_property IS 'Propiedad intelectual: Cliente, Compartido, o Proveedor';

-- ============================================
-- FUNCIÓN: Generar número de orden único
-- ============================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  new_order_number TEXT;
BEGIN
  -- Obtener año actual
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  -- Obtener el siguiente número de secuencia para este año
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-\d{4}-(\d+)') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM orders
  WHERE order_number LIKE 'ORD-' || year_part || '-%';
  
  -- Formatear número de orden
  new_order_number := 'ORD-' || year_part || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- Comentario
COMMENT ON FUNCTION generate_order_number() IS 'Genera un número de orden único en formato ORD-YYYY-NNN';

-- ============================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_solution_templates_updated_at
  BEFORE UPDATE ON solution_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solution_modules_updated_at
  BEFORE UPDATE ON solution_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_terms_updated_at
  BEFORE UPDATE ON order_terms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE solution_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_terms ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS: solution_templates
-- ============================================

-- Cualquiera puede leer templates activos (para frontend)
CREATE POLICY "Cualquiera puede leer templates activos"
  ON solution_templates
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Solo admins pueden leer todos los templates
CREATE POLICY "Admin puede leer todos los templates"
  ON solution_templates
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
    )
  );

-- Solo admins pueden insertar/actualizar templates
CREATE POLICY "Admin puede insertar templates"
  ON solution_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.rol = 'admin'
    )
  );

CREATE POLICY "Admin puede actualizar templates"
  ON solution_templates
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.rol = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS RLS: solution_modules
-- ============================================

-- Cualquiera puede leer módulos activos
CREATE POLICY "Cualquiera puede leer módulos activos"
  ON solution_modules
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Solo admins pueden leer todos los módulos
CREATE POLICY "Admin puede leer todos los módulos"
  ON solution_modules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
    )
  );

-- Solo admins pueden insertar/actualizar módulos
CREATE POLICY "Admin puede insertar módulos"
  ON solution_modules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.rol = 'admin'
    )
  );

CREATE POLICY "Admin puede actualizar módulos"
  ON solution_modules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.rol = 'admin'
    )
  );

-- ============================================
-- POLÍTICAS RLS: orders
-- ============================================

-- Solo admins pueden ver órdenes
CREATE POLICY "Admin puede leer órdenes"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_ver_proyectos = true
    )
  );

-- Solo admins pueden crear órdenes
CREATE POLICY "Admin puede insertar órdenes"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_editar_proyectos = true
    )
  );

-- Solo admins pueden actualizar órdenes
CREATE POLICY "Admin puede actualizar órdenes"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_editar_proyectos = true
    )
  );

-- ============================================
-- POLÍTICAS RLS: order_modules
-- ============================================

-- Solo admins pueden ver order_modules
CREATE POLICY "Admin puede leer order_modules"
  ON order_modules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_ver_proyectos = true
    )
  );

-- Solo admins pueden insertar/actualizar order_modules
CREATE POLICY "Admin puede gestionar order_modules"
  ON order_modules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_editar_proyectos = true
    )
  );

-- ============================================
-- POLÍTICAS RLS: order_terms
-- ============================================

-- Solo admins pueden ver order_terms
CREATE POLICY "Admin puede leer order_terms"
  ON order_terms
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_ver_proyectos = true
    )
  );

-- Solo admins pueden insertar/actualizar order_terms
CREATE POLICY "Admin puede gestionar order_terms"
  ON order_terms
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_editar_proyectos = true
    )
  );

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para obtener estadísticas de órdenes
CREATE OR REPLACE FUNCTION obtener_estadisticas_ordenes()
RETURNS TABLE (
  total_ordenes BIGINT,
  ordenes_draft BIGINT,
  ordenes_sent BIGINT,
  ordenes_accepted BIGINT,
  ordenes_in_development BIGINT,
  ordenes_completed BIGINT,
  total_revenue DECIMAL(12,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_ordenes,
    COUNT(*) FILTER (WHERE status = 'draft')::BIGINT as ordenes_draft,
    COUNT(*) FILTER (WHERE status = 'sent')::BIGINT as ordenes_sent,
    COUNT(*) FILTER (WHERE status = 'accepted')::BIGINT as ordenes_accepted,
    COUNT(*) FILTER (WHERE status = 'in_development')::BIGINT as ordenes_in_development,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as ordenes_completed,
    COALESCE(SUM(total_price) FILTER (WHERE status IN ('accepted', 'in_development', 'completed')), 0)::DECIMAL(12,2) as total_revenue
  FROM orders;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION obtener_estadisticas_ordenes() IS 'Obtiene estadísticas agregadas de órdenes de trabajo';

-- ============================================
-- COMENTARIOS FINALES
-- ============================================

COMMENT ON TABLE solution_templates IS 'Templates de soluciones que pueden usarse para crear órdenes de trabajo';
COMMENT ON TABLE solution_modules IS 'Módulos reutilizables que pueden incluirse en órdenes de trabajo';
COMMENT ON TABLE orders IS 'Órdenes de trabajo profesionales generadas desde diagnósticos o manualmente';
COMMENT ON TABLE order_modules IS 'Relación detallada entre órdenes y módulos con precios personalizados';
COMMENT ON TABLE order_terms IS 'Términos legales personalizables por orden de trabajo';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
-- Esta migración crea el sistema completo de Work Orders
-- sin modificar ninguna tabla existente.
-- ============================================
