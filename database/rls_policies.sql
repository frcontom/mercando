-- ============================================================
-- Smart Market Planner - Políticas RLS
-- Sin autenticación → el anon key puede leer/escribir todo
-- ============================================================

ALTER TABLE mercados ENABLE ROW LEVEL SECURITY;
ALTER TABLE tiendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercado_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE mercado_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_precios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_mercados_select" ON mercados FOR SELECT TO anon USING (true);
CREATE POLICY "anon_mercados_insert" ON mercados FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_mercados_update" ON mercados FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_mercados_delete" ON mercados FOR DELETE TO anon USING (true);

CREATE POLICY "anon_tiendas_select" ON tiendas FOR SELECT TO anon USING (true);
CREATE POLICY "anon_tiendas_insert" ON tiendas FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_tiendas_update" ON tiendas FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_tiendas_delete" ON tiendas FOR DELETE TO anon USING (true);

CREATE POLICY "anon_categorias_select" ON categorias FOR SELECT TO anon USING (true);
CREATE POLICY "anon_categorias_insert" ON categorias FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_categorias_update" ON categorias FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_categorias_delete" ON categorias FOR DELETE TO anon USING (true);

CREATE POLICY "anon_productos_select" ON productos FOR SELECT TO anon USING (true);
CREATE POLICY "anon_productos_insert" ON productos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_productos_update" ON productos FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_productos_delete" ON productos FOR DELETE TO anon USING (true);

CREATE POLICY "anon_mcat_select" ON mercado_categorias FOR SELECT TO anon USING (true);
CREATE POLICY "anon_mcat_insert" ON mercado_categorias FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_mcat_update" ON mercado_categorias FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_mcat_delete" ON mercado_categorias FOR DELETE TO anon USING (true);

CREATE POLICY "anon_mp_select" ON mercado_productos FOR SELECT TO anon USING (true);
CREATE POLICY "anon_mp_insert" ON mercado_productos FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_mp_update" ON mercado_productos FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_mp_delete" ON mercado_productos FOR DELETE TO anon USING (true);

CREATE POLICY "anon_hp_select" ON historial_precios FOR SELECT TO anon USING (true);
CREATE POLICY "anon_hp_insert" ON historial_precios FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_hp_update" ON historial_precios FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_hp_delete" ON historial_precios FOR DELETE TO anon USING (true);