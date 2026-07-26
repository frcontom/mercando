-- ============================================================
-- Migration 003: Agregar cantidad_original a mercado_productos
-- ============================================================

ALTER TABLE mercado_productos ADD COLUMN IF NOT EXISTS cantidad_original NUMERIC(10, 2) NOT NULL DEFAULT 1;

UPDATE mercado_productos SET cantidad_original = cantidad WHERE cantidad_original IS NULL OR cantidad_original = 0;
