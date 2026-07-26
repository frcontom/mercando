-- ============================================================
-- Migration 001: Cambiar estado de mercado a activo/inactivo
-- ============================================================

-- 1. Eliminar la constraint CHECK actual
ALTER TABLE mercados DROP CONSTRAINT IF EXISTS mercados_estado_check;

-- 2. Actualizar registros existentes a los nuevos valores
UPDATE mercados SET estado = 'activo' WHERE estado IN ('planeando', 'en_curso');
UPDATE mercados SET estado = 'inactivo' WHERE estado = 'completado';

-- 3. Agregar la nueva constraint
ALTER TABLE mercados ADD CONSTRAINT mercados_estado_check
  CHECK (estado IN ('activo', 'inactivo'));

-- 4. Cambiar el valor por defecto
ALTER TABLE mercados ALTER COLUMN estado SET DEFAULT 'activo';
