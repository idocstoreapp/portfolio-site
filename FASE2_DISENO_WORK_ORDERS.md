# FASE 2 - DISEÑO DEL SISTEMA DE WORK ORDERS

## 📋 OBJETIVO

Diseñar un sistema profesional de Work Orders (Órdenes de Trabajo) que:
- ✅ Se integre sin romper funcionalidad existente
- ✅ Sea modular y escalable
- ✅ Permita crear órdenes desde diagnósticos o manualmente
- ✅ Genere contratos PDF profesionales
- ✅ Genere manuales de usuario automáticos

---

## 🗄️ DISEÑO DE BASE DE DATOS

### **1. Tabla: `solution_templates`**

Almacena templates de soluciones extraídos de las páginas estáticas.

```sql
CREATE TABLE solution_templates (
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

CREATE INDEX idx_solution_templates_slug ON solution_templates(slug);
CREATE INDEX idx_solution_templates_active ON solution_templates(is_active);
```

**Datos iniciales:** Extraer de `/src/pages/soluciones/*.astro`

---

### **2. Tabla: `solution_modules`**

Módulos reutilizables que pueden incluirse en órdenes.

```sql
CREATE TABLE solution_modules (
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

CREATE INDEX idx_solution_modules_code ON solution_modules(code);
CREATE INDEX idx_solution_modules_template ON solution_modules(solution_template_id);
CREATE INDEX idx_solution_modules_active ON solution_modules(is_active);
```

**Relación con Templates:**
- Un `solution_template` puede tener múltiples `solution_modules`
- Los módulos pueden ser compartidos entre templates (ej: "Dashboard" en varias soluciones)

---

### **3. Tabla: `orders` (Work Orders)**

Órdenes de trabajo profesionales.

```sql
CREATE TABLE orders (
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
    'draft',        -- Borrador (no enviado)
    'sent',         -- Enviado al cliente
    'accepted',     -- Aceptado por cliente
    'in_development', -- En desarrollo
    'completed',    -- Completado
    'cancelled'     -- Cancelado
  )),
  
  -- Tipo de proyecto
  project_type TEXT NOT NULL CHECK (project_type IN (
    'sistema',      -- Sistema completo
    'web',          -- Página web
    'combinado',    -- Sistema + Web
    'custom'        -- Personalizado
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
  
  -- Términos legales
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

CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_diagnostico_id ON orders(diagnostico_id);
CREATE INDEX idx_orders_cliente_id ON orders(cliente_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_by ON orders(created_by);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
```

**Campos Clave:**
- `order_number`: Generado automáticamente (ORD-YYYY-NNN)
- `included_modules`: Array de UUIDs de `solution_modules`
- `excluded_modules`: Array de UUIDs explícitamente excluidos
- `total_price`: Calculado automáticamente (base + modules - discount + adjustments)

---

### **4. Tabla: `order_modules`**

Relación detallada entre órdenes y módulos (con precios personalizados).

```sql
CREATE TABLE order_modules (
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

CREATE INDEX idx_order_modules_order_id ON order_modules(order_id);
CREATE INDEX idx_order_modules_module_id ON order_modules(module_id);
```

**Propósito:**
- Permite personalizar precios por módulo en cada orden
- Permite excluir módulos específicos
- Permite agregar notas por módulo

---

### **5. Tabla: `order_terms`**

Términos legales por orden (para flexibilidad).

```sql
CREATE TABLE order_terms (
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

CREATE INDEX idx_order_terms_order_id ON order_terms(order_id);
```

**Propósito:**
- Permite personalizar términos legales por orden
- Cláusula automática: "Cualquier funcionalidad no descrita explícitamente no está incluida"

---

## 🔄 FLUJOS DE TRABAJO

### **Flujo 1: Diagnóstico → Orden**

```
1. Admin ve diagnóstico con estado 'cotizando'
2. Click en "Crear Orden de Trabajo"
3. Sistema pre-carga:
   - Datos del cliente (desde diagnóstico)
   - Solución principal recomendada
   - Módulos sugeridos (basados en diagnóstico)
4. Admin ajusta:
   - Módulos incluidos/excluidos
   - Precios personalizados
   - Términos legales
   - Personalización (logo, colores)
5. Sistema calcula total automáticamente
6. Admin genera PDF del contrato
7. Admin envía al cliente (cambia status a 'sent')
8. Cliente acepta (status → 'accepted')
9. Desarrollo comienza (status → 'in_development')
10. Al completar (status → 'completed'):
    - Se genera manual de usuario
    - Se entrega al cliente
```

### **Flujo 2: Orden Manual (sin diagnóstico)**

```
1. Admin crea orden manualmente
2. Ingresa datos del cliente
3. Selecciona solución template
4. Selecciona módulos
5. Configura precios y términos
6. Genera contrato PDF
7. (Resto igual al Flujo 1)
```

---

## 💰 SISTEMA DE PRECIOS

### **Cálculo Automático:**

```typescript
total_price = 
  base_price (del template) +
  SUM(modules_price) (módulos incluidos) +
  custom_adjustments (ajustes manuales) -
  discount_amount (descuento)
```

### **Precios Personalizados:**

- Cada módulo puede tener `custom_price` en `order_modules`
- Si `custom_price` es NULL, usa `base_price` del módulo
- Permite negociación y ajustes por cliente

### **Descuentos:**

- Campo `discount_amount` en `orders`
- Puede ser porcentaje o monto fijo (implementar lógica en backend)

---

## 📄 GENERACIÓN DE PDFs

### **1. Contrato PDF**

**Template HTML estructurado:**

```html
<!-- Cover Page -->
- Logo Maestro Digital
- Título: "ORDEN DE TRABAJO"
- Número de orden
- Fecha
- Cliente

<!-- Project Description -->
- Descripción del proyecto
- Tipo de proyecto
- Solución base

<!-- Scope Included -->
- Lista de módulos incluidos (con descripciones)
- Features personalizados

<!-- Scope Excluded -->
- Lista de módulos explícitamente excluidos
- Exclusiones generales
- Cláusula automática: "Cualquier funcionalidad no descrita..."

<!-- Economic Summary -->
- Desglose de precios
- Términos de pago
- Fechas estimadas

<!-- Legal Terms -->
- Garantía
- Política de mantenimiento
- Exclusiones
- Términos adicionales

<!-- Signatures -->
- Espacio para firma cliente
- Espacio para firma proveedor
- Fecha de aceptación
```

**Tecnología:** 
- Backend: `puppeteer` o `@react-pdf/renderer`
- Template: React component o HTML + CSS
- Almacenamiento: Supabase Storage o servidor de archivos

### **2. Manual de Usuario PDF**

**Generación Dinámica:**

```html
<!-- Cover -->
- Logo del cliente (si existe)
- Título: "Manual de Usuario"
- Nombre del sistema
- Fecha de generación

<!-- Table of Contents -->
- Generado automáticamente basado en módulos incluidos

<!-- Por cada módulo incluido: -->
<section>
  <h2>{module.manual_title}</h2>
  <p>{module.manual_description}</p>
  <h3>Instrucciones de Uso</h3>
  <p>{module.manual_instructions}</p>
  {module.manual_screenshots && (
    <img src={screenshot} />
  )}
</section>

<!-- Sección Final -->
- Contacto de soporte
- Preguntas frecuentes
- Recursos adicionales
```

**Lógica:**
- Solo incluye módulos con `status='included'` en la orden
- Ordena por `display_order` de los módulos
- Genera automáticamente tabla de contenidos

---

## 🎨 DISEÑO DE UI (Admin Panel)

### **Nueva Sección: "Work Orders"**

**Ruta:** `/admin/orders` (Next.js)

**Estructura:**

```
/admin/orders/
├── page.tsx              # Lista de órdenes
├── [id]/
│   └── page.tsx          # Detalle de orden
├── new/
│   ├── page.tsx          # Crear nueva orden
│   └── from-diagnostic/
│       └── [diagnosticId]/
│           └── page.tsx  # Crear desde diagnóstico
└── components/
    ├── OrderList.tsx
    ├── OrderCard.tsx
    ├── OrderForm.tsx
    ├── OrderDetail.tsx
    ├── ModuleSelector.tsx
    ├── PriceCalculator.tsx
    └── PDFGenerator.tsx
```

### **Componentes Principales:**

#### **1. OrderList.tsx**
- Tabla/Grid de órdenes
- Filtros: status, cliente, fecha
- Búsqueda
- Acciones: Ver, Editar, Duplicar, Generar PDF

#### **2. OrderForm.tsx**
- Formulario completo de creación/edición
- Secciones:
  - Información del Cliente
  - Solución y Módulos
  - Personalización
  - Precios y Términos
  - Términos Legales
- Validación en tiempo real
- Cálculo automático de total

#### **3. ModuleSelector.tsx**
- Lista de módulos disponibles
- Checkboxes para incluir/excluir
- Preview de descripción
- Precio por módulo
- Agrupación por categoría

#### **4. PriceCalculator.tsx**
- Muestra desglose de precios
- Permite ajustes manuales
- Calcula total en tiempo real
- Muestra descuentos

#### **5. PDFGenerator.tsx**
- Botón "Generar Contrato PDF"
- Botón "Generar Manual PDF"
- Preview del PDF (opcional)
- Descarga directa
- Envío por email (futuro)

---

## 🔌 API ENDPOINTS (NestJS)

### **Módulo: `orders`**

```typescript
// GET /api/orders
// Lista órdenes con paginación y filtros

// GET /api/orders/:id
// Obtiene orden completa con relaciones

// POST /api/orders
// Crea nueva orden

// POST /api/orders/from-diagnostic/:diagnosticId
// Crea orden desde diagnóstico (pre-carga datos)

// PUT /api/orders/:id
// Actualiza orden

// PUT /api/orders/:id/status
// Cambia estado de orden

// POST /api/orders/:id/generate-contract
// Genera PDF del contrato

// POST /api/orders/:id/generate-manual
// Genera PDF del manual de usuario

// GET /api/orders/:id/contract-pdf
// Descarga PDF del contrato

// GET /api/orders/:id/manual-pdf
// Descarga PDF del manual

// DELETE /api/orders/:id
// Elimina orden (soft delete recomendado)
```

### **Módulo: `solution-templates`**

```typescript
// GET /api/solution-templates
// Lista todos los templates

// GET /api/solution-templates/:id
// Obtiene template con módulos

// POST /api/solution-templates
// Crea template (admin only)

// PUT /api/solution-templates/:id
// Actualiza template (admin only)
```

### **Módulo: `solution-modules`**

```typescript
// GET /api/solution-modules
// Lista módulos (con filtros: template_id, category, etc.)

// GET /api/solution-modules/:id
// Obtiene módulo

// POST /api/solution-modules
// Crea módulo (admin only)

// PUT /api/solution-modules/:id
// Actualiza módulo (admin only)
```

---

## 🔒 SEGURIDAD Y PERMISOS

### **RLS Policies (Supabase):**

```sql
-- Orders: Solo admins pueden ver/editar
CREATE POLICY "Admin puede leer órdenes"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios_admin
      WHERE usuarios_admin.id = auth.uid()
      AND usuarios_admin.activo = true
      AND usuarios_admin.puede_ver_proyectos = true
    )
  );

-- Similar para INSERT, UPDATE, DELETE
```

### **Validaciones Backend:**

- Solo usuarios admin pueden crear/editar órdenes
- Validar que módulos seleccionados existan
- Validar que precios sean positivos
- Validar formato de `order_number`

---

## 📊 MIGRACIÓN DE DATOS

### **Paso 1: Crear Templates desde Páginas Estáticas**

Script para extraer datos de `/src/pages/soluciones/*.astro`:

```typescript
// scripts/migrate-solutions-to-templates.ts
// 1. Lee archivos .astro
// 2. Extrae: nombre, descripción, precio, módulos
// 3. Inserta en solution_templates
// 4. Inserta módulos en solution_modules
```

### **Paso 2: Datos Iniciales**

- Crear 5 `solution_templates` (uno por solución)
- Crear ~50-60 `solution_modules` (extraídos de las páginas)
- Relacionar módulos con templates

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **FASE 3: Base de Datos**
- [ ] Crear migración SQL con todas las tablas
- [ ] Crear índices
- [ ] Crear políticas RLS
- [ ] Script de migración de soluciones → templates
- [ ] Datos iniciales (templates y módulos)

### **FASE 4: Backend API**
- [ ] Módulo `orders` (NestJS)
- [ ] Módulo `solution-templates` (NestJS)
- [ ] Módulo `solution-modules` (NestJS)
- [ ] DTOs y validaciones
- [ ] Servicios de negocio
- [ ] Controladores REST

### **FASE 5: Admin UI**
- [ ] Sección "Work Orders" en sidebar
- [ ] OrderList component
- [ ] OrderForm component
- [ ] ModuleSelector component
- [ ] PriceCalculator component
- [ ] OrderDetail page
- [ ] Integración con API

### **FASE 6: PDF Generation**
- [ ] Template React para contrato
- [ ] Template React para manual
- [ ] Servicio de generación PDF (puppeteer)
- [ ] Almacenamiento en Supabase Storage
- [ ] Endpoints de descarga

### **FASE 7: Manuales de Usuario**
- [ ] Lógica de generación dinámica
- [ ] Template de manual
- [ ] Integración con módulos incluidos
- [ ] Generación automática al completar orden

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **FASE 1:** Análisis completado
2. ✅ **FASE 2:** Diseño completado
3. ⏭️ **FASE 3:** Implementar base de datos
4. ⏭️ **FASE 4:** Implementar backend API
5. ⏭️ **FASE 5:** Implementar admin UI
6. ⏭️ **FASE 6:** Implementar generación PDF
7. ⏭️ **FASE 7:** Implementar manuales

---

**Estado:** ✅ Diseño completo y listo para implementación  
**Riesgo:** 🟢 BAJO (extensión segura, no modifica existente)  
**Tiempo estimado:** 2-3 semanas de desarrollo
