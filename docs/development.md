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
```

La aplicación local se sirve en <http://localhost:3000>.

## Base de datos

Las migraciones de Supabase se aplican en orden desde `supabase/migrations/`.
El seed estructural crea Madrid, Valencia y Sevilla, pero no crea usuarios ni
leads demo. Para validar RLS contra una base con el esquema y el seed aplicados:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
```

El test revierte sus datos temporales al terminar y cubre ADMIN, MANAGER,
RECEPTIONIST, soft delete y notas append-only.

## Flujo Git

1. Trabaja en una rama descriptiva basada en `main`.
2. Ejecuta lint, typecheck, tests y build antes de cerrar una unidad.
3. Haz commits pequeños y descriptivos, siguiendo los commits definidos en el
   roadmap.
4. No subas `.env.local`, credenciales ni artefactos de build.
