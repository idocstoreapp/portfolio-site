# 📊 Base de Datos - Schema SQL

## 🚀 Instrucciones de Instalación

### 1. Abrir Supabase SQL Editor

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**

### 2. Ejecutar el Schema

1. Abre el archivo `schema.sql` de esta carpeta
2. Copia **TODO** el contenido
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **Run** (o presiona `Ctrl+Enter`)

### 3. Verificar Instalación

Ejecuta esta consulta para verificar que las tablas se crearon:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('diagnosticos', 'clientes', 'proyectos', 'usuarios_admin');
```

Deberías ver 4 filas.

## 📋 Tablas Creadas

1. **diagnosticos** - Almacena diagnósticos realizados
2. **clientes** - Información de clientes y leads
3. **proyectos** - Proyectos asociados
4. **usuarios_admin** - Usuarios administrativos

## 🔒 Seguridad (RLS)

- Los diagnósticos pueden ser insertados por usuarios anónimos (para el wizard)
- Solo usuarios autenticados con rol admin pueden leer/editar
- Las políticas RLS están configuradas automáticamente

## ⚠️ Notas Importantes

- Este SQL crea las tablas si no existen (`IF NOT EXISTS`)
- Los índices mejoran el rendimiento de las consultas
- Las políticas RLS protegen los datos
- La función `obtener_estadisticas_diagnosticos()` es opcional pero útil

## 🔧 Próximos Pasos

Después de ejecutar el schema:

1. **Crear usuario admin**: 
   - Ve a Authentication > Users
   - Crea un usuario
   - Luego ejecuta:
   ```sql
   INSERT INTO usuarios_admin (id, nombre, email, rol)
   VALUES ('UUID_DEL_USUARIO', 'Tu Nombre', 'tu@email.com', 'admin');
   ```

2. **Probar el backend**:
   - Configura las variables de entorno
   - Ejecuta `npm run start:dev`
   - Prueba crear un diagnóstico con Postman


