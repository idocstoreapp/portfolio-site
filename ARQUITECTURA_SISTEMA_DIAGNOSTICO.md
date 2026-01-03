# 🏗️ ARQUITECTURA DEL SISTEMA DE DIAGNÓSTICO INTELIGENTE

## 📋 ANÁLISIS DE PROYECTOS EXISTENTES

### 1. Sistema de Reparaciones (`sistema-reparaciones/`)
**Stack detectado:**
- Astro + React
- Supabase (Auth, DB, Storage)
- TypeScript
- Tailwind CSS

**Funcionalidades clave:**
- Gestión de órdenes de servicio
- Técnicos y comisiones
- Gastos y ganancias
- Múltiples sucursales
- Sistema de usuarios con roles

**Lecciones aprendidas:**
- Uso de Supabase RLS (Row Level Security)
- Estructura modular de componentes React
- Gestión de estado con Zustand (probable)
- Autenticación con Supabase Auth

### 2. Cotizador App (`cotizador-app/`)
**Stack detectado:**
- Astro + React
- Supabase
- TypeScript
- Tailwind CSS

**Funcionalidades clave:**
- Cotización por componentes
- Cálculo de costos reales
- Mano de obra
- Margen de ganancia
- Gestión de personal (vendedores, trabajadores)
- Perfiles y permisos

**Lecciones aprendidas:**
- Cálculo complejo de costos
- Gestión de personal y perfiles
- Sistema de permisos granular

### 3. Sistema Gestión Órdenes (`odenes.clientes/sistema-gestion-ordenes/`)
**Funcionalidades clave:**
- Flujo: Cliente → Orden → Seguimiento → Cierre
- Gestión de clientes
- Órdenes de venta

---

## 🎯 OBJETIVO DEL SISTEMA DE DIAGNÓSTICO

Crear un **SISTEMA DE DIAGNÓSTICO INTELIGENTE** que:

1. **Detecte** el tipo de empresa del cliente
2. **Identifique** problemas operativos reales
3. **Determine** una o más soluciones necesarias
4. **Genere** una página resultado personalizada
5. **Redirija** a páginas-solución específicas
6. **Permita** contacto o solicitud de diagnóstico profesional

---

## 🏛️ ARQUITECTURA PROPUESTA

### **Backend: Nest.js + Supabase**

```
backend/
├── src/
│   ├── modules/
│   │   ├── diagnostic/
│   │   │   ├── diagnostic.controller.ts
│   │   │   ├── diagnostic.service.ts
│   │   │   ├── diagnostic.module.ts
│   │   │   └── dto/
│   │   │       ├── create-diagnostic.dto.ts
│   │   │       └── diagnostic-result.dto.ts
│   │   ├── solutions/
│   │   │   ├── solutions.controller.ts
│   │   │   ├── solutions.service.ts
│   │   │   └── solutions.module.ts
│   │   ├── clients/
│   │   │   ├── clients.controller.ts
│   │   │   ├── clients.service.ts
│   │   │   └── clients.module.ts
│   │   └── auth/
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       └── auth.module.ts
│   ├── common/
│   │   ├── supabase/
│   │   │   └── supabase.service.ts
│   │   └── guards/
│   │       └── supabase-auth.guard.ts
│   └── main.ts
├── package.json
└── tsconfig.json
```

### **Frontend: Astro (Público) + Next.js (Admin)**

```
portfolio-site/ (Astro - Público)
├── src/
│   ├── pages/
│   │   ├── diagnostico/
│   │   │   ├── index.astro (Wizard)
│   │   │   └── resultado/[id].astro (Resultado dinámico)
│   │   └── soluciones/
│   │       └── [slug].astro
│   ├── components/
│   │   └── DiagnosticWizard.astro (Mejorado)
│   └── utils/
│       └── diagnosticEngine.ts (Mejorado)

admin/ (Next.js - Panel Administrativo)
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── diagnosticos/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── clientes/
│   │   │   └── page.tsx
│   │   ├── proyectos/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   └── layout.tsx
├── components/
│   ├── DiagnosticTable.tsx
│   ├── ClientTable.tsx
│   └── DashboardStats.tsx
└── lib/
    └── supabase.ts
```

---

## 📊 MODELO DE DATOS (Supabase)

### **Tabla: `diagnosticos`**
```sql
CREATE TABLE diagnosticos (
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
  source TEXT DEFAULT 'web' -- web, admin, api
);

CREATE INDEX idx_diagnosticos_created_at ON diagnosticos(created_at DESC);
CREATE INDEX idx_diagnosticos_estado ON diagnosticos(estado);
CREATE INDEX idx_diagnosticos_solucion_principal ON diagnosticos(solucion_principal);
CREATE INDEX idx_diagnosticos_asignado_a ON diagnosticos(asignado_a);
```

### **Tabla: `clientes`**
```sql
CREATE TABLE clientes (
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

CREATE INDEX idx_clientes_email ON clientes(email);
CREATE INDEX idx_clientes_estado ON clientes(estado);
```

### **Tabla: `proyectos`**
```sql
CREATE TABLE proyectos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Información del proyecto
  nombre TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  diagnostico_id UUID REFERENCES diagnosticos(id),
  
  -- Tipo y estado
  tipo TEXT NOT NULL, -- 'sistema', 'web', 'combinado'
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

CREATE INDEX idx_proyectos_cliente_id ON proyectos(cliente_id);
CREATE INDEX idx_proyectos_estado ON proyectos(estado);
```

### **Tabla: `usuarios_admin`** (Extensión de auth.users)
```sql
CREATE TABLE usuarios_admin (
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
```

---

## 🔄 FLUJO COMPLETO DEL SISTEMA

### **1. Cliente Completa Diagnóstico (Astro)**

```
Usuario → Hero (CTA) 
  → Diagnóstico Wizard (7 pasos)
    → Guarda respuestas en Supabase (vía API Nest.js)
      → Motor de Decisión procesa respuestas
        → Genera resultado personalizado
          → Redirige a /diagnostico/resultado/[id]
            → Muestra solución principal + complementarias
              → CTA: "Solicitar cotización" o "Contactar especialista"
```

### **2. Admin Gestiona (Next.js)**

```
Admin → Login (Supabase Auth)
  → Dashboard
    → Ver diagnósticos nuevos
      → Asignar a vendedor
        → Cambiar estado (contactado → cotizando → proyecto)
          → Crear proyecto asociado
            → Seguimiento completo
```

### **3. Motor de Decisión Mejorado**

El motor actual (`diagnosticEngine.ts`) necesita mejoras basadas en proyectos reales:

**Lógica adicional:**
- Si necesita "stock" → Sistema de gestión obligatorio
- Si tiene "sucursales" → Sistema multi-sucursal
- Si necesita "empleados" → Sistema con gestión de personal
- Si necesita "catálogo" → Web con catálogo + sistema

**Combinaciones:**
- Sistema + Web (más común)
- Solo Sistema (si no necesita presencia online)
- Solo Web (si ya tiene sistema pero necesita presencia)

---

## 🛠️ IMPLEMENTACIÓN PASO A PASO

### **Fase 1: Backend Nest.js**
1. ✅ Crear estructura base Nest.js
2. ✅ Configurar Supabase client
3. ✅ Crear módulo de diagnóstico
4. ✅ Crear API endpoints
5. ✅ Integrar motor de decisión mejorado

### **Fase 2: Frontend Astro (Mejoras)**
1. ✅ Mejorar wizard actual
2. ✅ Conectar con API backend
3. ✅ Crear páginas resultado dinámicas
4. ✅ Mejorar motor de decisión

### **Fase 3: Panel Admin Next.js**
1. ⏳ Crear estructura Next.js
2. ⏳ Configurar Supabase Auth
3. ⏳ Dashboard principal
4. ⏳ Gestión de diagnósticos
5. ⏳ Gestión de clientes
6. ⏳ Gestión de proyectos

### **Fase 4: Integración Completa**
1. ⏳ Conectar todo el flujo
2. ⏳ Testing
3. ⏳ Deploy

---

## 📝 PRÓXIMOS PASOS

1. **Analizar más a fondo los proyectos existentes**
2. **Crear estructura backend Nest.js**
3. **Mejorar motor de decisión con lógica real**
4. **Crear API endpoints**
5. **Conectar frontend con backend**
6. **Crear panel administrativo**

