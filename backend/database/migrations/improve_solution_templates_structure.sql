-- ============================================
-- MEJORAR ESTRUCTURA DE SOLUTION TEMPLATES
-- ============================================
-- Agrega campos para descripciones completas,
-- funcionalidades, y pricing estructurado
-- ============================================

-- Agregar campos adicionales a solution_templates
ALTER TABLE solution_templates 
ADD COLUMN IF NOT EXISTS description_detailed TEXT,
ADD COLUMN IF NOT EXISTS features_list JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS included_modules_default TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS base_functionality TEXT,
ADD COLUMN IF NOT EXISTS customization_options JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS pricing_structure JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS is_prefabricated BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS estimated_delivery_days INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS use_cases TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS screenshots_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Crear tabla de pricing rules para apps personalizadas
CREATE TABLE IF NOT EXISTS pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type VARCHAR(50) NOT NULL, -- 'section', 'function', 'integration', 'page', 'catalog_item'
  rule_name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(12,2) NOT NULL,
  unit VARCHAR(50) NOT NULL, -- 'per_section', 'per_function', 'per_integration', 'per_page', 'per_item'
  multiplier DECIMAL(5,2) DEFAULT 1.0,
  complexity_multipliers JSONB DEFAULT '{}'::jsonb, -- {"simple": 1.0, "medium": 1.5, "complex": 2.0}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_pricing_rules_type ON pricing_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_active ON pricing_rules(is_active);

-- Insertar reglas de pricing estándar
INSERT INTO pricing_rules (rule_type, rule_name, description, base_price, unit, complexity_multipliers) VALUES
-- Secciones de página web
('section', 'Sección Básica', 'Sección estática con contenido básico', 30000, 'per_section', '{"simple": 1.0, "medium": 1.3, "complex": 1.8}'),
('section', 'Sección con Formulario', 'Sección con formulario de contacto o similar', 50000, 'per_section', '{"simple": 1.0, "medium": 1.5, "complex": 2.0}'),
('section', 'Sección con Catálogo', 'Sección con catálogo de productos/servicios', 80000, 'per_section', '{"simple": 1.0, "medium": 1.4, "complex": 2.2}'),
('section', 'Sección con Carrito de Compras', 'Sección con carrito y checkout', 120000, 'per_section', '{"simple": 1.0, "medium": 1.6, "complex": 2.5}'),

-- Funciones de aplicación
('function', 'Función CRUD Básica', 'Crear, leer, actualizar y eliminar registros', 15000, 'per_function', '{"simple": 1.0, "medium": 1.4, "complex": 2.0}'),
('function', 'Función con Búsqueda y Filtros', 'CRUD con búsqueda avanzada y filtros', 30000, 'per_function', '{"simple": 1.0, "medium": 1.5, "complex": 2.2}'),
('function', 'Función con Reportes', 'CRUD con generación de reportes', 50000, 'per_function', '{"simple": 1.0, "medium": 1.6, "complex": 2.5}'),
('function', 'Función con Notificaciones', 'CRUD con sistema de notificaciones', 40000, 'per_function', '{"simple": 1.0, "medium": 1.5, "complex": 2.3}'),

-- Integraciones
('integration', 'Integración con Pasarela de Pago', 'Integración con Transbank, Stripe, etc.', 100000, 'per_integration', '{"simple": 1.0, "medium": 1.3, "complex": 1.8}'),
('integration', 'Integración con Email', 'Sistema de envío de emails transaccionales', 50000, 'per_integration', '{"simple": 1.0, "medium": 1.2, "complex": 1.6}'),
('integration', 'Integración con SMS', 'Sistema de envío de SMS', 80000, 'per_integration', '{"simple": 1.0, "medium": 1.3, "complex": 1.9}'),
('integration', 'Integración con API Externa', 'Integración con servicio externo vía API', 120000, 'per_integration', '{"simple": 1.0, "medium": 1.5, "complex": 2.2}'),

-- Páginas web
('page', 'Página Básica', 'Página estática con contenido', 40000, 'per_page', '{"simple": 1.0, "medium": 1.3, "complex": 1.8}'),
('page', 'Página con Formulario', 'Página con formulario funcional', 60000, 'per_page', '{"simple": 1.0, "medium": 1.5, "complex": 2.0}'),
('page', 'Landing Page', 'Página de aterrizaje optimizada', 80000, 'per_page', '{"simple": 1.0, "medium": 1.4, "complex": 2.2}'),

-- Catálogo/E-commerce
('catalog_item', 'Producto Básico', 'Producto con nombre, precio e imagen', 5000, 'per_item', '{"simple": 1.0, "medium": 1.2, "complex": 1.5}'),
('catalog_item', 'Producto con Variantes', 'Producto con variantes (tallas, colores, etc.)', 10000, 'per_item', '{"simple": 1.0, "medium": 1.4, "complex": 2.0}'),
('catalog_item', 'Producto con Configuración Compleja', 'Producto con múltiples opciones y configuraciones', 20000, 'per_item', '{"simple": 1.0, "medium": 1.6, "complex": 2.5}')

ON CONFLICT DO NOTHING;

-- Actualizar solution_templates existentes con información detallada
UPDATE solution_templates SET
  description_detailed = 'Sistema completo para restaurantes que incluye menú digital con código QR, sistema de pedidos en línea, gestión de mesas, comandas digitales y reportes de ventas. Ideal para restaurantes que buscan modernizar su operación y mejorar la experiencia del cliente.',
  features_list = '[
    {
      "name": "Menú Digital QR",
      "description": "Menú interactivo accesible mediante código QR, con categorías, descripciones, precios e imágenes",
      "included": true,
      "category": "core"
    },
    {
      "name": "Sistema de Pedidos",
      "description": "Los clientes pueden realizar pedidos directamente desde el menú digital",
      "included": true,
      "category": "core"
    },
    {
      "name": "Gestión de Mesas",
      "description": "Control de mesas disponibles, ocupadas y reservadas",
      "included": true,
      "category": "core"
    },
    {
      "name": "Comandas Digitales",
      "description": "Sistema de comandas digitales para cocina y bar",
      "included": true,
      "category": "core"
    },
    {
      "name": "Reportes de Ventas",
      "description": "Reportes detallados de ventas, productos más vendidos y análisis de ingresos",
      "included": true,
      "category": "core"
    }
  ]'::jsonb,
  base_functionality = 'Sistema completo de gestión para restaurantes con menú digital QR, pedidos en línea, gestión de mesas y comandas digitales.',
  is_prefabricated = true,
  estimated_delivery_days = 10,
  use_cases = ARRAY['Restaurantes', 'Cafeterías', 'Bares', 'Food Trucks', 'Delivery']
WHERE slug = 'restaurantes';

UPDATE solution_templates SET
  description_detailed = 'Sistema integral para servicios técnicos que permite gestionar reparaciones, inventario de repuestos, comisiones de técnicos, clientes y reportes. Perfecto para talleres de reparación de equipos electrónicos, computadoras, celulares, etc.',
  features_list = '[
    {
      "name": "Gestión de Reparaciones",
      "description": "Registro completo de órdenes de servicio con seguimiento de estado",
      "included": true,
      "category": "core"
    },
    {
      "name": "Gestión de Inventario",
      "description": "Control de repuestos y materiales con alertas de stock bajo",
      "included": true,
      "category": "core"
    },
    {
      "name": "Sistema de Comisiones",
      "description": "Cálculo automático de comisiones para técnicos según trabajos realizados",
      "included": true,
      "category": "core"
    },
    {
      "name": "Gestión de Clientes",
      "description": "Base de datos completa de clientes con historial de reparaciones",
      "included": true,
      "category": "core"
    },
    {
      "name": "Reportes y Análisis",
      "description": "Reportes de ingresos, trabajos realizados y análisis de rentabilidad",
      "included": true,
      "category": "core"
    }
  ]'::jsonb,
  base_functionality = 'Sistema completo para gestión de servicios técnicos con control de reparaciones, inventario, comisiones y clientes.',
  is_prefabricated = true,
  estimated_delivery_days = 12,
  use_cases = ARRAY['Servicios Técnicos', 'Reparación de Equipos', 'Talleres de Electrónica']
WHERE slug = 'servicio-tecnico';

UPDATE solution_templates SET
  description_detailed = 'Sistema especializado para talleres mecánicos que gestiona reparaciones de vehículos, inventario de repuestos, comisiones de mecánicos, clientes y reportes. Diseñado para optimizar la operación de talleres automotrices.',
  features_list = '[
    {
      "name": "Gestión de Reparaciones",
      "description": "Registro de órdenes de trabajo con diagnóstico, repuestos y mano de obra",
      "included": true,
      "category": "core"
    },
    {
      "name": "Gestión de Repuestos",
      "description": "Control de inventario de repuestos con códigos y proveedores",
      "included": true,
      "category": "core"
    },
    {
      "name": "Sistema de Comisiones",
      "description": "Cálculo automático de comisiones para mecánicos",
      "included": true,
      "category": "core"
    },
    {
      "name": "Historial de Vehículos",
      "description": "Registro completo del historial de cada vehículo",
      "included": true,
      "category": "core"
    },
    {
      "name": "Reportes Financieros",
      "description": "Reportes de ingresos, gastos y rentabilidad del taller",
      "included": true,
      "category": "core"
    }
  ]'::jsonb,
  base_functionality = 'Sistema completo para talleres mecánicos con gestión de reparaciones, repuestos, comisiones y clientes.',
  is_prefabricated = true,
  estimated_delivery_days = 12,
  use_cases = ARRAY['Talleres Mecánicos', 'Servicios Automotrices']
WHERE slug = 'taller-mecanico';

UPDATE solution_templates SET
  description_detailed = 'Sistema de cotizaciones personalizadas para fábricas y talleres que permite crear cotizaciones detalladas con cálculo automático de costos, materiales, mano de obra y márgenes de ganancia. Ideal para negocios que necesitan cotizar productos personalizados.',
  features_list = '[
    {
      "name": "Creación de Cotizaciones",
      "description": "Sistema completo para crear cotizaciones detalladas con productos y servicios",
      "included": true,
      "category": "core"
    },
    {
      "name": "Cálculo Automático",
      "description": "Cálculo automático de costos, materiales, mano de obra y totales",
      "included": true,
      "category": "core"
    },
    {
      "name": "Gestión de Productos",
      "description": "Catálogo de productos con precios y especificaciones",
      "included": true,
      "category": "core"
    },
    {
      "name": "Plantillas de Cotización",
      "description": "Plantillas personalizables para diferentes tipos de cotizaciones",
      "included": true,
      "category": "core"
    },
    {
      "name": "Seguimiento de Cotizaciones",
      "description": "Control de estado de cotizaciones (pendiente, aprobada, rechazada)",
      "included": true,
      "category": "core"
    }
  ]'::jsonb,
  base_functionality = 'Sistema de cotizaciones personalizadas con cálculo automático de costos y materiales.',
  is_prefabricated = true,
  estimated_delivery_days = 10,
  use_cases = ARRAY['Fábricas', 'Talleres', 'Empresas de Fabricación']
WHERE slug = 'cotizador-fabrica';

UPDATE solution_templates SET
  description_detailed = 'Desarrollo de sitios web profesionales y aplicaciones web personalizadas. Incluye diseño responsive, optimización SEO, panel de administración y funcionalidades según necesidades específicas del cliente.',
  features_list = '[
    {
      "name": "Diseño Responsive",
      "description": "Sitio web que se adapta a todos los dispositivos (móvil, tablet, desktop)",
      "included": true,
      "category": "core"
    },
    {
      "name": "Optimización SEO",
      "description": "Optimización para motores de búsqueda",
      "included": true,
      "category": "core"
    },
    {
      "name": "Panel de Administración",
      "description": "Panel para gestionar contenido del sitio",
      "included": true,
      "category": "core"
    },
    {
      "name": "Formularios de Contacto",
      "description": "Formularios funcionales con validación",
      "included": true,
      "category": "core"
    },
    {
      "name": "Integración con Redes Sociales",
      "description": "Integración con Facebook, Instagram, etc.",
      "included": false,
      "category": "optional"
    }
  ]'::jsonb,
  base_functionality = 'Desarrollo de sitios web profesionales con diseño responsive, SEO y panel de administración.',
  is_prefabricated = false,
  estimated_delivery_days = 14,
  use_cases = ARRAY['Empresas', 'Negocios', 'Profesionales', 'Startups']
WHERE slug = 'desarrollo-web';

-- Comentarios
COMMENT ON COLUMN solution_templates.description_detailed IS 'Descripción detallada y completa de la solución';
COMMENT ON COLUMN solution_templates.features_list IS 'Lista JSON de funcionalidades con nombre, descripción y si está incluida';
COMMENT ON COLUMN solution_templates.base_functionality IS 'Descripción breve de la funcionalidad base';
COMMENT ON COLUMN solution_templates.is_prefabricated IS 'Indica si es una app prefabricada o requiere desarrollo personalizado';
COMMENT ON COLUMN pricing_rules.rule_type IS 'Tipo de regla: section, function, integration, page, catalog_item';
COMMENT ON COLUMN pricing_rules.complexity_multipliers IS 'Multiplicadores de precio según complejidad: simple, medium, complex';
