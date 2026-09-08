# Desarrollo local

## Requisitos

- Node.js `20.9+` (recomendado: la versión LTS disponible en la máquina).
- npm `10+`.
- Cuenta de Supabase para las fases de integración.

## Entorno aislado

Este repositorio es una aplicación Next.js y no contiene backend Python. Por
eso no se crea un `.venv`: el equivalente correcto en este stack es el árbol
local de dependencias `node_modules`, reproducible con `npm ci`, junto con el
lockfile versionado. No se instalarán paquetes globales del proyecto.

Los secretos viven en `.env.local`, que está ignorado por Git. Empieza desde
`.env.example` y completa los valores localmente:

```bash
cp .env.example .env.local
```

Nunca copies claves reales a `.env.example`, documentación pública o commits.

## Comandos

```bash
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

La aplicación local se sirve en <http://localhost:3000>.

El recorrido E2E completo necesita un proyecto Supabase operativo, un usuario
demo y una clave de OpenAI configurada en el entorno de ejecución. Se ejecuta
con variables fuera de Git:

```bash
E2E_EMAIL='usuario-demo@vitalis.demo' \\
E2E_PASSWORD='contraseña-local' \\
E2E_AI_ENABLED=true \\
npm run test:e2e
```

Sin esas variables, Playwright omite el escenario con un motivo visible. Para
usar un servidor ya desplegado, añade `E2E_BASE_URL`; de forma local el runner
usa el puerto `3100` para no interferir con `npm run dev` en `3000`.

## Base de datos

Las migraciones de Supabase se aplican en orden desde `supabase/migrations/`.
El seed estructural crea Madrid, Valencia y Sevilla, pero no crea usuarios ni
leads demo. Para validar RLS contra una base con el esquema y el seed aplicados:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
```

El test revierte sus datos temporales al terminar y cubre ADMIN, MANAGER,
RECEPTIONIST, soft delete y notas append-only.

La misma comprobación está disponible desde Vitest en
`tests/integration/rls/rls.test.ts` y se omite si `SUPABASE_DB_URL` no está
definida. No se considera un RLS validado hasta que ese test se ejecute contra
la base real.

Después de provisionar los usuarios demo, carga el dataset funcional con:

```bash
npm run demo:data
```

El comando crea 15 leads demo, cinco por clínica, notas de actividad y un
duplicado intencionado. Es idempotente y conserva los datos existentes; usa la
service role sólo desde este script local server-side.

## Flujo Git

1. Trabaja en una rama descriptiva basada en `main`.
2. Ejecuta lint, typecheck, tests y build antes de cerrar una unidad.
3. Haz commits pequeños y descriptivos, siguiendo los commits definidos en el
   roadmap.
4. No subas `.env.local`, credenciales ni artefactos de build.
