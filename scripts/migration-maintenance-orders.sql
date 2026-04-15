-- scripts/migration-maintenance-orders.sql
-- Ejecutar en Supabase SQL Editor

-- 1. Añadir nuevas columnas a la tabla de órdenes
ALTER TABLE orders 
  ADD COLUMN order_type TEXT DEFAULT 'project',
  ADD COLUMN maintenance_type TEXT,
  ADD COLUMN maintenance_start_date DATE,
  ADD COLUMN maintenance_end_date DATE,
  ADD COLUMN hourly_bank_total DECIMAL,
  ADD COLUMN hourly_bank_used DECIMAL DEFAULT 0,
  ADD COLUMN related_order_id UUID REFERENCES orders(id);

-- 2. Restricciones de validación
ALTER TABLE orders
  ADD CONSTRAINT CHK_order_type CHECK (order_type IN ('project', 'maintenance', 'support')),
  ADD CONSTRAINT CHK_maintenance_type CHECK (maintenance_type IN ('monthly', 'one_time', 'hourly_bank') OR maintenance_type IS NULL);

-- 3. Comentarios explicativos
COMMENT ON COLUMN orders.order_type IS 'Tipo de orden (project, maintenance, support)';
COMMENT ON COLUMN orders.maintenance_type IS 'Para mantenimientos (monthly, one_time, hourly_bank)';
COMMENT ON COLUMN orders.hourly_bank_total IS 'Total de horas compradas para bolsa de horas';
COMMENT ON COLUMN orders.hourly_bank_used IS 'Horas consumidas de la bolsa';
COMMENT ON COLUMN orders.related_order_id IS 'ID de orden de proyecto principal vinculada (opcional)';
