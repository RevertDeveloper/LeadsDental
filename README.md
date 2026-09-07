# Clínica Dental Vitalis

CRM comercial interno para centralizar leads, seguimiento y operaciones de
Clínica Dental Vitalis. El desarrollo sigue el roadmap de
`Documentos_Iniciales/roadmap.md` por fases cerradas y validadas.

## Estado

Fase 9 — Dashboard: implementada; pendiente de validación E2E con una sesión
Supabase válida.

La base actual incluye Next.js App Router, TypeScript estricto, Tailwind CSS,
shadcn/ui, contrato de entorno con Zod, clientes Supabase SSR, el esquema CRM
de Supabase, seed de clínicas, políticas RLS, autenticación interna,
autorización server-side, CRUD de leads, notas append-only, auditoría, pipeline
comercial y generación supervisada de mensajes de seguimiento con OpenAI
Responses API, además del dashboard operativo con métricas por alcance, leads
recientes y priorización comercial. El siguiente paso de validación es ejecutar
el smoke E2E con un proyecto Supabase válido antes de comenzar Settings y
control de administración.

## Puesta en marcha

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Edita `.env.local` con los valores del proyecto Supabase. Las claves de
Supabase service role y OpenAI son sólo server-side y nunca deben usar el
prefijo `NEXT_PUBLIC_`.

Comprobaciones locales:

```bash
npm run lint
npm run typecheck
npm test
npm run build
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
