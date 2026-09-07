# Arquitectura inicial

La aplicación sigue el stack cerrado del roadmap:

- Next.js App Router + TypeScript strict.
- Server Actions y Route Handlers como backend de aplicación.
- Supabase Auth y PostgreSQL con RLS en fases posteriores.
- Zod para contratos de entrada.
- OpenAI sólo desde código server-side.
- Vitest para unit tests y Playwright para E2E en la fase de testing integral.

En Fase 0 sólo existe el bootstrap. No hay autenticación activa, tablas,
datos demo ni lógica de negocio. La pantalla raíz comunica ese estado para no
simular un CRM que todavía no está implementado.

## Límites de secretos

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`NEXT_PUBLIC_APP_URL` forman el contrato público. `SUPABASE_SERVICE_ROLE_KEY` y
`OPENAI_API_KEY` son exclusivamente server-side y no se consumen todavía.

El contrato de secretos vive en `lib/config/server-env.ts`, protegido por
`server-only`; el módulo público `lib/config/env.ts` no contiene esas claves.

Los clientes Supabase usan la anon key y cookies gestionadas por SSR. No hay
cliente service-role en browser ni bypass de RLS.
