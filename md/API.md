# API

## Servicios

AuthService
- validarPassword()

MercadosService
- getAll()
- get(id)
- create()
- update()
- delete()

TiendasService
CategoriasService
ProductosService

MercadoProductosService
- add()
- updateEstado()
- updatePrecio()
- remove()

HistorialPreciosService
- registrar()
- obtenerHistorial()

Todos los servicios deben encapsular Supabase.
