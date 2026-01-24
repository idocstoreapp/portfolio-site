# Configuración de Supabase para Diagnósticos

## ¿Por qué usar Supabase?

Guardar los diagnósticos te permite:
- **Analizar tendencias**: Ver qué tipos de empresas buscan más
- **Mejorar el motor**: Ajustar las recomendaciones basado en datos reales
- **Seguimiento de leads**: Contactar a quienes completaron el diagnóstico
- **Métricas**: Medir conversión del diagnóstico a clientes

## Pasos de Configuración

### 1. Instalar dependencia

```bash
npm install @supabase/supabase-js
```

### 2. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta (gratis hasta cierto límite)
3. Crea un nuevo proyecto
4. Copia la URL y la Anon Key desde Settings > API

### 3. Configurar variables de entorno

Crea o edita `.env.local` en la raíz del proyecto:

```env
PUBLIC_SUPABASE_URL=tu_url_aqui
PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Crear tabla en Supabase

Ve a SQL Editor en Supabase y ejecuta:

```sql
CREATE TABLE diagnosticos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Respuestas del diagnóstico
  tipo_empresa TEXT,
  nivel_digital TEXT,
  objetivos TEXT[],
  tamano TEXT,
  necesidades_adicionales TEXT[],
  
  -- Información de contacto (opcional)
  nombre TEXT,
  empresa TEXT,
  
  -- Resultado del motor
  solucion_principal TEXT,
  soluciones_complementarias TEXT[],
  urgencia TEXT CHECK (urgencia IN ('high', 'medium', 'low')),
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_diagnosticos_created_at ON diagnosticos(created_at DESC);
CREATE INDEX idx_diagnosticos_tipo_empresa ON diagnosticos(tipo_empresa);
CREATE INDEX idx_diagnosticos_solucion_principal ON diagnosticos(solucion_principal);

-- Habilitar Row Level Security (RLS) - opcional
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;

-- Política: Permitir insertar a cualquiera (para diagnósticos anónimos)
CREATE POLICY "Permitir insertar diagnósticos"
  ON diagnosticos
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política: Solo tú puedes leer (ajusta según necesites)
CREATE POLICY "Solo admin puede leer"
  ON diagnosticos
  FOR SELECT
  TO authenticated
  USING (true);
```

### 5. Verificar que funciona

Una vez configurado, cada vez que alguien complete el diagnóstico, se guardará automáticamente en Supabase.

Puedes ver los datos en:
- Supabase Dashboard > Table Editor > diagnosticos

## Consultas útiles

### Ver diagnósticos recientes
```sql
SELECT * FROM diagnosticos 
ORDER BY created_at DESC 
LIMIT 10;
```

### Contar por tipo de empresa
```sql
SELECT tipo_empresa, COUNT(*) 
FROM diagnosticos 
GROUP BY tipo_empresa;
```

### Ver qué soluciones se recomiendan más
```sql
SELECT solucion_principal, COUNT(*) 
FROM diagnosticos 
GROUP BY solucion_principal 
ORDER BY COUNT(*) DESC;
```

### Diagnósticos con información de contacto
```sql
SELECT nombre, empresa, solucion_principal, created_at 
FROM diagnosticos 
WHERE nombre IS NOT NULL 
ORDER BY created_at DESC;
```

## Seguridad

- La Anon Key es pública (por eso se llama "anon")
- RLS (Row Level Security) protege los datos
- Solo permite INSERT a usuarios anónimos
- Para leer datos, necesitas autenticación o ajustar las políticas

## Alternativa sin base de datos

Si no quieres usar Supabase ahora, el sistema funciona igual. Solo no se guardarán los diagnósticos. Puedes agregarlo más tarde sin romper nada.




