-- ============================================
-- MIGRACIÓN: CAMPOS DE MANTENIMIENTO Y GESTIÓN DE CLIENTES
-- ============================================
-- Agrega campos para órdenes de mantenimiento y soporte
-- ============================================

-- ============================================
-- 1. AGREGAR CAMPOS DE TIPO DE ORDEN
-- ============================================

-- Modificar la tabla orders para soportar tipos de orden adicionales
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'project' CHECK (order_type IN ('project', 'maintenance', 'support'));

-- Campos específicos para mantenimiento
ALTER TABLE orders ADD COLUMN IF NOT EXISTS maintenance_type TEXT CHECK (maintenance_type IN ('monthly', 'one_time', 'hourly_bank'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS maintenance_start_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS maintenance_end_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS hourly_bank_total DECIMAL(5,2); -- Total de horas compradas
ALTER TABLE orders ADD COLUMN IF NOT EXISTS hourly_bank_used DECIMAL(5,2);  -- Horas usadas
ALTER TABLE orders ADD COLUMN IF NOT EXISTS related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL; -- Vinculado a proyecto

-- Descripción específica para mantenimiento/soporte
ALTER TABLE orders ADD COLUMN IF NOT EXISTS maintenance_description TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS maintenance_months INTEGER DEFAULT 0;

-- Campos para seguimiento de pagos recurrentes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recurring_price DECIMAL(12,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_payment_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS next_payment_date DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled'));

-- ============================================
-- 2. ÍNDICES PARA NUEVOS CAMPOS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_orders_order_type ON orders(order_type);
CREATE INDEX IF NOT EXISTS idx_orders_maintenance_type ON orders(maintenance_type);
CREATE INDEX IF NOT EXISTS idx_orders_maintenance_start_date ON orders(maintenance_start_date);
CREATE INDEX IF NOT EXISTS idx_orders_maintenance_end_date ON orders(maintenance_end_date);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS maintenance_status TEXT DEFAULT 'active' CHECK (maintenance_status IN ('active', 'expired', 'renewable', 'cancelled'));

-- ============================================
-- 3. AGREGAR CAMPOS ADICIONALES A CLIENTES
-- ============================================

-- Campos adicionales para gestión completa de clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS empresa_rut TEXT; -- RUT de la empresa (Chile)
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS direccion TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ciudad TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS pais TEXT DEFAULT 'Chile';
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS sitio_web TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fuente TEXT; -- Cómo nos encontró
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS total_invertido DECIMAL(12,2) DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS total_proyectos INTEGER DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS ultimo_contacto DATE;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS fecha_alta DATE; -- Cuándo se convirtió en cliente

-- ============================================
-- 4. TABLA: NOTAS DE CLIENTES
-- ============================================

CREATE TABLE IF NOT EXISTS client_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),

  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,
  tipo TEXT DEFAULT 'general' CHECK (tipo IN ('general', 'seguimiento', 'reunion', 'llamada', 'email')),
  
  -- Metadata
  es_recordatorio BOOLEAN DEFAULT false,
  fecha_recordatorio DATE
);

CREATE INDEX IF NOT EXISTS idx_client_notes_cliente_id ON client_notes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_by ON client_notes(created_by);
CREATE INDEX IF NOT EXISTS idx_client_notes_tipo ON client_notes(tipo);
CREATE INDEX IF NOT EXISTS idx_client_notes_es_recordatorio ON client_notes(es_recordatorio);

-- ============================================
-- 5. TABLA: INTERACCIONES CON CLIENTES
-- ============================================

CREATE TABLE IF NOT EXISTS client_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),

  tipo TEXT NOT NULL CHECK (tipo IN ('email', 'llamada', 'reunion', 'whatsapp', 'otro')),
  asunto TEXT,
  descripcion TEXT,
  resultado TEXT,
  
  -- Seguimiento
  requiere_seguimiento BOOLEAN DEFAULT false,
  fecha_seguimiento DATE
);

CREATE INDEX IF NOT EXISTS idx_client_interactions_cliente_id ON client_interactions(cliente_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_order_id ON client_interactions(order_id);
CREATE INDEX IF NOT EXISTS idx_client_interactions_tipo ON client_interactions(tipo);
CREATE INDEX IF NOT EXISTS idx_client_interactions_requiere_seguimiento ON client_interactions(requiere_seguimiento);

-- ============================================
-- 6. TABLA: PAGOS
-- ============================================

CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,

  monto DECIMAL(12,2) NOT NULL,
  moneda TEXT DEFAULT 'USD',
  tipo TEXT NOT NULL CHECK (tipo IN ('adelanto', 'parcial', 'total', 'mantenimiento', 'hora_adicional')),
  
  -- Estado
  estado TEXT DEFAULT 'pending' CHECK (estado IN ('pending', 'completed', 'cancelled', 'refunded')),
  fecha_pago DATE,
  fecha_vencimiento DATE,
  
  -- Método de pago
  metodo_pago TEXT CHECK (metodo_pago IN ('transferencia', 'tarjeta', 'efectivo', 'paypal', 'otro')),
  referencia_pago TEXT, -- Número de transferencia, ID de pago, etc.
  
  -- Notas
  notas TEXT
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_cliente_id ON payments(cliente_id);
CREATE INDEX IF NOT EXISTS idx_payments_estado ON payments(estado);
CREATE INDEX IF NOT EXISTS idx_payments_fecha_pago ON payments(fecha_pago);

-- ============================================
-- 7. TRIGGER PARA ACTUALIZAR TOTAL_INVERTIDO
-- ============================================

CREATE OR REPLACE FUNCTION update_cliente_total_invertido()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el total invertido del cliente cuando se completa un pago
  UPDATE clientes
  SET total_invertido = (
    SELECT COALESCE(SUM(monto), 0)
    FROM payments
    WHERE cliente_id = NEW.cliente_id
    AND estado = 'completed'
  ),
  total_proyectos = (
    SELECT COUNT(DISTINCT order_id)
    FROM payments
    WHERE cliente_id = NEW.cliente_id
    AND estado = 'completed'
    AND order_id IS NOT NULL
  )
  WHERE id = NEW.cliente_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cliente_total_invertido
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  WHEN (NEW.estado = 'completed')
  EXECUTE FUNCTION update_cliente_total_invertido();

-- ============================================
-- 8. FUNCIÓN: MÉTRICAS DE CLIENTE
-- ============================================

CREATE OR REPLACE FUNCTION get_cliente_metrics(p_cliente_id UUID)
RETURNS TABLE (
  total_orders BIGINT,
  completed_orders BIGINT,
  in_progress_orders BIGINT,
  total_spent DECIMAL(12,2),
  total_payments DECIMAL(12,2),
  pending_payments DECIMAL(12,2),
  active_maintenance_contracts BIGINT,
  last_order_date DATE,
  first_order_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT o.id)::BIGINT as total_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status = 'completed')::BIGINT as completed_orders,
    COUNT(DISTINCT o.id) FILTER (WHERE o.status IN ('in_development', 'accepted', 'sent'))::BIGINT as in_progress_orders,
    COALESCE(SUM(DISTINCT o.total_price) FILTER (WHERE o.status IN ('accepted', 'in_development', 'completed')), 0)::DECIMAL(12,2) as total_spent,
    COALESCE(SUM(p.monto) FILTER (WHERE p.estado = 'completed'), 0)::DECIMAL(12,2) as total_payments,
    COALESCE(SUM(p.monto) FILTER (WHERE p.estado = 'pending'), 0)::DECIMAL(12,2) as pending_payments,
    COUNT(DISTINCT o.id) FILTER (WHERE o.order_type = 'maintenance' AND o.maintenance_status = 'active')::BIGINT as active_maintenance_contracts,
    MIN(o.created_at)::DATE as first_order_date,
    MAX(o.created_at)::DATE as last_order_date
  FROM orders o
  LEFT JOIN payments p ON o.id = p.order_id
  WHERE o.cliente_id = p_cliente_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. POLÍTICAS RLS
-- ============================================

-- Habilitar RLS en nuevas tablas
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas para client_notes
CREATE POLICY "Admin puede leer notas de clientes"
  ON client_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
    )
  );

CREATE POLICY "Admin puede gestionar notas de clientes"
  ON client_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_editar_clientes = true
    )
  );

-- Políticas para client_interactions
CREATE POLICY "Admin puede leer interacciones"
  ON client_interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
    )
  );

CREATE POLICY "Admin puede gestionar interacciones"
  ON client_interactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_editar_clientes = true
    )
  );

-- Políticas para payments
CREATE POLICY "Admin puede leer pagos"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
    )
  );

CREATE POLICY "Admin puede gestionar pagos"
  ON payments
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
-- 10. COMENTARIOS
-- ============================================

COMMENT ON COLUMN orders.order_type IS 'Tipo de orden: project (proyecto nuevo), maintenance (mantenimiento), support (soporte)';
COMMENT ON COLUMN orders.maintenance_type IS 'Tipo de mantenimiento: monthly (mensual), one_time (puntual), hourly_bank (bolsa de horas)';
COMMENT ON COLUMN orders.hourly_bank_total IS 'Total de horas compradas en bolsa de horas';
COMMENT ON COLUMN orders.hourly_bank_used IS 'Horas usadas de la bolsa de horas';
COMMENT ON COLUMN orders.related_order_id IS 'Orden relacionada (ej: mantenimiento vinculado a proyecto)';
COMMENT ON COLUMN orders.maintenance_status IS 'Estado del mantenimiento: active, expired, renewable, cancelled';
COMMENT ON TABLE client_notes IS 'Notas internas sobre clientes';
COMMENT ON TABLE client_interactions IS 'Registro de interacciones con clientes';
COMMENT ON TABLE payments IS 'Registro de pagos de órdenes y mantenimientos';
COMMENT ON FUNCTION get_cliente_metrics(UUID) IS 'Obtiene métricas completas de un cliente';

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
