# Arquitectura inicial

La aplicación sigue el stack cerrado del roadmap:

- Next.js App Router + TypeScript strict.
- Server Actions y Route Handlers como backend de aplicación.
- Supabase Auth y PostgreSQL con RLS.
- Zod para contratos de entrada.
- OpenAI sólo desde código server-side.
- Vitest para unit tests y Playwright para E2E en la fase de testing integral.

Las Fases 1–8 dejan creado el núcleo de datos, la autenticación interna, la
autorización server-side, el CRUD de leads, las notas append-only, la auditoría,
el pipeline comercial y el follow-up IA supervisado. Las migraciones viven en
`supabase/migrations/` y el seed estructural en `supabase/seed.sql`.

El modelo contiene `clinics`, `profiles`, `user_clinics`, `leads`, `notes` y
`audit_log`, con enums de dominio, claves foráneas, timestamps e índices para
las consultas del CRM. Los leads usan soft delete y las notas son append-only:
ambas reglas se aplican con policies RLS y triggers PostgreSQL.

Las policies resuelven el usuario activo desde `profiles` y las clínicas
permitidas desde `user_clinics`. ADMIN tiene alcance global; CLINIC_MANAGER y
RECEPTIONIST sólo acceden a sus asignaciones. Los helpers `SECURITY DEFINER`
se limitan a consultar autorización y no sustituyen las policies.

## Límites de secretos

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y
`NEXT_PUBLIC_APP_URL` forman el contrato público. `SUPABASE_SERVICE_ROLE_KEY`,
`OPENAI_API_KEY` y `OPENAI_MODEL` son exclusivamente server-side. La API de
OpenAI se consume sólo desde `lib/ai/` protegido con `server-only`.

El contrato de secretos vive en `lib/config/server-env.ts`, protegido por
`server-only`; el módulo público `lib/config/env.ts` no contiene esas claves.

Los clientes Supabase usan la anon key y cookies gestionadas por SSR. No hay
cliente service-role en browser ni bypass de RLS. Las rutas privadas heredan
`app/(protected)/layout.tsx`, que resuelve el usuario activo en server-side y
comparte sidebar, cabecera, logout y contexto de clínicas.

La UI usa tokens semánticos en `app/globals.css`, primitives reutilizables en
`components/ui/`, badges que combinan texto con el color de la clínica o el
estado del lead y componentes IA con estados de carga, error y revisión humana.
La persistencia IA usa `persist_ai_followup` con `SECURITY INVOKER` para que la
nota y su auditoría de generación sean atómicas bajo RLS.
