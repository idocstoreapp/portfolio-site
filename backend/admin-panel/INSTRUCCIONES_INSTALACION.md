# 🚀 Instrucciones de Instalación - Panel de Administración

## 📋 Requisitos Previos

- Node.js 18+ instalado
- Backend Nest.js corriendo en `http://localhost:3000`
- Supabase configurado con las tablas necesarias

## 🔧 Instalación

### Paso 1: Instalar Dependencias

```bash
cd backend/admin-panel
npm install
```

### Paso 2: Configurar Variables de Entorno

Crea un archivo `.env.local` en `backend/admin-panel/`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

### Paso 3: Ejecutar Migración SQL

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Agregar campos de costo y trabajo real
ALTER TABLE diagnosticos 
ADD COLUMN IF NOT EXISTS costo_real DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS trabajo_real_horas DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_diagnosticos_fecha_aprobacion ON diagnosticos(fecha_aprobacion DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_aprobado_por ON diagnosticos(aprobado_por);
```

### Paso 4: Crear Usuario Admin

1. Ve a Supabase → **Authentication** → **Users**
2. Crea un nuevo usuario o usa uno existente
3. Anota el `id` del usuario
4. Ejecuta este SQL:

```sql
INSERT INTO usuarios_admin (id, nombre, email, rol, activo, puede_ver_diagnosticos, puede_editar_diagnosticos)
VALUES (
  'TU_USER_ID_AQUI',
  'Tu Nombre',
  'tu@email.com',
  'admin',
  true,
  true,
  true
);
```

### Paso 5: Iniciar el Panel

```bash
npm run dev
```

El panel estará disponible en: `http://localhost:3001`

## 🎯 Funcionalidades

### ✅ Dashboard
- Estadísticas generales
- Accesos rápidos

### ✅ Lista de Diagnósticos
- Filtros por estado, tipo de empresa, búsqueda
- Paginación
- Vista en tarjetas

### ✅ Detalle de Diagnóstico
- Ver información completa
- Actualizar estado
- Registrar costo real
- Registrar horas de trabajo
- Asignar a usuario
- Agregar notas
- Generar orden PDF

### ✅ Generación de Orden PDF
- Vista previa antes de generar
- PDF profesional con toda la información
- Descarga directa

## 📝 Flujo de Trabajo

1. **Ver Diagnósticos Nuevos**: `/diagnosticos?estado=nuevo`
2. **Revisar Diagnóstico**: Click en cualquier diagnóstico
3. **Aprobar Proyecto**: Cambiar estado a "Proyecto"
4. **Registrar Costos**: Ingresar costo real y horas trabajadas
5. **Generar Orden**: Click en "Generar Orden PDF"
6. **Cerrar Proyecto**: Cambiar estado a "Cerrado" cuando termine

## 🔐 Autenticación

- Usa Supabase Auth
- Solo usuarios en `usuarios_admin` con `activo = true` pueden acceder
- El login está en `/login`

## 🐛 Solución de Problemas

### Error: "Missing Supabase environment variables"
- Verifica que `.env.local` tenga todas las variables

### Error: "No tienes permisos de administrador"
- Verifica que el usuario esté en `usuarios_admin` con `activo = true`

### Error: "Backend no disponible"
- Asegúrate de que el backend Nest.js esté corriendo en `http://localhost:3000`

---

**¡Listo! Ya puedes gestionar todos los diagnósticos desde el panel admin.**




