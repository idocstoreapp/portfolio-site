-- ============================================
-- SCHEMA DE BASE DE DATOS - MAESTRO DIGITAL
-- ============================================
-- Ejecutar este SQL en Supabase SQL Editor
-- ============================================

-- Tabla: diagnosticos
CREATE TABLE IF NOT EXISTS diagnosticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Información del cliente
  nombre TEXT,
  email TEXT,
  empresa TEXT,
  telefono TEXT,
  
  -- Respuestas del diagnóstico
  tipo_empresa TEXT NOT NULL,
  nivel_digital TEXT NOT NULL,
  objetivos TEXT[] NOT NULL,
  tamano TEXT NOT NULL,
  necesidades_adicionales TEXT[],
  
  -- Resultado del motor
  solucion_principal TEXT NOT NULL,
  soluciones_complementarias TEXT[],
  urgencia TEXT CHECK (urgencia IN ('high', 'medium', 'low')),
  match_score INTEGER,
  
  -- Estado y seguimiento
  estado TEXT DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'contactado', 'cotizando', 'proyecto', 'cerrado')),
  asignado_a UUID REFERENCES auth.users(id),
  notas TEXT,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  source TEXT DEFAULT 'web'
);

-- Índices para diagnosticos
CREATE INDEX IF NOT EXISTS idx_diagnosticos_created_at ON diagnosticos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_estado ON diagnosticos(estado);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_solucion_principal ON diagnosticos(solucion_principal);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_asignado_a ON diagnosticos(asignado_a);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_email ON diagnosticos(email);

-- Tabla: clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Información básica
  nombre TEXT NOT NULL,
  email TEXT UNIQUE,
  telefono TEXT,
  empresa TEXT,
  
  -- Relación con diagnóstico
  diagnostico_id UUID REFERENCES diagnosticos(id),
  
  -- Estado
  estado TEXT DEFAULT 'lead' CHECK (estado IN ('lead', 'cliente', 'activo', 'inactivo')),
  
  -- Metadata
  notas TEXT,
  tags TEXT[]
);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON clientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_diagnostico_id ON clientes(diagnostico_id);

-- Tabla: proyectos
CREATE TABLE IF NOT EXISTS proyectos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Información del proyecto
  nombre TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  diagnostico_id UUID REFERENCES diagnosticos(id),
  
  -- Tipo y estado
  tipo TEXT NOT NULL CHECK (tipo IN ('sistema', 'web', 'combinado')),
  estado TEXT DEFAULT 'cotizando' CHECK (estado IN ('cotizando', 'desarrollo', 'produccion', 'completado', 'cancelado')),
  
  -- Fechas
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  fecha_fin_real DATE,
  
  -- Presupuesto
  presupuesto_estimado DECIMAL(12,2),
  presupuesto_real DECIMAL(12,2),
  
  -- Metadata
  descripcion TEXT,
  notas TEXT
);

-- Índices para proyectos
CREATE INDEX IF NOT EXISTS idx_proyectos_cliente_id ON proyectos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_proyectos_estado ON proyectos(estado);
CREATE INDEX IF NOT EXISTS idx_proyectos_diagnostico_id ON proyectos(diagnostico_id);

-- Tabla: usuarios_admin (Extensión de auth.users)
CREATE TABLE IF NOT EXISTS usuarios_admin (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Información
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rol TEXT DEFAULT 'admin' CHECK (rol IN ('admin', 'vendedor', 'soporte')),
  
  -- Permisos
  puede_ver_diagnosticos BOOLEAN DEFAULT true,
  puede_editar_diagnosticos BOOLEAN DEFAULT true,
  puede_ver_clientes BOOLEAN DEFAULT true,
  puede_editar_clientes BOOLEAN DEFAULT true,
  puede_ver_proyectos BOOLEAN DEFAULT true,
  puede_editar_proyectos BOOLEAN DEFAULT false,
  
  -- Estado
  activo BOOLEAN DEFAULT true
);

-- Índices para usuarios_admin
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_email ON usuarios_admin(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_rol ON usuarios_admin(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_admin_activo ON usuarios_admin(activo);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Políticas para diagnosticos
-- Permitir insertar a cualquiera (para diagnósticos anónimos)
CREATE POLICY "Permitir insertar diagnósticos"
  ON diagnosticos
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permitir leer a usuarios autenticados (admin)
CREATE POLICY "Admin puede leer diagnósticos"
  ON diagnosticos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_ver_diagnosticos = true
    )
  );

-- Permitir actualizar a usuarios autenticados (admin)
CREATE POLICY "Admin puede actualizar diagnósticos"
  ON diagnosticos
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_editar_diagnosticos = true
    )
  );

-- Políticas para clientes
CREATE POLICY "Admin puede leer clientes"
  ON clientes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_ver_clientes = true
    )
  );

CREATE POLICY "Admin puede insertar clientes"
  ON clientes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_editar_clientes = true
    )
  );

CREATE POLICY "Admin puede actualizar clientes"
  ON clientes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_editar_clientes = true
    )
  );

-- Políticas para proyectos
CREATE POLICY "Admin puede leer proyectos"
  ON proyectos
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

CREATE POLICY "Admin puede insertar proyectos"
  ON proyectos
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

CREATE POLICY "Admin puede actualizar proyectos"
  ON proyectos
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

-- Políticas para usuarios_admin
CREATE POLICY "Usuarios pueden leer su propio perfil"
  ON usuarios_admin
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Solo admin puede insertar usuarios"
  ON usuarios_admin
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.rol = 'admin'
    )
  );

-- ============================================
-- FUNCIONES ÚTILES (Opcional)
-- ============================================

-- Función para obtener estadísticas de diagnósticos
CREATE OR REPLACE FUNCTION obtener_estadisticas_diagnosticos()
RETURNS TABLE (
  total_diagnosticos BIGINT,
  diagnosticos_nuevos BIGINT,
  diagnosticos_contactados BIGINT,
  diagnosticos_cotizando BIGINT,
  diagnosticos_proyecto BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_diagnosticos,
    COUNT(*) FILTER (WHERE estado = 'nuevo')::BIGINT as diagnosticos_nuevos,
    COUNT(*) FILTER (WHERE estado = 'contactado')::BIGINT as diagnosticos_contactados,
    COUNT(*) FILTER (WHERE estado = 'cotizando')::BIGINT as diagnosticos_cotizando,
    COUNT(*) FILTER (WHERE estado = 'proyecto')::BIGINT as diagnosticos_proyecto
  FROM diagnosticos;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE diagnosticos IS 'Almacena todos los diagnósticos realizados por los clientes';
COMMENT ON TABLE clientes IS 'Información de clientes y leads';
COMMENT ON TABLE proyectos IS 'Proyectos asociados a clientes y diagnósticos';
COMMENT ON TABLE usuarios_admin IS 'Usuarios administrativos del sistema';


