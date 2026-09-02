-- ============================================================
-- Migration 004: Eliminar capa de tiendas, simplificar a
-- Mercado > Categorias > Productos
-- Ejecutar en Supabase: SQL Editor > pegar > Run
-- ============================================================

-- 1. Crear tabla mercado_categorias
CREATE TABLE mercado_categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mercado_id UUID NOT NULL REFERENCES mercados(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  orden INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_mcat_mercado ON mercado_categorias(mercado_id);
CREATE UNIQUE INDEX idx_mcat_unique ON mercado_categorias(mercado_id, categoria_id);

-- 2. Migrar datos: cada mercado_tienda_categoria se convierte en mercado_categoria
INSERT INTO mercado_categorias (mercado_id, categoria_id, orden)
SELECT DISTINCT mt.mercado_id, mtc.categoria_id, mtc.orden
FROM mercado_tienda_categorias mtc
JOIN mercado_tiendas mt ON mt.id = mtc.mercado_tienda_id;

-- 3. Agregar nueva columna a mercado_productos
ALTER TABLE mercado_productos ADD COLUMN IF NOT EXISTS mercado_categoria_id UUID REFERENCES mercado_categorias(id) ON DELETE CASCADE;

-- 4. Mapear productos existentes a la nueva columna
UPDATE mercado_productos mp
SET mercado_categoria_id = mcat.id
FROM mercado_tienda_categorias mtc
JOIN mercado_categorias mcat ON mcat.categoria_id = mtc.categoria_id
WHERE mp.mercado_tienda_categoria_id = mtc.id
  AND mp.mercado_categoria_id IS NULL;

-- 5. Eliminar la columna antigua
ALTER TABLE mercado_productos DROP COLUMN IF EXISTS mercado_tienda_categoria_id;

-- 6. Eliminar tablas de tiendas (opcional, después de verificar)
-- DROP TABLE IF EXISTS mercado_tienda_categorias;
-- DROP TABLE IF EXISTS mercado_tiendas;