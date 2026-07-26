-- ============================================================
-- Migration 003: Agregar cantidad_encontrada a mercado_productos
-- ============================================================

ALTER TABLE mercado_productos ADD COLUMN IF NOT EXISTS cantidad_encontrada NUMERIC(10, 2) NOT NULL DEFAULT 0;

UPDATE mercado_productos SET cantidad_encontrada = cantidad WHERE estado = 'encontrado' AND cantidad_encontrada = 0;
