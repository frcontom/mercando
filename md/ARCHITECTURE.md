# ARQUITECTURA

src/
 core/
 shared/
 layout/
 pages/
 services/
 models/
 store/
 components/
 dialogs/
 guards/
 pipes/

Patrón:

Página
→ Store
→ Service
→ Supabase

Nunca acceder a Supabase directamente desde un componente.
