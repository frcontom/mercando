-- ============================================================
-- Habilitar Realtime para las tablas del proyecto
-- Ejecutar en Supabase: SQL Editor > pegar > Run
-- ============================================================

-- Publicar todas las tablas en el canal Realtime
BEGIN;
  ALTER PUBLICATION supabase_realtime ADD TABLE mercados;
  ALTER PUBLICATION supabase_realtime ADD TABLE tiendas;
  ALTER PUBLICATION supabase_realtime ADD TABLE categorias;
  ALTER PUBLICATION supabase_realtime ADD TABLE productos;
  ALTER PUBLICATION supabase_realtime ADD TABLE mercado_tiendas;
  ALTER PUBLICATION supabase_realtime ADD TABLE mercado_tienda_categorias;
  ALTER PUBLICATION supabase_realtime ADD TABLE mercado_productos;
  ALTER PUBLICATION supabase_realtime ADD TABLE historial_precios;
COMMIT;
