# DATABASE

## Tablas

### mercados
id, nombre, fecha, presupuesto, estado, created_at

### tiendas
id, nombre, color, icono, orden

### categorias
id, nombre, icono, orden

### productos
id, categoria_id, nombre, unidad, favorito, codigo_barras, imagen, activo

### mercado_productos
id, mercado_id, tienda_id, producto_id, precio, cantidad,
subtotal, prioridad, estado, orden, observacion,
fecha_compra, created_at

Estados:
- Pendiente
- Encontrado
- No había
- Reemplazado
- Cancelado

### historial_precios
id, producto_id, tienda_id, precio, fecha

## Índices recomendados

- mercado_id
- tienda_id
- producto_id
- categoria_id
- fecha
