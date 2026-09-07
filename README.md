# Clínica Dental Vitalis

CRM comercial interno para centralizar leads, seguimiento y operaciones de
Clínica Dental Vitalis. El desarrollo sigue el roadmap de
`Documentos_Iniciales/roadmap.md` por fases cerradas y validadas.

## Estado

Fase 12 — Testing integral: implementación local terminada; pendientes los
gates RLS y E2E contra un proyecto Supabase válido.

La base actual incluye Next.js App Router, TypeScript estricto, Tailwind CSS,
shadcn/ui, contrato de entorno con Zod, clientes Supabase SSR, el esquema CRM
de Supabase, seed de clínicas, políticas RLS, autenticación interna,
autorización server-side, CRUD de leads, notas append-only, auditoría, pipeline
comercial y generación supervisada de mensajes de seguimiento con OpenAI
Responses API, además del dashboard operativo con métricas por alcance, leads
recientes y priorización comercial. El siguiente paso es ejecutar el contrato
RLS y el recorrido E2E completo con un proyecto Supabase válido y un usuario
demo.

## Puesta en marcha

```bash
npm ci
cp .env.example .env
npm run dev
```

Edita `.env` con los valores del proyecto Supabase. Las claves de
Supabase service role y OpenAI son sólo server-side y nunca deben usar el
prefijo `NEXT_PUBLIC_`. Para provisionar los tres usuarios demo también debes
definir `DEMO_USER_PASSWORD` localmente con 12 caracteres o más; nunca se
versiona ni se muestra en logs.

Configuración remota pendiente: crea el proyecto Supabase, aplica las
migraciones de `supabase/migrations/` y `supabase/seed.sql`, completa las
variables reales en `.env` y ejecuta `npm run demo:users`. La URL pública
objetivo es `https://crmleads.carlosrevert.es`; el DNS se configura cuando el
proyecto Vercel tenga asignado su destino exacto.

Comprobaciones locales:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Consulta [`docs/development.md`](docs/development.md) para el entorno de
desarrollo y [`docs/architecture.md`](docs/architecture.md) para los límites
arquitectónicos de esta fase.

## Estructura

```text
app/                 App Router y páginas
components/          Componentes reutilizables y shadcn/ui
lib/config/          Contratos de configuración
lib/supabase/        Clientes browser, server y middleware
supabase/            Migraciones, seed y tests SQL de la base de datos
tests/               Tests unitarios
docs/                Documentación operativa y técnica
scripts/             Automatizaciones de soporte
```

## Decisiones de entorno

Este es un proyecto Node/Next.js; no se crea un entorno virtual Python porque
no existe backend Python en la arquitectura aprobada. El aislamiento se logra
con dependencias locales de npm, `package-lock.json` y `npm ci`. Los detalles
están documentados en `docs/development.md`.
