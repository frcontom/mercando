-- ============================================================
-- Migration 002: Simplificar estados de producto
-- ============================================================

ALTER TABLE mercado_productos DROP CONSTRAINT IF EXISTS mercado_productos_estado_check;

UPDATE mercado_productos SET estado = 'pendiente' WHERE estado IN ('reemplazado', 'cancelado');

ALTER TABLE mercado_productos ADD CONSTRAINT mercado_productos_estado_check
  CHECK (estado IN ('pendiente', 'encontrado', 'no_habia'));
