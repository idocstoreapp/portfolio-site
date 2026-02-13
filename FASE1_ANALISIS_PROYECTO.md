# FASE 1 - ANÁLISIS COMPLETO DEL PROYECTO

## 📋 RESUMEN EJECUTIVO

**Proyecto:** Maestro Digital - Sistema de Diagnóstico y Gestión de Proyectos  
**Fecha de Análisis:** 2024  
**Objetivo:** Analizar arquitectura existente antes de implementar sistema de Work Orders profesional

---

## 🏗️ ARQUITECTURA ACTUAL

### **Stack Tecnológico**

#### **Frontend Principal (Marketing Site)**
- **Framework:** Astro 5.13.4
- **React:** 19.2.3 (para componentes interactivos)
- **Styling:** Tailwind CSS 4.1.12
- **Ubicación:** `/src/`

#### **Backend API**
- **Framework:** NestJS 10.3.0
- **Base de Datos:** Supabase (PostgreSQL)
- **ORM:** Supabase Client (no Prisma activo)
- **Ubicación:** `/backend/src/`
- **Puerto:** 3000

#### **Admin Panel**
- **Framework:** Next.js 16.1.1
- **React:** 19.2.3
- **Styling:** Tailwind CSS 4
- **Ubicación:** `/backend/admin-panel/`
- **Puerto:** 3001

---

## 📁 ESTRUCTURA DE CARPETAS

```
portfolio-site/
├── src/                          # Frontend Astro (Marketing)
│   ├── components/               # Componentes React/Astro
│   │   ├── admin/                # Componentes admin (Astro)
│   │   ├── diagnostic/           # Componentes de diagnóstico
│   │   └── ...                   # Componentes públicos
│   ├── pages/                    # Páginas Astro
│   │   ├── soluciones/           # Páginas estáticas de soluciones
│   │   ├── admin/                # Admin panel (Astro - legacy?)
│   │   └── ...                   # Páginas públicas
│   └── utils/                    # Utilidades
│
├── backend/                      # Backend NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── diagnostic/       # Módulo de diagnósticos
│   │   │   ├── clients/          # Módulo de clientes
│   │   │   ├── solutions/         # Módulo de soluciones (básico)
│   │   │   └── auth/             # Autenticación
│   │   └── common/
│   │       └── supabase/          # Servicio Supabase
│   │
│   ├── admin-panel/              # Admin Panel Next.js
│   │   ├── app/                  # App Router Next.js
│   │   │   ├── diagnosticos/     # Gestión de diagnósticos
│   │   │   └── proyectos/        # Gestión de proyectos (básico)
│   │   └── components/           # Componentes React
│   │
│   └── database/
│       ├── schema.sql            # Schema principal
│       └── migrations/           # Migraciones SQL
```

---

## 🗄️ MODELO DE DATOS ACTUAL

### **Tabla: `diagnosticos`**
```sql
- id (UUID, PK)
- created_at (TIMESTAMP)
- nombre, email, empresa, telefono (TEXT)
- tipo_empresa, nivel_digital, objetivos[], tamano (TEXT)
- necesidades_adicionales (TEXT[])
- solucion_principal (TEXT)
- soluciones_complementarias (TEXT[])
- urgencia (high|medium|low)
- match_score (INTEGER)
- estado (nuevo|contactado|cotizando|proyecto|cerrado)
- asignado_a (UUID → auth.users)
- notas (TEXT)
- costo_real (DECIMAL) -- Agregado en migración
- trabajo_real_horas (INTEGER) -- Agregado en migración
- operacion_actual, dolor_principal, situacion_actual (TEXT) -- Enhanced
- envelope_data (JSONB) -- Enhanced
```

**Relaciones:**
- `asignado_a` → `auth.users(id)`
- Referenciado por: `clientes.diagnostico_id`

### **Tabla: `clientes`**
```sql
- id (UUID, PK)
- created_at (TIMESTAMP)
- nombre, email, telefono, empresa (TEXT)
- diagnostico_id (UUID → diagnosticos.id)
- estado (lead|cliente|activo|inactivo)
- notas (TEXT)
- tags (TEXT[])
```

### **Tabla: `proyectos`**
```sql
- id (UUID, PK)
- created_at (TIMESTAMP)
- nombre (TEXT)
- cliente_id (UUID → clientes.id)
- diagnostico_id (UUID → diagnosticos.id)
- tipo (sistema|web|combinado)
- estado (cotizando|desarrollo|produccion|completado|cancelado)
- fecha_inicio, fecha_fin_estimada, fecha_fin_real (DATE)
- presupuesto_estimado, presupuesto_real (DECIMAL)
- descripcion, notas (TEXT)
```

**Estado Actual:** Tabla existe pero **NO se usa activamente** en el admin panel. El admin panel muestra diagnósticos con `estado='proyecto'` como "proyectos".

### **Tabla: `usuarios_admin`**
```sql
- id (UUID, PK → auth.users.id)
- nombre, email (TEXT)
- rol (admin|vendedor|soporte)
- permisos (BOOLEAN flags)
- activo (BOOLEAN)
```

---

## 🔍 ANÁLISIS DE SOLUCIONES

### **Estructura Actual: Páginas Estáticas**

Las soluciones están implementadas como **páginas Astro estáticas** en `/src/pages/soluciones/`:

- `restaurantes.astro`
- `servicio-tecnico.astro`
- `taller-mecanico.astro`
- `cotizador-fabrica.astro`
- `desarrollo-web.astro`

### **Contenido de las Soluciones:**

Cada solución contiene:
1. **Hero Section** (título, subtítulo, imagen, CTA)
2. **Pricing Highlight** (precio fijo, beneficios)
3. **Problem Cards** (problemas que resuelve)
4. **FeatureGrid** (lista de características/módulos)
5. **ProcessTimeline** (cómo funciona)
6. **RelatedProjects** (proyectos relacionados)
7. **TestimonialsSection** (testimonios)
8. **SolutionCTA** (call to action final)

### **Módulos/Features Identificados:**

**Restaurantes:**
- Menú Digital con QR
- Sistema de Mesas y Pedidos (POS)
- Impresión Automática de Comandas
- Control de Inventario y Stock
- Recetas y Costos de Platos
- Registro de Compras a Proveedores
- Control de Gastos
- Dashboard y Reportes
- Gestión de Empleados y Propinas
- Menú Imprimible

**Servicio Técnico:**
- Gestión de Órdenes de Reparación
- Inventario de Repuestos
- Gestión de Clientes
- Sistema de Comisiones
- Reportes y Estadísticas
- (Más módulos específicos...)

### **Conclusión sobre Soluciones:**

✅ **Lo que existe:**
- Páginas estáticas bien estructuradas
- Contenido detallado de cada solución
- Lista clara de módulos/features por solución
- Precios definidos

❌ **Lo que falta:**
- **NO hay base de datos para soluciones**
- **NO hay modelo de módulos reutilizables**
- **NO hay sistema de templates**
- **NO hay relación entre diagnósticos y módulos específicos**
- **NO hay sistema de precios modular**

---

## 🔐 SISTEMA DE AUTENTICACIÓN

### **Backend (NestJS)**
- Usa Supabase Auth
- Verifica usuarios en tabla `usuarios_admin`
- RLS (Row Level Security) habilitado

### **Admin Panel (Next.js)**
- `AuthGuard` component
- Verifica sesión con Supabase
- Redirige a `/login` si no autenticado

---

## 📊 FLUJO ACTUAL DE DIAGNÓSTICOS

1. **Cliente completa wizard** → `ConversationalDiagnosticWizard.tsx`
2. **Frontend calcula resultados** → Summary, Insights, PersonalizedMessage
3. **Se envía al backend** → `POST /api/diagnostic`
4. **Backend guarda en Supabase** → Tabla `diagnosticos`
5. **Admin ve diagnósticos** → `/admin/diagnosticos` (Next.js)
6. **Admin puede cambiar estado** → `PUT /api/diagnostic/:id/status`
7. **Cuando estado = 'proyecto'** → Aparece en `/admin/proyectos`

**Problema Identificado:** No hay conversión formal de Diagnóstico → Orden de Trabajo. Solo cambio de estado.

---

## ⚠️ RIESGOS DE MODIFICACIONES

### **Alto Riesgo (NO TOCAR)**
1. ❌ **Wizard de diagnóstico** (`ConversationalDiagnosticWizard.tsx`)
   - Lógica compleja de cálculo
   - Múltiples estados y validaciones
   - **NO MODIFICAR**

2. ❌ **Páginas públicas de soluciones** (`/src/pages/soluciones/*.astro`)
   - SEO optimizado
   - Contenido de marketing
   - **NO MODIFICAR** (solo leer para extraer estructura)

3. ❌ **Motor de diagnóstico** (`diagnostic-engine.ts`, `enhanced-diagnostic-engine.ts`)
   - Lógica de negocio crítica
   - **NO MODIFICAR**

### **Medio Riesgo (EXTENDER CON CUIDADO)**
1. ⚠️ **Tabla `diagnosticos`**
   - Ya tiene campos adicionales (migraciones)
   - Puede extenderse con campos nuevos
   - **EXTENDER, NO MODIFICAR EXISTENTES**

2. ⚠️ **Admin Panel Next.js**
   - Estructura establecida
   - **AGREGAR nuevas secciones, no modificar existentes**

### **Bajo Riesgo (SEGURO EXTENDER)**
1. ✅ **Nuevas tablas** (`orders`, `order_modules`, etc.)
   - No afectan funcionalidad existente
   - **SEGURO CREAR**

2. ✅ **Nuevos módulos NestJS**
   - Arquitectura modular
   - **SEGURO AGREGAR**

---

## 🎯 LO QUE FALTA PARA WORK ORDERS

### **1. Modelo de Datos**
- ❌ Tabla `orders` (órdenes de trabajo)
- ❌ Tabla `order_modules` (módulos incluidos en orden)
- ❌ Tabla `solution_templates` (templates de soluciones)
- ❌ Tabla `solution_modules` (módulos reutilizables)
- ❌ Tabla `order_terms` (términos legales por orden)

### **2. Sistema de Módulos**
- ❌ Base de datos de módulos
- ❌ Templates reutilizables
- ❌ Sistema de precios modular
- ❌ Relación módulos ↔ soluciones

### **3. Admin UI**
- ❌ Sección "Work Orders" en admin panel
- ❌ Formulario de creación de órdenes
- ❌ Vista de detalles de orden
- ❌ Conversión Diagnóstico → Orden

### **4. Generación de PDFs**
- ❌ Sistema de generación de contratos
- ❌ Templates HTML para PDFs
- ❌ Generación de manuales de usuario
- ❌ Almacenamiento de PDFs

### **5. Lógica de Negocio**
- ❌ Cálculo automático de precios
- ❌ Validación de alcance
- ❌ Gestión de términos legales
- ❌ Workflow de aprobación

---

## ✅ ESTRATEGIA DE EXTENSIÓN SEGURA

### **Principios:**
1. **No modificar tablas existentes** → Solo agregar nuevas
2. **No cambiar rutas existentes** → Solo agregar nuevas
3. **No modificar componentes existentes** → Solo crear nuevos
4. **Mantener compatibilidad hacia atrás** → Datos existentes siguen funcionando
5. **Extensión gradual** → Implementar por fases

### **Orden de Implementación:**
1. **FASE 1:** ✅ Análisis (COMPLETADO)
2. **FASE 2:** Diseño del sistema (SIGUIENTE)
3. **FASE 3:** Extensión de base de datos
4. **FASE 4:** Backend API (NestJS)
5. **FASE 5:** Admin UI (Next.js)
6. **FASE 6:** Generación de PDFs
7. **FASE 7:** Manuales de usuario

---

## 📝 NOTAS IMPORTANTES

1. **Soluciones son estáticas** → Necesitamos extraer estructura y crear templates en BD
2. **Proyectos existe pero no se usa** → Podemos reutilizar concepto o crear `orders` nueva
3. **Admin panel tiene 2 versiones** → Astro (`/src/pages/admin/`) y Next.js (`/backend/admin-panel/`)
   - **Usar Next.js** como principal (más moderno)
4. **Precios están hardcodeados** → Necesitamos sistema de precios dinámico
5. **No hay sistema de módulos** → Necesitamos crear desde cero

---

## 🚀 CONCLUSIÓN

El proyecto tiene una **base sólida** con:
- ✅ Sistema de diagnósticos funcional
- ✅ Admin panel básico
- ✅ Base de datos estructurada
- ✅ Autenticación y permisos

**Falta implementar:**
- ❌ Sistema profesional de Work Orders
- ❌ Módulos reutilizables
- ❌ Generación de contratos PDF
- ❌ Manuales de usuario

**Riesgo de implementación: BAJO** si seguimos la estrategia de extensión segura.

---

**Próximo Paso:** FASE 2 - Diseño del Sistema de Work Orders
