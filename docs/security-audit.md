# Auditoría de secretos

Auditoría estática realizada el 7 de septiembre de 2026 como parte de la
Fase 11.

## Resultado

- `OPENAI_API_KEY` y `SUPABASE_SERVICE_ROLE_KEY` sólo se resuelven desde
  módulos server-only o desde el script CLI de seed de usuarios.
- Los Client Components no importan `lib/config/server-env`,
  `lib/supabase/admin` ni los módulos server-only de IA.
- Las variables públicas están limitadas a `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_APP_URL`.
- `.env*` está ignorado por Git y `.env.example` contiene únicamente valores
  de ejemplo.
- No existen claves hardcoded en el código fuente rastreado.

La comprobación se mantiene en `tests/config/secrets-boundary.test.ts`. Las
claves reales deben configurarse únicamente en el entorno local ignorado o en
el proveedor de despliegue.
