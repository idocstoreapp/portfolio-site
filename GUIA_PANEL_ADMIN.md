# 🎛️ GUÍA: Panel de Administración

## 📋 Resumen

Se ha creado la base para el panel de administración. Ahora necesitas:

1. **Ejecutar la migración SQL** para agregar campos de costo y trabajo
2. **Crear el panel admin en Next.js** (según la arquitectura)
3. **Configurar autenticación admin con Supabase**

## 🔧 Paso 1: Ejecutar Migración SQL

Ejecuta este SQL en Supabase SQL Editor:

```sql
-- Agregar campos de costo y trabajo real a la tabla diagnosticos
ALTER TABLE diagnosticos 
ADD COLUMN IF NOT EXISTS costo_real DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS trabajo_real_horas DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS aprobado_por UUID REFERENCES auth.users(id);

-- Índices para búsquedas por aprobación
CREATE INDEX IF NOT EXISTS idx_diagnosticos_fecha_aprobacion ON diagnosticos(fecha_aprobacion DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_aprobado_por ON diagnosticos(aprobado_por);
```

## 🚀 Paso 2: Backend Actualizado

El backend ya está actualizado con:

✅ **Endpoint actualizado**: `PUT /api/diagnostic/:id/status`
- Ahora acepta `costoReal`, `trabajoRealHoras`, `aprobadoPor`
- Registra automáticamente `fecha_aprobacion` cuando se aprueba

✅ **DTO actualizado**: Incluye campos de costo y trabajo

✅ **Servicio actualizado**: Usa admin client para evitar problemas con RLS

## 📱 Paso 3: Crear Panel Admin

### Opción A: Panel Admin en Next.js (Recomendado)

Según la arquitectura, el panel admin debe estar en Next.js. Crea:

```
admin-panel/
├── app/
│   ├── layout.tsx
│   ├── page.tsx (Dashboard)
│   ├── login/
│   │   └── page.tsx
│   └── diagnosticos/
│       ├── page.tsx (Lista)
│       └── [id]/
│           └── page.tsx (Detalle y edición)
├── components/
│   ├── DiagnosticList.tsx
│   ├── DiagnosticCard.tsx
│   ├── DiagnosticForm.tsx
│   └── AuthGuard.tsx
└── lib/
    ├── supabase.ts
    └── api.ts
```

### Opción B: Panel Admin Simple en Astro (Temporal)

Si prefieres algo más rápido, puedes crear un panel simple en Astro:

```
src/pages/admin/
├── index.astro (Login)
├── dashboard.astro (Lista de diagnósticos)
└── diagnostico/[id].astro (Editar diagnóstico)
```

## 🔐 Paso 4: Autenticación Admin

### Crear Usuario Admin en Supabase

1. Ve a Supabase → **Authentication** → **Users**
2. Crea un nuevo usuario o usa uno existente
3. Anota el `id` del usuario
4. Ejecuta este SQL para agregarlo como admin:

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

## 📊 Endpoints Disponibles

### Listar Diagnósticos
```
GET /api/diagnostic?page=1&limit=20
```

### Obtener Diagnóstico
```
GET /api/diagnostic/:id
```

### Actualizar Diagnóstico
```
PUT /api/diagnostic/:id/status
Body: {
  status: 'proyecto' | 'cerrado',
  asignadoA?: string,
  notas?: string,
  costoReal?: number,
  trabajoRealHoras?: number,
  aprobadoPor?: string
}
```

## 🎨 Ejemplo de Uso

```typescript
// Actualizar diagnóstico con costo y trabajo
const response = await fetch(`http://localhost:3000/api/diagnostic/${id}/status`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    status: 'proyecto',
    costoReal: 50000,
    trabajoRealHoras: 40.5,
    aprobadoPor: 'user-id-here',
    notas: 'Proyecto aprobado y en desarrollo'
  })
});
```

## ✅ Próximos Pasos

1. Ejecutar la migración SQL
2. Crear usuario admin en Supabase
3. Decidir si usar Next.js o Astro para el panel
4. Implementar autenticación
5. Crear interfaz de lista de diagnósticos
6. Crear formulario de edición con costo y trabajo

---

**¿Quieres que cree el panel admin completo en Next.js o prefieres una versión simple en Astro?**




