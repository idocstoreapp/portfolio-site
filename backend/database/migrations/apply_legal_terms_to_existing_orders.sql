-- ============================================
-- APLICAR GARANTÍAS AUTOMÁTICAS A ÓRDENES EXISTENTES
-- ============================================
-- Este script aplica garantías automáticas a órdenes que fueron creadas
-- antes de que existiera el sistema de garantías automáticas
-- ============================================

-- Función para aplicar garantías según tipo de proyecto
DO $$
DECLARE
  order_record RECORD;
  legal_template_record RECORD;
  legal_category TEXT;
  modules_list TEXT;
BEGIN
  -- Iterar sobre todas las órdenes que no tienen garantías
  FOR order_record IN 
    SELECT id, project_type, included_modules
    FROM orders
    WHERE warranty_text IS NULL 
       OR warranty_text = ''
       OR maintenance_policy IS NULL 
       OR maintenance_policy = ''
       OR exclusions_text IS NULL 
       OR exclusions_text = ''
  LOOP
    -- Determinar categoría según tipo de proyecto
    legal_category := CASE order_record.project_type
      WHEN 'web' THEN 'web'
      WHEN 'sistema' THEN 'system'
      WHEN 'combinado' THEN 'combined'
      ELSE 'app'
    END;

    -- Obtener plantilla legal por defecto
    SELECT * INTO legal_template_record
    FROM legal_templates
    WHERE category = legal_category
      AND is_default = true
      AND is_active = true
    LIMIT 1;

    -- Si se encontró una plantilla, aplicar garantías
    IF legal_template_record IS NOT NULL THEN
      -- Construir lista de módulos si existen
      modules_list := '';
      IF order_record.included_modules IS NOT NULL THEN
        SELECT string_agg(sm.name, ', ')
        INTO modules_list
        FROM solution_modules sm
        WHERE sm.id::text = ANY(
          SELECT jsonb_array_elements_text(order_record.included_modules::jsonb)
        );
      END IF;

      -- Construir texto de exclusiones con módulos
      DECLARE
        exclusions_text TEXT := legal_template_record.exclusions_text;
      BEGIN
        IF modules_list IS NOT NULL AND modules_list != '' THEN
          IF exclusions_text NOT LIKE '%Módulos adicionales%' THEN
            exclusions_text := exclusions_text || E'\n\nMódulos adicionales incluidos: ' || modules_list || '. Cada módulo adicional tiene sus propias garantías específicas según su funcionalidad.';
          END IF;
        END IF;

        -- Actualizar la orden con las garantías
        UPDATE orders
        SET 
          warranty_text = legal_template_record.warranty_text,
          maintenance_policy = COALESCE(legal_template_record.maintenance_text, ''),
          exclusions_text = exclusions_text,
          legal_template_id = legal_template_record.id,
          updated_at = NOW()
        WHERE id = order_record.id;
      END;
    END IF;
  END LOOP;
END $$;

-- Verificar resultados
SELECT 
  COUNT(*) FILTER (WHERE warranty_text IS NOT NULL AND warranty_text != '') as ordenes_con_garantia,
  COUNT(*) FILTER (WHERE warranty_text IS NULL OR warranty_text = '') as ordenes_sin_garantia,
  COUNT(*) as total_ordenes
FROM orders;

-- Mostrar resumen por tipo de proyecto
SELECT 
  project_type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE warranty_text IS NOT NULL AND warranty_text != '') as con_garantia,
  COUNT(*) FILTER (WHERE warranty_text IS NULL OR warranty_text = '') as sin_garantia
FROM orders
GROUP BY project_type;
