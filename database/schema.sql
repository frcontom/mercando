-- ============================================================
-- Smart Market Planner - Esquema de Base de Datos
-- PostgreSQL + Supabase
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------
-- 1. MERCADOS
-- -----------------------------------------------------------
CREATE TABLE mercados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  fecha DATE NOT NULL,
  presupuesto NUMERIC(10, 2) NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'activo'
    CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mercados_estado ON mercados(estado);
CREATE INDEX idx_mercados_fecha ON mercados(fecha);

-- -----------------------------------------------------------
-- 2. TIENDAS
-- -----------------------------------------------------------
CREATE TABLE tiendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#90caf9',
  icono TEXT NOT NULL DEFAULT '🛒',
  orden INT NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------
-- 3. CATEGORIAS
-- -----------------------------------------------------------
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  icono TEXT NOT NULL DEFAULT '📦',
  orden INT NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------
-- 4. PRODUCTOS
-- -----------------------------------------------------------
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  nombre TEXT NOT NULL,
  unidad TEXT NOT NULL DEFAULT 'pieza',
  favorito BOOLEAN NOT NULL DEFAULT false,
  codigo_barras TEXT,
  imagen TEXT,
  activo BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_favorito ON productos(favorito) WHERE favorito = true;

-- -----------------------------------------------------------
-- 5. MERCADO_CATEGORIAS (categorías del mercado)
-- -----------------------------------------------------------
CREATE TABLE mercado_categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mercado_id UUID NOT NULL REFERENCES mercados(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  orden INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_mcat_mercado ON mercado_categorias(mercado_id);
CREATE UNIQUE INDEX idx_mcat_unique ON mercado_categorias(mercado_id, categoria_id);

-- -----------------------------------------------------------
-- 6. MERCADO_PRODUCTOS (productos que compraré en esa categoría)
-- -----------------------------------------------------------
CREATE TABLE mercado_productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mercado_categoria_id UUID NOT NULL REFERENCES mercado_categorias(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
  precio NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cantidad NUMERIC(10, 2) NOT NULL DEFAULT 1,
  cantidad_encontrada NUMERIC(10, 2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (precio * cantidad) STORED,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'encontrado', 'no_habia')),
  observacion TEXT,
  fecha_compra TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mp_categoria ON mercado_productos(mercado_categoria_id);
CREATE INDEX idx_mp_producto ON mercado_productos(producto_id);
CREATE INDEX idx_mp_estado ON mercado_productos(estado);

-- -----------------------------------------------------------
-- 8. HISTORIAL_PRECIOS
-- -----------------------------------------------------------
CREATE TABLE historial_precios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  tienda_id UUID NOT NULL REFERENCES tiendas(id) ON DELETE CASCADE,
  precio NUMERIC(10, 2) NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX idx_hp_producto ON historial_precios(producto_id);
CREATE INDEX idx_hp_tienda ON historial_precios(tienda_id);
CREATE INDEX idx_hp_fecha ON historial_precios(fecha);

-- -----------------------------------------------------------
-- 9. VALORES POR DEFECTO (opcional)
-- -----------------------------------------------------------
INSERT INTO categorias (nombre, icono, orden) VALUES
  ('Carnicería', '🥩', 1),
  ('Verdulería', '🥬', 2),
  ('Lácteos', '🧀', 3),
  ('Panadería', '🍞', 4),
  ('Bebidas', '🧃', 5),
  ('Despensa', '🍝', 6),
  ('Limpieza', '🧹', 7),
  ('Higiene', '🧴', 8);

INSERT INTO tiendas (nombre, color, icono, orden) VALUES
  ('Supermercado', '#90caf9', '🛒', 1),
  ('Carnicería', '#f48fb1', '🥩', 2),
  ('Verdulería', '#a5d6a7', '🥬', 3);
