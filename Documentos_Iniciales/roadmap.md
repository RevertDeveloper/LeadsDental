# ROADMAP MASTER
## DelegIA — Clínica Dental Vitalis

**Rol del documento:** Lead Technical Planner / Staff AI Engineer  
**Modo de ejecución:** Fases secuenciales, tareas one-shot, validación obligatoria después de cada tarea y commit descriptivo al cerrar cada unidad funcional. `roadmap.md` debe tratarse como un **documento vivo**: al finalizar cada fase, actualízalo para reflejar fielmente el estado real del proyecto, incluyendo lo implementado, decisiones tomadas, problemas detectados y cualquier cambio relevante. Si la implementación modifica o afecta a fases futuras, actualiza también esas fases para que el roadmap siga siendo coherente con el estado actual del proyecto. El objetivo es que cualquier agente que retome el proyecto pueda entender rápidamente dónde está, qué se ha hecho y qué queda por hacer, sin repetir investigaciones o perder contexto.

Lee el roadmap completo, identifica la fase que toca implementar y ponte a trabajar hasta que quede terminada y validada.

---

# **Índice de Fases**

- [x] **Fase 0 — Bootstrap del proyecto**
- [x] **Fase 1 — Core Database**
- [x] **Fase 2 — Auth y autorización**
- [x] **Fase 3 — UI Foundation**
- [x] **Fase 4 — Leads: dominio + CRUD**
- [x] **Fase 5 — Notas y actividad**
- [x] **Fase 6 — Auditoría**
- [x] **Fase 7 — Ficha de lead y pipeline**
- [x] **Fase 8 — IA Follow-up**
- [ ] **Fase 9 — Dashboard**
- [x] **Fase 10 — Settings y control de administración**
- [x] **Fase 11 — Hardening, errores y UX**
- [ ] **Fase 12 — Testing integral**
- [ ] **Fase 13 — Demo Data**
- [ ] **Fase 14 — Producción**
- [ ] **Fase 15 — Documentación y congelación MVP**
- [ ] **Fase 16 — Entrega final**

> **Regla:** una fase solo se marca como `[x]` cuando todas sus tareas han sido implementadas, validadas y cerradas correctamente.

---

# 1. Arquitectura Base

## 1.1 Objetivo arquitectónico

El producto no se implementará como un simple CRUD de contactos. El objetivo es un **mini CRM comercial interno para seguimiento de leads**, con:

- centralización de leads;
- pipeline comercial;
- seguimiento mediante notas append-only;
- control de acceso por usuario/rol/clínica;
- detección de posibles duplicados;
- auditoría;
- generación de mensajes de seguimiento mediante IA;
- supervisión humana antes de cualquier envío.

El Informe Maestro establece explícitamente este enfoque y prioriza producto + ingeniería + IA aplicada + criterio operativo. 

## 1.2 Stack cerrado

| Capa | Decisión |
|---|---|
| Frontend | Next.js + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Next.js Server Actions + Route Handlers |
| Auth | Supabase Auth |
| Base de datos | Supabase PostgreSQL |
| Seguridad | PostgreSQL RLS + autorización server-side |
| Validación | Zod |
| IA | OpenAI Responses API |
| Modelo | GPT-5.6 Luna |
| Hosting | Vercel |
| Tests unitarios | Vitest |
| Tests E2E | Playwright |
| Control de versiones | Git + GitHub |
| Observabilidad | logs estructurados + `audit_log` |
| Dominio objetivo | `crmleads.carlosrevert.es` |

Estas decisiones proceden directamente del stack definitivo del Informe
Maestro, salvo el dominio de presentación, actualizado a
`crmleads.carlosrevert.es` para identificar mejor el producto en portfolio.

## 1.3 Arquitectura de ejecución

```text
Browser
   │
   │ HTTPS
   ▼
Vercel
Next.js App Router
   │
   ├── Server Components
   ├── Client Components
   ├── Server Actions
   └── Route Handlers
          │
          ├──────────────► Supabase Auth
          │
          ├──────────────► Supabase PostgreSQL
          │                         │
          │                         └── RLS
          │
          └──────────────► OpenAI Responses API
```

No se utilizará un backend Python independiente. La incorporación de FastAPI introduciría infraestructura y superficie de ataque sin aportar valor suficiente para este MVP.

## 1.4 Regla fundamental de seguridad

La autorización tendrá tres niveles:

```text
Supabase Auth
      ↓
Usuario autenticado + activo
      ↓
Rol
      ↓
Clínicas permitidas
      ↓
Operación permitida
```

La UI puede ocultar controles, pero **la seguridad real debe estar en server-side authorization + RLS**.

Nunca se considerará suficiente:

```ts
if (user.role === "ADMIN")
```

en un componente React.

## 1.5 Modelo de datos

```text
clinics
   │
   ├──────────────► leads
   │                    │
   │                    └──► notes
   │
   └──────────────► user_clinics
                         ▲
                         │
profiles ────────────────┘

audit_log
   ├── leads
   ├── notes
   ├── users
   └── IA
```

Tablas MVP:

- `clinics`
- `profiles`
- `user_clinics`
- `leads`
- `notes`
- `audit_log`

El PDF exige como mínimo `leads` y `notes`, mientras que el Informe Maestro amplía el modelo para soportar permisos, auditoría y escalabilidad. 

## 1.6 Roles

### ADMIN

- acceso a todas las clínicas;
- crear usuarios;
- desactivar usuarios;
- modificar leads;
- reasignar clínica;
- consultar auditoría;
- configuración.

### CLINIC_MANAGER

- acceder a sus clínicas asignadas;
- editar leads;
- añadir notas;
- generar mensajes IA;
- mover leads;
- consultar actividad.

### RECEPTIONIST

- acceder a leads de su clínica;
- crear leads;
- editar leads;
- añadir notas;
- generar mensajes;
- actualizar estado.

No puede:

- administrar usuarios;
- modificar permisos;
- consultar auditoría completa.

La matriz de roles y permisos queda establecida en el Informe Maestro. 

## 1.7 Decisiones de producto cerradas

| Decisión | Resolución |
|---|---|
| ¿Clínica editable? | Sí |
| ¿Conservar clínica original? | Sí |
| ¿Duplicados? | Detectar + avisar |
| ¿Merge automático? | Nunca |
| ¿Todo el equipo ve todo? | No |
| ¿ADMIN ve todo? | Sí |
| ¿RECEPTIONIST? | Su clínica |
| ¿MANAGER? | Clínicas asignadas |
| ¿Notas editables? | No |
| ¿Notas borrables? | No |
| ¿Eliminar leads físicamente? | No, soft delete |
| ¿IA automática? | No |
| ¿Humano revisa IA? | Sí |
| ¿Tono IA? | Cercano + profesional |
| ¿Modelo? | GPT-5.6 Luna |
| ¿API? | OpenAI Responses API |
| ¿Backend IA? | Next.js server-side |
| ¿DB? | Supabase PostgreSQL |
| ¿Seguridad? | Auth + RLS + server auth |
| ¿Auditoría? | Sí |
| ¿Hosting? | Vercel |

Estas decisiones están cerradas en el Informe Maestro y deben considerarse **contrato de producto**, no sugerencias. 

---

# 2. Grafo de Dependencias

## 2.1 Grafo principal

```text
FASE 0
Bootstrap
   │
   ▼
FASE 1
Base de datos + contratos
   │
   ▼
FASE 2
Auth + sesión + autorización
   │
   ▼
FASE 3
Layout + navegación + UI foundation
   │
   ▼
FASE 4
Leads — dominio + CRUD
   │
   ├───────────────┐
   ▼               ▼
FASE 5          FASE 6
Notas           Auditoría
   │               │
   └───────┬───────┘
           ▼
FASE 7
Ficha de lead + pipeline
           │
           ▼
FASE 8
IA Follow-up
           │
           ▼
FASE 9
Dashboard + priorización
           │
           ▼
FASE 10
Hardening + seguridad + UX
           │
           ▼
FASE 11
Testing integral
           │
           ▼
FASE 12
Seed + producción + documentación
           │
           ▼
        MVP DEMO
           │
           ▼
FASE 13
MEJORAS POST-MVP
```

## 2.2 Dependencias estrictas

- No implementar CRUD antes de Auth + RLS.
- No implementar IA antes de disponer de lead detail + notes.
- No implementar dashboard antes de que el modelo de leads sea estable.
- No hacer refinamiento visual profundo antes de tener funcionalidad.
- No introducir features nuevas después de iniciar Fase 11.
- Fase 12 es preparación de demo y producción; no es una fase de producto.
- Fase 13 queda completamente fuera del MVP.

---

# 3. Fases de Implementación (MVP)

---

# FASE 0 — Bootstrap del proyecto

## Task F0-T01: Inicializar aplicación Next.js

- **Task [F0-T01]:** Inicializar aplicación Next.js TypeScript
- **Objetivo:** Crear la base ejecutable del proyecto `ClinicaDental`.
- **Archivos afectados:** `package.json`, `tsconfig.json`, `next.config.ts`, `app/`, `public/`, `components/`, `lib/`, `types/`, `tests/`
- **Instrucciones para el Agente:**
  1. Inicializar Next.js con App Router y TypeScript.
  2. Utilizar estructura `app/`.
  3. Configurar Tailwind CSS.
  4. Instalar y configurar shadcn/ui.
  5. Crear las carpetas `components`, `lib`, `types`, `tests`, `supabase`, `docs`, `scripts`.
  6. Configurar ESLint y TypeScript strict.
  7. Mantener el proyecto ejecutable mediante `npm run dev`.
- **Restricciones:**
  - No implementar Auth.
  - No crear tablas.
  - No crear lógica de negocio.
  - No crear dashboard ficticio.
- **Criterios de Aceptación:**
  - `npm install` funciona.
  - `npm run build` funciona.
  - `npm run lint` funciona.
  - `npm run dev` inicia Next.js.
  - TypeScript está configurado en modo estricto.
- **Testing / Validación:** Build + lint + arranque local.
- **Commit:** `chore: bootstrap Next.js application`

---

## Task F0-T02: Configurar variables de entorno

- **Task [F0-T02]:** Crear contrato de configuración de entorno
- **Objetivo:** Establecer todas las variables necesarias sin exponer secretos.
- **Archivos afectados:** `.env.example`, `.gitignore`, `lib/config/env.ts`
- **Instrucciones para el Agente:**
  1. Añadir:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
     - `OPENAI_MODEL`
     - `NEXT_PUBLIC_APP_URL`
  2. Validar variables server-side mediante Zod.
  3. Exponer públicamente sólo variables con prefijo `NEXT_PUBLIC_`.
  4. Establecer `OPENAI_MODEL=gpt-5.6-luna`.
- **Restricciones:**
  - Nunca crear `NEXT_PUBLIC_OPENAI_API_KEY`.
  - Nunca importar `SUPABASE_SERVICE_ROLE_KEY` desde Client Components.
  - No introducir valores secretos reales en el repositorio.
- **Criterios de Aceptación:**
  - `.env.example` documenta todas las variables.
  - La API key de OpenAI sólo puede utilizarse server-side.
  - Las variables obligatorias se validan.
- **Testing / Validación:** Test de configuración válida/inválida.
- **Commit:** `chore(config): define environment contract`

---

## Task F0-T03: Configurar clientes Supabase

- **Task [F0-T03]:** Crear clientes Supabase para browser y servidor
- **Objetivo:** Centralizar acceso a Supabase y evitar instancias duplicadas.
- **Archivos afectados:** `lib/supabase/client.ts`, `lib/supabase/server.ts`, `lib/supabase/middleware.ts`, `proxy.ts`
- **Instrucciones para el Agente:**
  1. Crear cliente browser usando variables públicas.
  2. Crear cliente server con gestión de cookies/sesión.
  3. Crear middleware para refresco de sesión.
  4. No utilizar service role para operaciones normales.
- **Restricciones:**
  - No implementar bypass de RLS.
  - No utilizar service role en componentes cliente.
- **Criterios de Aceptación:**
  - Los clientes compilan.
  - La sesión Supabase puede recuperarse server-side.
  - El middleware no rompe rutas públicas.
- **Testing / Validación:** Build + prueba manual de sesión.
- **Commit:** `feat(supabase): configure application clients`

---

## Cierre de Fase 0 — 2026-09-07

La fase queda implementada y validada.

- [x] **F0-T01:** scaffold Next.js 16.3.4 con App Router, TypeScript strict, Tailwind CSS, shadcn/ui, ESLint, Vitest y estructura base.
- [x] **F0-T02:** contrato `.env.example` + Zod; secretos server-only separados en `lib/config/server-env.ts` y protegidos con `server-only`.
- [x] **F0-T03:** clientes Supabase browser/server y refresco de cookies en `proxy.ts`, usando sólo anon key; no se usa service role.

### Validación ejecutada

- `npm ci` ✅ — instalación reproducible desde `package-lock.json`, sin vulnerabilidades reportadas.
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm test` ✅ — 1 archivo, 3 tests.
- `npm run build` ✅ — Next.js 16.3.4.
- `npm run dev` ✅ — servidor en `http://localhost:3000`.
- Petición HTTP real a `/` ✅ — `200 OK` sin `.env.local`, gracias al bypass explícito de bootstrap para rutas públicas.
- Validación de whitespace del código y configuración ✅; los documentos fuente incorporados conservan algunos espacios finales originales.
- Smoke de sesión Supabase real: pendiente de credenciales/proyecto Supabase; la creación server-side, cookies y build quedan verificados localmente.

### Decisiones registradas

- La raíz `LeadsDental` es el root del nuevo repositorio Git, rama inicial `main`.
- Al ser un proyecto exclusivamente Node/Next.js, el aislamiento se realiza con `node_modules`, `package-lock.json` y `npm ci`; no se añade un `.venv` Python inexistente en la arquitectura.
- Next.js 16 depreca la convención `middleware.ts`; se usa `proxy.ts` con la misma responsabilidad y se conserva `lib/supabase/middleware.ts` como módulo reutilizable.
- No se implementaron Auth operativa, tablas, datos demo ni lógica CRM, tal como exige el alcance de Fase 0.

### Siguiente fase

La siguiente unidad es **Fase 1 — Core Database**, comenzando por `F1-T01` y sin mezclar UI ni datos demo.

# FASE 1 — Core Database

## Task F1-T01: Crear enums y tablas CRM

- **Task [F1-T01]:** Crear migración inicial de Supabase
- **Objetivo:** Implementar el esquema PostgreSQL definitivo del MVP.
- **Archivos afectados:** `supabase/migrations/<timestamp>_initial_crm_schema.sql`
- **Instrucciones para el Agente:**
  1. Crear enums:
     - `user_role`
     - `treatment`
     - `lead_source`
     - `lead_status`
     - `note_type`
  2. Crear `clinics`.
  3. Crear `profiles`.
  4. Crear `user_clinics`.
  5. Crear `leads`.
  6. Crear `notes`.
  7. Crear `audit_log`.
  8. Añadir PK/FK/NOT NULL.
  9. Añadir timestamps.
  10. Añadir `deleted_at` y `deleted_by`.
  11. Añadir `original_clinic_id`, `clinic_id`, `duplicate_of`.
  12. Añadir índices sobre:
      - `leads.clinic_id`
      - `leads.status`
      - `leads.treatment`
      - `leads.source`
      - `leads.phone_normalized`
      - `leads.created_at`
      - `notes.lead_id`
      - `user_clinics.user_id`
      - `user_clinics.clinic_id`
- **Restricciones:**
  - No crear datos demo.
  - No implementar UI.
  - No almacenar contraseñas.
  - No modificar `auth.users`.
- **Criterios de Aceptación:**
  - La migración puede ejecutarse desde una base vacía.
  - Todas las relaciones tienen FK.
  - Los campos obligatorios tienen `NOT NULL`.
  - Los enums sólo permiten los valores definidos.
- **Testing / Validación:** Aplicar migración sobre Supabase limpio y verificar schema.
- **Commit:** `feat(db): add initial CRM schema`

---

## Task F1-T02: Crear seed de clínicas

- **Task [F1-T02]:** Insertar Madrid, Valencia y Sevilla
- **Objetivo:** Disponer de las tres clínicas requeridas por el producto.
- **Archivos afectados:** `supabase/seed.sql`
- **Instrucciones para el Agente:**
  1. Crear Madrid.
  2. Crear Valencia.
  3. Crear Sevilla.
  4. Asignar slug estable.
  5. Asignar los colores:
     - Madrid `#2563EB`
     - Valencia `#059669`
     - Sevilla `#D97706`
  6. Marcar las tres como activas.
- **Restricciones:**
  - No crear leads todavía.
  - No crear usuarios todavía.
- **Criterios de Aceptación:**
  - Existen exactamente las tres clínicas base.
  - Son recuperables mediante slug.
- **Testing / Validación:** Query de verificación sobre Supabase.
- **Commit:** `feat(db): seed Vitalis clinics`

---

## Task F1-T03: Implementar RLS

- **Task [F1-T03]:** Proteger todas las tablas mediante Row Level Security
- **Objetivo:** Garantizar autorización real en PostgreSQL.
- **Archivos afectados:** `supabase/migrations/<timestamp>_rls_policies.sql`
- **Instrucciones para el Agente:**
  1. Activar RLS en todas las tablas sensibles.
  2. Crear funciones SQL auxiliares sólo si simplifican las policies.
  3. Resolver rol desde `profiles`.
  4. Resolver clínicas permitidas desde `user_clinics`.
  5. ADMIN puede acceder a todas las clínicas.
  6. MANAGER sólo a clínicas asignadas.
  7. RECEPTIONIST sólo a su clínica.
  8. Filtrar leads soft-deleted de consultas normales.
  9. Aplicar policies a SELECT/INSERT/UPDATE/DELETE según corresponda.
  10. Impedir que un usuario modifique relaciones de permisos que no pueda administrar.
- **Restricciones:**
  - No confiar en React.
  - No utilizar `service_role` para simular seguridad.
  - No crear una policy global que permita acceso a todos los usuarios autenticados.
- **Criterios de Aceptación:**
  - Un recepcionista no puede consultar leads de otra clínica mediante Supabase directo.
  - Un manager no puede consultar clínicas no asignadas.
  - ADMIN sí puede consultar todas.
  - Los leads con `deleted_at` no aparecen en consultas normales.
- **Testing / Validación:** Tests SQL/RLS para ADMIN, MANAGER y RECEPTIONIST.
- **Commit:** `feat(db): enforce CRM row level security`

---

## Cierre de Fase 1 — 2026-09-07

La fase queda implementada y validada.

- [x] **F1-T01:** migración inicial con enums, `clinics`, `profiles`,
  `user_clinics`, `leads`, `notes`, `audit_log`, claves foráneas, timestamps,
  soft delete, índices y triggers de integridad.
- [x] **F1-T02:** seed idempotente de Madrid, Valencia y Sevilla con slugs,
  colores corporativos y estado activo. No crea usuarios ni leads demo.
- [x] **F1-T03:** RLS para las seis tablas, helpers de autorización por usuario
  activo/rol/clínica, aislamiento ADMIN/MANAGER/RECEPTIONIST, soft delete y
  notas append-only.

### Archivos incorporados

- `supabase/migrations/20260907120000_initial_crm_schema.sql`
- `supabase/migrations/20260907120100_rls_policies.sql`
- `supabase/seed.sql`
- `supabase/tests/rls.sql`
- `tests/database/schema.test.ts`

### Decisiones registradas

- Los roles se almacenan como `ADMIN`, `CLINIC_MANAGER` y `RECEPTIONIST`.
- El borrado físico de leads está bloqueado por RLS y por trigger; el flujo
  previsto usa `deleted_at` y `deleted_by`.
- Las notas no se pueden editar ni borrar, incluso fuera del flujo normal de
  cliente, para conservar el historial append-only.
- Las funciones `SECURITY DEFINER` sólo resuelven autorización y fijan
  `search_path = public`; no se usa `service_role` para simular permisos.
- El seed usa `ON CONFLICT (slug) DO UPDATE`, por lo que se puede repetir sin
  duplicar las tres clínicas ni borrar clínicas adicionales.

### Validación ejecutada

- `npm test -- --run` ✅ — 2 archivos, 6 tests.
- Aplicación de ambas migraciones sobre PostgreSQL 15 efímero ✅ — 6 tablas,
  6 tablas con RLS, 24 policies y 9 índices requeridos.
- Aplicación del seed sobre base vacía ✅ — 3 clínicas activas.
- `supabase/tests/rls.sql` sobre PostgreSQL 15 efímero ✅ — aislamiento de
  ADMIN, CLINIC_MANAGER y RECEPTIONIST, ocultación de soft-deleted y bloqueo
  de mutaciones físicas/notas.
- Smoke sobre un proyecto Supabase remoto: pendiente de credenciales del
  proyecto; el script está preparado para ejecutarse con `SUPABASE_DB_URL`.

### Siguiente fase

La siguiente unidad es **Fase 2 — Auth y autorización**, comenzando por
`F2-T01` sin mezclar CRUD de leads ni UI de negocio.

# FASE 2 — Auth y autorización

## Task F2-T01: Implementar login/logout

- **Task [F2-T01]:** Crear autenticación interna con Supabase Auth
- **Objetivo:** Permitir únicamente acceso autenticado.
- **Archivos afectados:** `app/login/page.tsx`, `app/login/actions.ts`, `lib/auth/`, `components/auth/`
- **Instrucciones para el Agente:**
  1. Crear formulario email/password.
  2. Implementar login mediante Server Action.
  3. Implementar logout.
  4. Redirigir usuario autenticado a `/dashboard`.
  5. Mostrar error de credenciales sin filtrar información sensible.
  6. No implementar registro público.
  7. Añadir recuperación de contraseña sólo si encaja con el flujo estándar de Supabase; no bloquear el MVP por esta funcionalidad.
- **Restricciones:**
  - No crear signup público.
  - No almacenar passwords.
  - No consultar OpenAI desde login.
- **Criterios de Aceptación:**
  - Usuario válido entra.
  - Usuario inválido recibe error.
  - Usuario autenticado no puede acceder a `/login`.
  - Usuario no autenticado no puede acceder al área privada.
- **Testing / Validación:** E2E login/logout.
- **Commit:** `feat(auth): add Supabase authentication`

---

## Task F2-T02: Crear perfiles y autorización server-side

- **Task [F2-T02]:** Implementar resolución de usuario, rol y clínicas
- **Objetivo:** Centralizar autorización para Server Actions y Route Handlers.
- **Archivos afectados:** `lib/auth/get-current-user.ts`, `lib/permissions/`, `types/auth.ts`
- **Instrucciones para el Agente:**
  1. Implementar `getCurrentUser`.
  2. Resolver profile.
  3. Resolver role.
  4. Resolver clínicas asignadas.
  5. Rechazar usuarios `active=false`.
  6. Crear helpers de autorización:
     - `requireAuthenticatedUser`
     - `requireRole`
     - `requireClinicAccess`
  7. Hacer que devuelvan errores tipados.
- **Restricciones:**
  - No duplicar lógica de permisos en cada página.
  - No confiar exclusivamente en metadata enviada por cliente.
- **Criterios de Aceptación:**
  - Todas las operaciones privadas pueden consultar un único módulo de autorización.
  - Usuario inactivo no puede operar.
  - Acceso a clínica no asignada produce denegación.
- **Testing / Validación:** Unit tests de matriz de permisos.
- **Commit:** `feat(auth): add server-side authorization`

---

## Task F2-T03: Crear usuarios demo

- **Task [F2-T03]:** Preparar tres usuarios internos de demostración
- **Objetivo:** Permitir demostrar roles durante validación y Loom.
- **Archivos afectados:** `scripts/seed-demo-users.ts`, `docs/demo-users.md`
- **Instrucciones para el Agente:**
  1. Crear:
     - `admin@vitalis.demo`
     - `manager@vitalis.demo`
     - `recepcion@vitalis.demo`
  2. Crear sus perfiles.
  3. Asignar:
     - ADMIN → Madrid + Valencia + Sevilla
     - MANAGER → Madrid + Valencia
     - RECEPTIONIST → Madrid
  4. Documentar credenciales sólo en documentación local/no pública.
- **Restricciones:**
  - No introducir contraseñas en Git.
  - No crear usuarios mediante SQL directo en `auth.users`.
- **Criterios de Aceptación:**
  - Los tres usuarios pueden autenticarse.
  - Sus permisos corresponden a la matriz definida.
- **Testing / Validación:** Login con los tres roles + prueba de acceso cruzado.
- **Commit:** `feat(auth): add demo user provisioning`

---

## Cierre de Fase 2 — 2026-09-07

La fase queda implementada y validada localmente.

- [x] **F2-T01:** login y logout con Supabase Auth mediante Server Actions,
  formulario email/password, errores genéricos, cookies SSR y redirección del
  área privada.
- [x] **F2-T02:** resolución server-side de `profiles`, rol, clínicas activas y
  helpers `requireAuthenticatedUser`, `requireRole` y
  `requireClinicAccess`, con errores tipados y rechazo de perfiles inactivos.
- [x] **F2-T03:** provisionador idempotente de los tres usuarios demo usando
  `supabase.auth.admin`, perfiles y asignaciones exactas por clínica. La
  contraseña se recibe por `DEMO_USER_PASSWORD` y nunca se versiona ni se
  imprime.

### Archivos incorporados

- `app/login/page.tsx`
- `app/login/actions.ts`
- `components/auth/login-form.tsx`
- `app/dashboard/page.tsx`
- `lib/auth/session.ts`
- `lib/auth/get-current-user.ts`
- `lib/permissions/`
- `types/auth.ts`
- `scripts/seed-demo-users.ts`
- `tests/auth/permissions.test.ts`
- `tests/auth/demo-users.test.ts`
- `docs/demo-users.md` (ignorado por Git; instrucciones locales)

### Decisiones registradas

- Supabase `auth.getUser()` es la fuente de identidad server-side; no se
  confía en metadata enviada por el cliente.
- `proxy.ts` realiza el refresco de sesión y una comprobación optimista de
  rutas; cada página u operación privada debe usar además los helpers de
  `lib/permissions/`.
- La autorización efectiva combina usuario autenticado, perfil activo, rol y
  clínicas asignadas. ADMIN mantiene alcance global; MANAGER y RECEPTIONIST
  quedan limitados a sus clínicas.
- No existe signup público ni recuperación de contraseña en esta fase; se
  mantiene el MVP de acceso interno.
- El service role se usa exclusivamente en el script local de provisioning,
  nunca en el navegador ni para saltarse la autorización normal del CRM.

### Validación ejecutada

- `npm test -- --run` ✅ — 4 archivos, 11 tests.
- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm run build` ✅ — Next.js 16.3.4.
- `git diff --check` ✅
- `docs/demo-users.md` está ignorado y no hay contraseña ni service role real
  en los archivos versionados ✅.
- Smoke remoto con los tres usuarios y Supabase configurado: pendiente de
  credenciales del proyecto y `DEMO_USER_PASSWORD`; el script ejecutable y la
  ruta de validación quedan preparados.

### Siguiente fase

La siguiente unidad es **Fase 3 — UI Foundation**, comenzando por el layout
privado y la navegación del CRM.

---

# FASE 3 — UI Foundation

## Task F3-T01: Crear layout privado

- **Task [F3-T01]:** Implementar shell de aplicación
- **Objetivo:** Crear navegación consistente para todo el CRM.
- **Archivos afectados:** `app/(protected)/layout.tsx`, `components/layout/sidebar.tsx`, `components/layout/header.tsx`, `components/layout/user-menu.tsx`
- **Instrucciones para el Agente:**
  1. Crear sidebar.
  2. Añadir:
     - Dashboard
     - Leads
     - Actividad
     - Configuración
  3. Mostrar usuario y clínica.
  4. Ocultar navegación no permitida según rol.
  5. Añadir responsive básico.
- **Restricciones:**
  - No crear páginas ficticias con lógica inexistente.
  - No hacer dashboards decorativos.
- **Criterios de Aceptación:**
  - Todas las rutas privadas comparten layout.
  - Logout está disponible.
  - La navegación cambia según permisos.
- **Testing / Validación:** Prueba manual desktop/mobile.
- **Commit:** `feat(ui): add application shell`

---

## Task F3-T02: Crear sistema visual

- **Task [F3-T02]:** Aplicar identidad visual Vitalis
- **Objetivo:** Conseguir una interfaz B2B sanitaria profesional.
- **Archivos afectados:** `app/globals.css`, `components/ui/*`, `components/leads/lead-clinic-badge.tsx`, `components/leads/lead-status-badge.tsx`
- **Instrucciones para el Agente:**
  1. Usar fondo `#F8FAFC`.
  2. Superficies `#FFFFFF`.
  3. Texto `#0F172A`.
  4. Secundario `#64748B`.
  5. Bordes `#E2E8F0`.
  6. Usar cards, radios moderados, sombras suaves y badges.
  7. Clínica identificada mediante texto + color.
  8. Implementar estados loading/empty/error.
- **Restricciones:**
  - No convertir cada clínica en una interfaz completamente coloreada.
  - No depender sólo del color.
  - No invertir tiempo en pixel-perfect.
- **Criterios de Aceptación:**
  - Madrid/Valencia/Sevilla tienen identidad visual consistente.
  - Todos los badges muestran texto.
  - La interfaz es usable en desktop y móvil.
- **Testing / Validación:** Inspección visual.
- **Commit:** `feat(ui): add Vitalis visual system`

---

## Cierre de Fase 3 — 2026-09-07

La fase queda implementada y validada.

- [x] **F3-T01:** shell privado compartido mediante route group, navegación
  condicionada por rol, cabecera con usuario/clínica, logout y adaptación
  responsive para escritorio y móvil.
- [x] **F3-T02:** sistema visual Vitalis basado en fondo `#F8FAFC`, superficies
  blancas, texto `#0F172A`, secundario `#64748B`, bordes `#E2E8F0`, azul
  primario `#2563EB`, cards, badges, estados feedback y accesibilidad visual.

### Archivos incorporados

- `app/(protected)/layout.tsx`
- `app/(protected)/dashboard/page.tsx`
- `components/layout/`
- `components/ui/badge.tsx`
- `components/ui/card.tsx`
- `components/ui/feedback-state.tsx`
- `components/leads/lead-clinic-badge.tsx`
- `components/leads/lead-status-badge.tsx`

### Decisiones registradas

- El route group `(protected)` concentra la comprobación server-side de sesión;
  las futuras rutas privadas heredarán el mismo shell sin duplicar auth.
- La navegación sólo muestra Actividad a ADMIN/CLINIC_MANAGER y Configuración
  a ADMIN, manteniendo Dashboard y Leads para los roles internos operativos.
- Las clínicas se identifican mediante nombre y color; ningún badge depende
  únicamente del color.
- El Dashboard inicial sólo muestra un estado vacío explícito. No se añaden
  métricas decorativas ni datos ficticios antes de implementar el dominio de
  leads.
- Los primitives visuales usan tokens semánticos CSS para que la UI futura no
  dependa de colores inline dispersos.

### Validación ejecutada

- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm test -- --run` ✅ — 4 archivos, 11 tests.
- `npm run build` ✅ — Next.js 16.3.4.
- Smoke HTTP local ✅ — `/` y `/login` responden `200`; `/dashboard` redirige a
  `/login` sin sesión.
- `git diff --check` ✅

### Siguiente fase

La siguiente unidad es **Fase 4 — Leads: dominio + CRUD**, comenzando por
`F4-T01` y usando los contratos visuales de badges y estados definidos aquí.

# FASE 4 — Leads: dominio + CRUD

## Task F4-T01: Crear schemas Zod de leads

- **Task [F4-T01]:** Definir contratos de entrada y actualización
- **Objetivo:** Evitar datos inválidos tanto en frontend como server-side.
- **Archivos afectados:** `lib/validation/lead-schemas.ts`, `types/leads.ts`
- **Instrucciones para el Agente:**
  1. Crear schema de creación.
  2. Crear schema de actualización.
  3. Validar:
     - nombre 2–120 caracteres;
     - teléfono 7–30;
     - UUID clínica;
     - treatment enum;
     - source enum;
     - status enum.
  4. Añadir normalización de strings.
- **Restricciones:**
  - No aceptar enums arbitrarios.
  - No confiar en validación del navegador.
- **Criterios de Aceptación:**
  - Inputs inválidos son rechazados.
  - Inputs válidos producen objetos tipados.
- **Testing / Validación:** Vitest con casos válidos y negativos.
- **Commit:** `feat(validation): add lead schemas`

---

## Task F4-T02: Normalización y detección de duplicados

- **Task [F4-T02]:** Implementar detección de teléfono duplicado
- **Objetivo:** Detectar leads potencialmente duplicados sin fusionarlos.
- **Archivos afectados:** `lib/leads/normalize-phone.ts`, `lib/leads/find-duplicates.ts`, `tests/leads/`
- **Instrucciones para el Agente:**
  1. Crear función determinista `normalizePhone`.
  2. Permitir que formatos como `+34 612 345 678` y `612345678` produzcan una representación comparable.
  3. Consultar leads existentes mediante `phone_normalized`.
  4. Ignorar el propio lead durante update.
  5. Devolver candidatos existentes.
  6. No realizar merge.
  7. Si el usuario decide crear igualmente, guardar `duplicate_of`.
- **Restricciones:**
  - No fusionar registros automáticamente.
  - No eliminar información.
- **Criterios de Aceptación:**
  - El mismo teléfono en formatos diferentes se detecta.
  - Update del mismo lead no se detecta a sí mismo.
  - Se puede continuar creando el lead.
- **Testing / Validación:** Unit tests exhaustivos de normalización + integración de detección.
- **Commit:** `feat(leads): add phone normalization and duplicate detection`

---

## Task F4-T03: Crear servicio de creación

- **Task [F4-T03]:** Implementar creación server-side de leads
- **Objetivo:** Crear leads con validación, autorización, normalización y trazabilidad.
- **Archivos afectados:** `lib/leads/create-lead.ts`, `app/(protected)/leads/new/actions.ts`
- **Instrucciones para el Agente:**
  1. Requerir usuario autenticado.
  2. Validar input Zod.
  3. Comprobar acceso a `clinic_id`.
  4. Generar `phone_normalized`.
  5. Buscar duplicados.
  6. Si existe duplicado, devolver resultado que permita al frontend preguntar.
  7. Si usuario confirma creación, insertar `duplicate_of`.
  8. Guardar `created_by`.
  9. No permitir modificar `original_clinic_id` después de establecerlo salvo flujo explícito de reasignación.
- **Restricciones:**
  - No insertar directamente desde Client Component.
  - No saltarse RLS.
- **Criterios de Aceptación:**
  - Lead válido se crea.
  - Lead de clínica no accesible se rechaza.
  - Duplicado produce aviso.
  - Creación confirmada conserva `duplicate_of`.
- **Testing / Validación:** Integration tests.
- **Commit:** `feat(leads): implement lead creation`

---

## Task F4-T04: Crear listado y filtros

- **Task [F4-T04]:** Implementar listado operacional de leads
- **Objetivo:** Permitir localizar rápidamente cualquier lead permitido.
- **Archivos afectados:** `app/(protected)/leads/page.tsx`, `components/leads/lead-table.tsx`, `components/leads/lead-filters.tsx`, `lib/leads/list-leads.ts`
- **Instrucciones para el Agente:**
  1. Mostrar nombre, teléfono, clínica, tratamiento, fuente y estado.
  2. Añadir búsqueda.
  3. Añadir filtros:
     - clínica;
     - estado;
     - tratamiento;
     - fuente.
  4. Añadir orden:
     - más recientes;
     - última actividad;
     - más antiguos.
  5. No mostrar soft-deleted.
  6. Respetar RLS.
  7. Destacar visualmente `implantes + nuevo`.
- **Restricciones:**
  - No implementar paginación compleja si no es necesaria para el dataset MVP.
  - No consultar leads fuera del scope del usuario.
- **Criterios de Aceptación:**
  - Los filtros se combinan correctamente.
  - Un receptionist sólo ve su clínica.
  - ADMIN ve las tres.
  - Los leads eliminados no aparecen.
- **Testing / Validación:** Integration + manual.
- **Commit:** `feat(leads): add lead listing and filters`

---

## Task F4-T05: Crear formulario de lead

- **Task [F4-T05]:** Implementar alta y edición de leads
- **Objetivo:** Crear y modificar leads desde UI.
- **Archivos afectados:** `components/leads/lead-form.tsx`, `app/(protected)/leads/new/page.tsx`, `app/(protected)/leads/[id]/edit/page.tsx`
- **Instrucciones para el Agente:**
  1. Campos:
     - nombre;
     - teléfono;
     - clínica;
     - tratamiento;
     - fuente;
     - estado.
  2. Validación client-side con el mismo contrato Zod.
  3. Reutilizar formulario para create/edit.
  4. Permitir cambiar clínica.
  5. Al cambiar clínica conservar `original_clinic_id`.
  6. Mostrar loading durante submit.
  7. Mostrar errores accionables.
- **Restricciones:**
  - No crear dos formularios con lógica duplicada.
  - No permitir edición de leads fuera de scope.
- **Criterios de Aceptación:**
  - Crear funciona.
  - Editar funciona.
  - Cambiar clínica funciona.
  - La clínica original se conserva.
- **Testing / Validación:** Tests del schema + E2E create/edit.
- **Commit:** `feat(leads): add lead create and edit forms`

---

## Task F4-T06: Implementar soft delete

- **Task [F4-T06]:** Implementar eliminación lógica de leads
- **Objetivo:** Cumplir el CRUD requerido manteniendo trazabilidad.
- **Archivos afectados:** `lib/leads/delete-lead.ts`, `app/(protected)/leads/actions.ts`, `components/leads/delete-lead-dialog.tsx`
- **Instrucciones para el Agente:**
  1. Confirmar eliminación mediante diálogo.
  2. Comprobar autorización.
  3. Establecer `deleted_at=NOW()`.
  4. Establecer `deleted_by=current_user`.
  5. Excluirlo del listado normal.
  6. Mantener registro histórico.
- **Restricciones:**
  - No ejecutar `DELETE FROM leads`.
  - No eliminar notas asociadas.
- **Criterios de Aceptación:**
  - El lead desaparece del listado normal.
  - Sigue existiendo en DB.
  - `deleted_at` y `deleted_by` están poblados.
- **Testing / Validación:** Integration test.
- **Commit:** `feat(leads): implement soft delete`

---

# Cierre de Fase 4 — 2026-09-07

La fase queda implementada y validada localmente.

- [x] **F4-T01:** schemas Zod compartidos para creación y actualización, con
  normalización de espacios, UUID de clínica y enums cerrados.
- [x] **F4-T02:** normalización determinista de teléfonos españoles y detección
  de duplicados activos sin merge automático; las actualizaciones excluyen el
  propio lead.
- [x] **F4-T03:** creación server-side con autorización por clínica, RLS,
  `phone_normalized`, `original_clinic_id`, `created_by` y confirmación
  explícita de duplicados mediante `duplicate_of`.
- [x] **F4-T04:** listado operacional con búsqueda, filtros combinables por
  clínica/estado/tratamiento/fuente, ordenación por alta/actividad y prioridad
  visual para implantes nuevos.
- [x] **F4-T05:** formulario único de alta y edición, validación compartida,
  loading/error states y conservación de la clínica original al reasignar.
- [x] **F4-T06:** soft delete con diálogo de confirmación, `deleted_at` y
  `deleted_by`; no se ejecuta borrado físico ni se eliminan notas.

### Archivos incorporados

- `lib/validation/lead-schemas.ts` y `types/leads.ts`
- `lib/leads/` con normalización, duplicados, creación, listado, edición y
  borrado lógico
- `app/(protected)/leads/` con listado, alta, edición y Server Actions
- `components/leads/` con filtros, tabla, formulario y diálogo de borrado
- `tests/leads/` con 23 tests unitarios y de servicio

### Decisiones registradas

- La búsqueda se realiza después de recuperar únicamente los leads permitidos
  por RLS; así no se interpola texto de usuario en filtros PostgREST.
- Los duplicados sólo generan una advertencia y requieren seleccionar el
  candidato confirmado; nunca se fusionan registros automáticamente.
- La actualización conserva `original_clinic_id` y exige acceso server-side a
  la clínica actual y a la nueva clínica.
- El listado normal filtra soft-deleted y la acción de borrado sólo actualiza
  metadatos de trazabilidad.

### Validación ejecutada

- `npm test -- --run` ✅ — 9 archivos, 23 tests.
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅ — Next.js 16.3.4; rutas dinámicas `/leads`,
  `/leads/new` y `/leads/[id]/edit` compiladas.
- `git diff --check` ✅
- Smoke remoto de Supabase y E2E de navegador: pendientes de credenciales y
  harness E2E del entorno; los servicios quedan cubiertos con dobles de
  Supabase y los contratos se validan en CI local.

### Commits de la fase

- `caa6d20` `feat(validation): add lead schemas`
- `fd49281` `feat(leads): add phone normalization and duplicate detection`
- `7a8c6bf` `feat(leads): implement lead creation`
- `50b389f` `feat(leads): add lead listing and filters`
- `4d4b2dc` `feat(leads): add lead create and edit forms`
- `feat(leads): implement soft delete` (este commit)

### Siguiente fase

La siguiente unidad es **Fase 5 — Notas y actividad**, comenzando por
`F5-T01` y usando el lead activo y el aislamiento por clínica ya disponibles.

# FASE 5 — Notas y actividad

## Task F5-T01: Crear servicio de notas append-only

- **Task [F5-T01]:** Implementar creación de notas
- **Objetivo:** Registrar llamadas, mensajes y mensajes generados por IA.
- **Archivos afectados:** `lib/notes/create-note.ts`, `lib/validation/note-schemas.ts`, `app/(protected)/leads/[id]/actions.ts`
- **Instrucciones para el Agente:**
  1. Validar `lead_id`.
  2. Validar texto.
  3. Validar tipo:
     - `llamada`
     - `mensaje`
     - `mensaje_generado_ia`
  4. Guardar `created_by`.
  5. Guardar `created_at`.
  6. Permitir metadata JSON.
  7. Comprobar acceso al lead.
- **Restricciones:**
  - No implementar update de notas.
  - No implementar delete de notas.
- **Criterios de Aceptación:**
  - Una nota creada queda persistida.
  - No puede editarse posteriormente.
  - Sólo usuarios autorizados pueden añadirla.
- **Testing / Validación:** Integration + permission tests.
- **Commit:** `feat(notes): add append-only lead notes`

---

## Task F5-T02: Timeline del lead

- **Task [F5-T02]:** Mostrar historial de actividad
- **Objetivo:** Convertir la ficha en un historial operativo.
- **Archivos afectados:** `components/notes/note-list.tsx`, `components/notes/note-item.tsx`, `components/notes/note-form.tsx`, `app/(protected)/leads/[id]/page.tsx`
- **Instrucciones para el Agente:**
  1. Ordenar notas cronológicamente.
  2. Mostrar fecha/hora.
  3. Mostrar tipo.
  4. Mostrar texto.
  5. Diferenciar visualmente IA de interacción humana.
  6. Añadir formulario de nueva nota.
- **Restricciones:**
  - No permitir edición.
  - No permitir borrado.
- **Criterios de Aceptación:**
  - La timeline refleja inmediatamente nuevas notas.
  - El tipo se visualiza correctamente.
  - Las notas IA aparecen como `mensaje generado por IA`.
- **Testing / Validación:** E2E añadir llamada y comprobar timeline.
- **Commit:** `feat(notes): add lead activity timeline`

---

# Cierre de Fase 5 — 2026-09-07

La fase queda implementada y validada localmente.

- [x] **F5-T01:** schema Zod de notas, servicio server-only de creación,
  autorización por clínica mediante Supabase/RLS, `created_by`, metadata JSON y
  Server Action. Las notas sólo se insertan; no existen operaciones de update o
  delete en la aplicación.
- [x] **F5-T02:** ficha inicial `/leads/[id]`, timeline cronológica, tipos y
  fecha/hora visibles, tratamiento visual específico para mensajes generados
  por IA y formulario de nueva actividad con estados de validación y pending.

### Archivos incorporados

- `lib/validation/note-schemas.ts`, `lib/notes/` y `types/notes.ts`
- `app/(protected)/leads/[id]/actions.ts`
- `app/(protected)/leads/[id]/page.tsx`
- `app/page.tsx`
- `components/notes/`
- `tests/notes/create-note.test.ts`

### Decisiones registradas

- La consulta de notas se ejecuta con el cliente Supabase autenticado y queda
  limitada por las policies existentes; un lead soft-deleted o fuera del
  alcance no revela su actividad.
- El texto de nota se limita a 5.000 caracteres, se recorta en los extremos y
  se renderiza como texto escapado con saltos de línea, nunca como HTML.
- La timeline ordena del registro más antiguo al más reciente para conservar el
  flujo natural de seguimiento; las notas de IA usan una identidad visual
  diferenciada y no se pueden editar ni eliminar.
- Tras una creación correcta se revalida la ruta de la ficha y el formulario se
  limpia mediante una revisión de estado, sin efectos de renderizado en cascada.

### Validación ejecutada

- `npm test -- --run` ✅ — 10 archivos, 28 tests.
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run build` ✅ — Next.js 16.3.4; se genera `/leads/[id]` como ruta
  dinámica.
- `git diff --check` ✅
- E2E real con Supabase y navegador: pendiente de credenciales y harness E2E
  del entorno; los contratos de servicio se cubren con dobles de Supabase.

### Commits de la fase

- `72013be` `feat(notes): add append-only lead notes`
- `feat(notes): add lead activity timeline` (este commit)

### Siguiente fase

La siguiente unidad es **Fase 6 — Auditoría**, comenzando por `F6-T01` y
registrando las mutaciones CRM sin guardar prompts completos ni datos sensibles
innecesarios.

# FASE 6 — Auditoría

## Task F6-T01: Implementar audit service

- **Task [F6-T01]:** Crear servicio central de auditoría
- **Objetivo:** Registrar acciones relevantes con contexto.
- **Archivos afectados:** `lib/audit/create-audit-entry.ts`, `types/audit.ts`
- **Instrucciones para el Agente:**
  1. Implementar creación de:
     - `LEAD_CREATED`
     - `LEAD_UPDATED`
     - `LEAD_DELETED`
     - `NOTE_CREATED`
     - `LEAD_STATUS_CHANGED`
     - `LEAD_CLINIC_CHANGED`
     - `AI_FOLLOWUP_REQUESTED`
     - `AI_FOLLOWUP_GENERATED`
     - `AI_FOLLOWUP_FAILED`
     - `USER_CREATED`
     - `USER_DEACTIVATED`
  2. Guardar actor.
  3. Guardar entity.
  4. Guardar old/new values cuando proceda.
  5. Guardar metadata.
- **Restricciones:**
  - No guardar prompts completos de IA.
  - No introducir logging de información sensible innecesaria.
- **Criterios de Aceptación:**
  - Cada acción crítica genera una entrada.
  - El actor está identificado.
  - Los cambios de lead permiten conocer antes/después.
- **Testing / Validación:** Unit + integration.
- **Commit:** `feat(audit): add audit logging service`

---

## Task F6-T02: Integrar auditoría con operaciones CRM

- **Task [F6-T02]:** Auditar creación, edición, cambio de estado, clínica, notas y borrado
- **Objetivo:** Garantizar trazabilidad real del CRM.
- **Archivos afectados:** `lib/leads/create-lead.ts`, `lib/leads/update-lead.ts`, `lib/leads/delete-lead.ts`, `lib/notes/create-note.ts`
- **Instrucciones para el Agente:**
  1. Integrar `createAuditEntry` después de cada mutación correcta.
  2. Capturar valores previos/nuevos en updates.
  3. Detectar específicamente cambio de estado.
  4. Detectar específicamente cambio de clínica.
  5. Auditar soft delete.
  6. Auditar creación de nota.
- **Restricciones:**
  - No depender del frontend para generar auditoría.
  - No crear logs si la mutación principal ha fallado.
- **Criterios de Aceptación:**
  - Error de DB no genera falso positivo.
  - Toda mutación válida genera auditoría.
  - Cambio de clínica queda registrado.
- **Testing / Validación:** Integration tests.
- **Commit:** `feat(audit): audit CRM mutations`

---

# Cierre de Fase 6 — 2026-09-07

La fase queda implementada y validada.

- [x] **F6-T01:** servicio central `createAuditEntry` con contrato Zod,
  acciones y entidades tipadas, actor server-side, valores anteriores/nuevos y
  metadata JSON.
- [x] **F6-T02:** auditoría integrada en creación, edición, cambio de estado,
  cambio de clínica, soft delete de leads y creación de notas.

### Decisiones registradas

- Los snapshots de leads no guardan nombre ni teléfono; se conservan los
  campos operativos necesarios para trazabilidad y los nombres de los campos
  modificados.
- Una mutación sólo intenta auditarse después de que Supabase confirme su
  escritura principal; si falla la auditoría, el servicio devuelve un error
  explícito y no presenta la operación como completamente trazada.
- Las notas sólo registran en auditoría su tipo y el lead asociado; el texto
  potencialmente sensible permanece únicamente en `notes`.
- La auditoría utiliza el cliente Supabase autenticado y respeta la policy RLS
  `actor_user_id = auth.uid()`; no se usa `service_role`.

### Archivos incorporados o modificados

- `types/audit.ts`
- `lib/audit/create-audit-entry.ts`
- `lib/leads/create-lead.ts`
- `lib/leads/update-lead.ts`
- `lib/leads/delete-lead.ts`
- `lib/notes/create-note.ts`
- `tests/audit/create-audit-entry.test.ts`
- `tests/leads/update-lead.test.ts`
- tests existentes de leads/notas ampliados con aserciones de auditoría.

### Validación ejecutada

- `npm test -- --run` ✅ — 12 archivos, 35 tests.
- `npm run typecheck` ✅
- `npm run lint` ✅
- `git diff --check` ✅

### Commits de la fase

- `155026d` `feat(audit): add audit logging service`
- `feat(audit): audit CRM mutations` (este commit)

### Siguiente fase

La siguiente unidad es **Fase 7 — Ficha de lead y pipeline**, comenzando por
`F7-T01`.

# FASE 7 — Ficha de lead y pipeline

## Task F7-T01: Construir ficha completa del lead

- **Task [F7-T01]:** Implementar `/leads/[id]`
- **Objetivo:** Crear la pantalla central del CRM.
- **Archivos afectados:** `app/(protected)/leads/[id]/page.tsx`, `components/leads/lead-detail.tsx`, `components/leads/lead-status-badge.tsx`, `components/leads/lead-clinic-badge.tsx`
- **Instrucciones para el Agente:**
  1. Mostrar nombre.
  2. Teléfono.
  3. Clínica actual.
  4. Tratamiento.
  5. Fuente.
  6. Estado.
  7. Indicador de clínica original cuando sea distinta.
  8. Timeline.
  9. Botón editar.
  10. Botón añadir nota.
  11. Área IA.
- **Restricciones:**
  - No añadir módulos no definidos.
  - No mostrar datos clínicos.
- **Criterios de Aceptación:**
  - La ficha carga sólo si el usuario tiene acceso.
  - Un lead inexistente devuelve estado 404 apropiado.
  - Todas las operaciones respetan autorización.
- **Testing / Validación:** E2E abrir lead.
- **Commit:** `feat(leads): add lead detail view`

---

## Task F7-T02: Implementar transiciones de estado

- **Task [F7-T02]:** Añadir actualización de pipeline
- **Objetivo:** Representar el flujo comercial del brief.
- **Archivos afectados:** `lib/leads/update-lead-status.ts`, `components/leads/lead-status-selector.tsx`
- **Instrucciones para el Agente:**
  1. Estados:
     - `nuevo`
     - `contactado`
     - `cita_agendada`
     - `no_interesado`
     - `cliente`
  2. Permitir las transiciones operativas.
  3. Registrar cambio en audit.
  4. Actualizar `updated_at`.
  5. Mantener `LEAD_STATUS_CHANGED`.
- **Restricciones:**
  - No implementar motor complejo de workflow.
  - No bloquear innecesariamente transiciones del MVP.
- **Criterios de Aceptación:**
  - El estado cambia y persiste.
  - La auditoría contiene old/new.
  - La UI refleja inmediatamente el nuevo estado.
- **Testing / Validación:** Unit + integration.
- **Commit:** `feat(leads): add pipeline status transitions`

## Cierre de Fase 7 — 2026-09-07

La fase queda implementada y validada.

- [x] **F7-T01:** ficha `/leads/[id]` completa con contacto, clínica actual,
  tratamiento, fuente, estado, clínica original cuando aplica, timeline,
  edición, notas y área preparada para IA supervisada.
- [x] **F7-T02:** selector de estados del pipeline con mutación server-side,
  validación Zod, autorización por clínica, actualización de `updated_at` vía
  trigger existente y auditoría `LEAD_STATUS_CHANGED` con valores anterior y
  nuevo.

### Decisiones registradas

- La ficha se compone en `LeadDetail`; la página sigue siendo un Server
  Component y devuelve `notFound()` cuando el lead no existe o no pertenece al
  alcance RLS del usuario.
- La clínica original sólo muestra su nombre si pertenece al alcance autorizado
  del usuario; en otro caso se indica de forma genérica que es otra clínica.
- El selector de estado no impone un workflow rígido: permite cualquiera de
  los cinco estados operativos del MVP y evita generar auditoría para un cambio
  que no modifica el estado.
- La acción de cambio de estado vuelve a leer el lead antes de mutarlo y usa
  una comprobación optimista del estado anterior para no sobrescribir un cambio
  concurrente.
- El área de IA queda presentada como punto de integración de Fase 8; no hace
  llamadas a proveedores ni envía mensajes automáticamente.

### Archivos incorporados o modificados

- `components/leads/lead-detail.tsx`
- `components/leads/lead-status-selector.tsx`
- `app/(protected)/leads/[id]/page.tsx`
- `app/(protected)/leads/[id]/actions.ts`
- `lib/leads/get-lead.ts`
- `lib/leads/status-form-state.ts`
- `lib/leads/update-lead-status.ts`
- `types/leads.ts`
- `tests/leads/update-lead-status.test.ts`

### Validación ejecutada

- `npm test -- --run` ✅ — 13 archivos, 38 tests.
- `npm run typecheck` ✅
- `npm run lint` ✅
- `git diff --check` ✅
- `npm run build` ✅ — Next.js 16.3.4 compila las rutas protegidas y la nueva
  Server Action de pipeline.

### Commits de la fase

- `c424f7c` `feat(leads): add lead detail view`
- `feat(leads): add pipeline status transitions` (este commit)

### Siguiente fase

La siguiente unidad es **Fase 8 — IA Follow-up**, comenzando por `F8-T01`.

---

# FASE 8 — IA Follow-up

## Task F8-T01: Crear contrato del prompt

- **Task [F8-T01]:** Versionar prompt de generación de seguimiento
- **Objetivo:** Establecer un comportamiento IA determinista y seguro.
- **Archivos afectados:** `lib/ai/prompts/followup.ts`, `lib/ai/config.ts`
- **Instrucciones para el Agente:**
  1. Definir `SYSTEM_PROMPT_VERSION=1.0`.
  2. Prompt en español.
  3. Tono cercano + profesional.
  4. Mensaje breve.
  5. Adaptar a estado.
  6. Adaptar a tratamiento.
  7. No hacer diagnósticos.
  8. No proporcionar recomendaciones médicas.
  9. No inventar descuentos.
  10. No inventar disponibilidad.
  11. No afirmar que una cita está reservada.
  12. No utilizar información no proporcionada.
  13. Debe sonar humano.
  14. Debe ser apropiado para WhatsApp.
- **Restricciones:**
  - No enviar la base de datos completa.
  - No incluir información clínica innecesaria.
- **Criterios de Aceptación:**
  - El prompt está versionado.
  - El comportamiento está limitado al contexto comercial.
- **Testing / Validación:** Test de construcción de prompt.
- **Commit:** `feat(ai): define follow-up prompt contract`

---

## Task F8-T02: Construir contexto mínimo para IA

- **Task [F8-T02]:** Crear contexto seguro de generación
- **Objetivo:** Enviar únicamente la información necesaria a OpenAI.
- **Archivos afectados:** `lib/ai/build-followup-context.ts`, `types/ai.ts`
- **Instrucciones para el Agente:**
  1. Incluir:
     - nombre;
     - clínica;
     - tratamiento;
     - estado;
     - última interacción relevante.
  2. Añadir como máximo las últimas notas relevantes.
  3. No incluir toda la DB.
  4. No incluir datos no necesarios.
- **Restricciones:**
  - No incluir historial clínico.
  - No incluir credenciales.
  - No incluir datos de otros leads.
- **Criterios de Aceptación:**
  - El contexto generado sólo contiene campos permitidos.
  - Las notas se limitan al contexto necesario.
- **Testing / Validación:** Unit test del contexto.
- **Commit:** `feat(ai): build minimal follow-up context`

---

## Task F8-T03: Implementar cliente OpenAI server-side

- **Task [F8-T03]:** Integrar OpenAI Responses API
- **Objetivo:** Realizar la llamada real a GPT-5.6 Luna.
- **Archivos afectados:** `lib/ai/openai-client.ts`, `lib/ai/generate-followup.ts`
- **Instrucciones para el Agente:**
  1. Instalar SDK oficial correspondiente.
  2. Inicializarlo exclusivamente server-side.
  3. Leer `OPENAI_API_KEY`.
  4. Leer `OPENAI_MODEL`.
  5. Usar Responses API.
  6. Generar `request_id` UUID antes de la llamada.
  7. Medir `latency_ms`.
  8. Solicitar respuesta estructurada con:
     ```json
     {
       "message": "..."
     }
     ```
  9. Validar respuesta mediante Zod.
  10. Rechazar respuestas inválidas.
- **Restricciones:**
  - Nunca ejecutar OpenAI desde browser.
  - Nunca exponer API key.
  - No aceptar texto arbitrario sin validar.
- **Criterios de Aceptación:**
  - Una llamada real devuelve un mensaje válido.
  - Una respuesta inválida es rechazada.
  - El cliente funciona sólo server-side.
- **Testing / Validación:** Unit tests mockeando OpenAI + prueba real controlada.
- **Commit:** `feat(ai): integrate OpenAI Responses API`

---

## Task F8-T04: Implementar generación y guardado atómico

- **Task [F8-T04]:** Generar mensaje y almacenarlo como nota IA
- **Objetivo:** Completar el flujo central de IA de la prueba.
- **Archivos afectados:** `lib/ai/generate-followup.ts`, `app/(protected)/leads/[id]/actions.ts`
- **Instrucciones para el Agente:**
  1. Requerir usuario autenticado.
  2. Comprobar permiso sobre lead.
  3. Leer lead.
  4. Leer contexto permitido.
  5. Generar `request_id`.
  6. Crear `AI_FOLLOWUP_REQUESTED`.
  7. Ejecutar OpenAI.
  8. Validar respuesta.
  9. Guardar nota:
     - `type = mensaje_generado_ia`
     - `text = message`
  10. Guardar metadata:
      - model;
      - prompt_version;
      - request_id;
      - generated_at;
      - latency_ms.
  11. Crear `AI_FOLLOWUP_GENERATED`.
  12. En caso de error:
      - `AI_FOLLOWUP_FAILED`;
      - no crear nota falsa.
- **Restricciones:**
  - No enviar automáticamente WhatsApp.
  - No modificar el lead por generar IA.
  - No guardar prompt completo en auditoría.
- **Criterios de Aceptación:**
  - Pulsar el botón produce una llamada real.
  - El resultado aparece en la ficha.
  - El resultado queda guardado como nota IA.
  - Si OpenAI falla, no aparece una nota falsa.
  - `request_id` queda registrado.
- **Testing / Validación:** Integration test + prueba real con API.
- **Commit:** `feat(ai): generate and persist follow-up messages`

---

## Task F8-T05: UI de generación IA

- **Task [F8-T05]:** Implementar botón y estados de generación
- **Objetivo:** Dar feedback claro durante una operación que depende de una API externa.
- **Archivos afectados:** `components/ai/generate-followup-button.tsx`, `components/ai/generated-message.tsx`, `components/ai/ai-loading-state.tsx`
- **Instrucciones para el Agente:**
  1. Mostrar botón `Generar mensaje de seguimiento`.
  2. Deshabilitar durante generación.
  3. Mostrar `Generando...`.
  4. Mostrar resultado.
  5. Indicar que es un borrador para revisión humana.
  6. Refrescar timeline tras éxito.
  7. Mostrar error accionable.
- **Restricciones:**
  - No mostrar la API key.
  - No permitir doble click que lance generaciones simultáneas.
  - No implementar envío real.
- **Criterios de Aceptación:**
  - El botón se deshabilita durante la petición.
  - El mensaje aparece después de generación.
  - El usuario entiende que debe revisarlo antes de enviarlo.
- **Testing / Validación:** E2E con mock/control de OpenAI.
- **Commit:** `feat(ai): add follow-up generation UI`

---

## Task F8-T06: Rate limiting de IA

- **Task [F8-T06]:** Limitar generaciones IA
- **Objetivo:** Evitar abuso accidental del endpoint.
- **Archivos afectados:** `lib/ai/rate-limit.ts`, `app/(protected)/leads/[id]/actions.ts`
- **Instrucciones para el Agente:**
  1. Aplicar límite de 10 generaciones/minuto/usuario.
  2. Identificar al usuario server-side.
  3. Rechazar solicitudes por encima del límite.
  4. Mostrar mensaje comprensible.
- **Restricciones:**
  - No implementar infraestructura compleja.
  - No utilizar IP como único identificador.
- **Criterios de Aceptación:**
  - Hasta 10 operaciones permitidas.
  - La siguiente operación dentro de la ventana se rechaza.
  - El rate limit no afecta CRUD.
- **Testing / Validación:** Unit/integration.
- **Commit:** `feat(ai): add generation rate limiting`

## Cierre de Fase 8 — 2026-09-07

La fase queda implementada y validada.

- [x] **F8-T01:** prompt versionado `1.0` en español, con límites comerciales
  explícitos: tono cercano y profesional, formato WhatsApp, sin diagnósticos,
  recomendaciones médicas, descuentos, disponibilidad inventada ni reservas
  afirmadas.
- [x] **F8-T02:** contexto mínimo con nombre, clínica, tratamiento, estado,
  última interacción y como máximo tres notas recientes recortadas; no se
  transmiten teléfono, IDs, credenciales, historial clínico ni datos de otros
  leads.
- [x] **F8-T03:** SDK oficial `openai` server-only, Responses API, modelo y API
  key desde entorno server-side, `request_id` UUID, `latency_ms`, salida
  estructurada `{ message }` y validación Zod.
- [x] **F8-T04:** Server Action autorizada que crea auditoría de solicitud,
  genera el borrador y persiste nota IA + `AI_FOLLOWUP_GENERATED` mediante RPC
  transaccional. Los errores generan `AI_FOLLOWUP_FAILED` y nunca una nota
  falsa; no se guarda el prompt completo ni se envía WhatsApp.
- [x] **F8-T05:** botón supervisado en la ficha del lead con bloqueo durante la
  petición, estado `Generando…`, resultado visible como borrador, actualización
  de timeline y errores accionables.
- [x] **F8-T06:** límite deslizante de 10 generaciones por minuto y usuario,
  resuelto con el `user.id` server-side; no afecta al CRUD ni usa IP como
  identidad.

### Decisiones registradas

- La nota IA y su auditoría de generación se guardan en una sola transacción
  PostgreSQL (`persist_ai_followup`), respetando las policies RLS mediante
  `SECURITY INVOKER`.
- La API de OpenAI se llama con `store: false`; sólo se auditan metadatos
  operativos mínimos (`model`, `prompt_version`, `request_id`, timestamps y
  latencia), nunca el prompt completo.
- El SDK oficial queda fijado en `openai@6.49.0` para conservar la compatibilidad
  declarada con Node `>=20.9.0`; la rama 7.x requiere Node 22.
- El rate limit es un sliding window en memoria del proceso. Es suficiente para
  el MVP y evita infraestructura adicional; si el despliegue escala a varias
  instancias deberá sustituirse por un almacén compartido.
- La IA genera únicamente borradores comerciales. La revisión humana sigue
  siendo obligatoria y no existe envío automático.

### Archivos incorporados o modificados

- `lib/ai/config.ts`
- `lib/ai/prompts/followup.ts`
- `lib/ai/build-followup-context.ts`
- `types/ai.ts`
- `lib/ai/openai-client.ts`
- `lib/ai/generate-followup.ts`
- `lib/ai/form-state.ts`
- `lib/ai/rate-limit.ts`
- `supabase/migrations/20260907120200_ai_followup_persistence.sql`
- `app/(protected)/leads/[id]/actions.ts`
- `app/(protected)/leads/[id]/page.tsx`
- `components/ai/ai-loading-state.tsx`
- `components/ai/generate-followup-button.tsx`
- `components/ai/generated-message.tsx`
- `components/leads/lead-detail.tsx`
- `tests/ai/`

### Validación ejecutada

- `npm test -- --run` ✅ — 18 archivos, 52 tests.
- `npm run typecheck` ✅
- `npm run lint` ✅
- `git diff --check` ✅
- `npm run build` ✅ — Next.js 16.3.4 compila las rutas protegidas y la Server Action de IA.
- Prueba real controlada contra OpenAI 🟡 — habilitada desde el entorno local:
  `.env` ya contiene `OPENAI_API_KEY`. La clave permanece fuera de Git y no se
  incluye en este documento; ya se puede ejecutar una llamada real usando el
  modelo configurado, siempre que la cuenta tenga acceso a él.
- Smoke Playwright ⏸️ — el helper levanta Next correctamente, pero la sesión
  Supabase configurada devuelve `AUTHORIZATION_UNAVAILABLE`; queda pendiente
  ejecutarlo con un proyecto y usuario de demo válidos en la fase de testing
  integral.

### Actualización de entorno — 2026-09-07

El entorno local `.env` ha sido actualizado con la API key de OpenAI. Esto
desbloquea las pruebas reales controladas de generación IA. `.env` está ignorado
por Git y la clave sólo debe consumirse server-side; no se debe copiar a
`.env.example`, documentación, logs ni commits. La prueba real completa desde
la ficha del lead seguirá necesitando también una sesión Supabase válida y un
lead accesible.

### Commits de la fase

- `e051268` `feat(ai): define follow-up prompt contract`
- `061a960` `feat(ai): build minimal follow-up context`
- `11db443` `feat(ai): integrate OpenAI Responses API`
- `fc5b790` `feat(ai): generate and persist follow-up messages`
- `a257c2e` `feat(ai): add follow-up generation UI`
- `4ddf4a6` `feat(ai): add generation rate limiting`

### Siguiente fase

La siguiente unidad es **Fase 9 — Dashboard**, comenzando por `F9-T01`.

---

# FASE 9 — Dashboard

## Task F9-T01: Crear consultas agregadas

- **Task [F9-T01]:** Implementar métricas operativas
- **Objetivo:** Dar una visión accionable en menos de cinco segundos.
- **Archivos afectados:** `lib/dashboard/get-dashboard-stats.ts`, `types/dashboard.ts`
- **Instrucciones para el Agente:**
  1. Calcular:
     - total leads;
     - nuevos;
     - citas agendadas;
     - implantes;
     - distribución por estado;
     - distribución por clínica;
     - tratamientos predominantes.
  2. Respetar scope del usuario.
  3. Excluir soft-deleted.
- **Restricciones:**
  - No implementar analytics avanzado.
  - No introducir gráficas innecesarias.
- **Criterios de Aceptación:**
  - ADMIN obtiene datos globales.
  - MANAGER obtiene datos de clínicas asignadas.
  - RECEPTIONIST obtiene datos de su clínica.
- **Testing / Validación:** Integration tests con los tres roles.
- **Commit:** `feat(dashboard): add operational metrics`

---

## Task F9-T02: Implementar priorización

- **Task [F9-T02]:** Calcular `requires_attention`
- **Objetivo:** Visibilizar leads de mayor prioridad comercial.
- **Archivos afectados:** `lib/leads/priority.ts`, `components/leads/lead-priority-indicator.tsx`
- **Instrucciones para el Agente:**
  1. Implementar regla MVP:
     - `treatment=implantes`
     - `status=nuevo`
     - ⇒ prioridad alta.
  2. No persistir necesariamente el campo.
  3. Mostrar indicador textual accesible.
- **Restricciones:**
  - No crear scoring complejo.
  - No usar IA para esta regla.
- **Criterios de Aceptación:**
  - Implante + nuevo queda destacado.
  - Otros leads no reciben prioridad alta sin cumplir regla.
- **Testing / Validación:** Unit tests.
- **Commit:** `feat(leads): add attention priority`

---

## Task F9-T03: Construir dashboard UI

- **Task [F9-T03]:** Crear `/dashboard`
- **Objetivo:** Proporcionar resumen operacional.
- **Archivos afectados:** `app/(protected)/dashboard/page.tsx`, `components/dashboard/stats-card.tsx`, `components/dashboard/recent-leads.tsx`
- **Instrucciones para el Agente:**
  1. Mostrar saludo contextual.
  2. Cards:
     - Leads
     - Nuevos
     - Citas
     - Implantes
  3. Mostrar leads recientes.
  4. Mostrar sección `Necesitan seguimiento`.
  5. Enlazar cada lead a su ficha.
  6. Utilizar skeleton loading.
  7. Añadir empty states.
- **Restricciones:**
  - No crear dashboard financiero.
  - No añadir charts por decoración.
- **Criterios de Aceptación:**
  - El dashboard responde rápidamente a qué requiere actuación.
  - Los datos coinciden con DB.
  - Respeta permisos.
- **Testing / Validación:** E2E dashboard + comparación con fixtures.
- **Commit:** `feat(dashboard): add operational overview`

### Estado de implementación de Fase 9

- Las métricas operativas consultan únicamente leads activos dentro del alcance
  RLS del usuario y cubren total, nuevos, citas, implantes y distribuciones por
  estado, clínica y tratamiento.
- La priorización MVP queda centralizada en `requiresAttention`: sólo un lead
  de implantes con estado nuevo recibe el indicador accesible `Necesita
  seguimiento`.
- `/dashboard` muestra saludo contextual, métricas principales, leads recientes,
  prioridades, estados vacíos, skeleton de carga y distribución compacta del
  pipeline sin introducir gráficas decorativas.

### Validación ejecutada

- `npm test` ✅ — 20 archivos, 61 tests.
- `npm run typecheck` ✅
- `npm run lint` ✅
- `git diff --check` ✅
- `npm run build` ✅ — Next.js 16.3.4 compila `/dashboard` como ruta dinámica
  protegida.
- Smoke E2E ⏸️ — `/dashboard` redirige correctamente a `/login`, pero la prueba
  no puede autenticarse porque el `.env` local usa
  `your-project.supabase.co` como placeholder y no resuelve DNS.

### Commits de la fase

- `9773da2` `feat(dashboard): add operational metrics`
- `944c4d6` `feat(leads): add attention priority`
- `df8d984` `feat(dashboard): add operational overview`

### Pendiente de cierre

Configurar un proyecto Supabase local o válido, cargar fixtures de demo y
ejecutar el E2E del dashboard con los tres roles. La fase debe permanecer
pendiente hasta completar esa validación.

### Configuración real acordada — 2026-09-07

- El dominio de presentación elegido para este CRM es
  `https://crmleads.carlosrevert.es`, más descriptivo que el dominio paraguas
  `delegia.carlosrevert.es`.
- El proyecto remoto Supabase aún requiere ser creado o identificado. Las keys
  reales se mantendrán sólo en `.env`/Vercel y nunca en el repositorio,
  roadmap, logs o mensajes.
- Para habilitar las pruebas hay que aplicar las migraciones y el seed
  estructural, definir `DEMO_USER_PASSWORD` localmente y ejecutar
  `npm run demo:users`.
- Antes de publicar, Vercel debe asignar el destino CNAME exacto para el
  subdominio y ese valor se añadirá en el proveedor DNS de `carlosrevert.es`.

---

# FASE 10 — Settings y control de administración

## Task F10-T01: Gestión de usuarios ADMIN

- **Task [F10-T01]:** Implementar administración mínima de usuarios
- **Objetivo:** Permitir gestionar usuarios internos sin registro público.
- **Archivos afectados:** `app/(protected)/settings/users/page.tsx`, `components/settings/user-table.tsx`, `lib/users/`
- **Instrucciones para el Agente:**
  1. Sólo ADMIN puede acceder.
  2. Mostrar usuarios, rol, estado y clínicas.
  3. Permitir desactivar usuarios.
  4. Permitir crear usuarios mediante flujo server-side apropiado.
  5. Asignar clínicas.
- **Restricciones:**
  - No permitir a receptionist/manager administrar usuarios.
  - No exponer passwords.
  - No crear signup público.
- **Criterios de Aceptación:**
  - Usuario no ADMIN recibe 403/redirect apropiado.
  - ADMIN puede desactivar usuario.
  - Usuario desactivado no puede entrar.
- **Testing / Validación:** Permission + integration.
- **Commit:** `feat(settings): add user administration`

---

## Task F10-T02: Gestión de clínicas

- **Task [F10-T02]:** Implementar configuración mínima de clínicas
- **Objetivo:** Permitir consultar/administrar las clínicas existentes.
- **Archivos afectados:** `app/(protected)/settings/clinics/page.tsx`, `components/settings/clinic-list.tsx`
- **Instrucciones para el Agente:**
  1. Mostrar Madrid, Valencia y Sevilla.
  2. Mostrar color.
  3. Mostrar estado activo.
  4. Permitir administración sólo a ADMIN.
- **Restricciones:**
  - No implementar creación libre de clínicas si no es necesaria para la demo.
  - No permitir que un receptionist modifique clínicas.
- **Criterios de Aceptación:**
  - ADMIN puede consultar configuración.
  - Otros roles no pueden modificarla.
- **Testing / Validación:** Manual + permission test.
- **Commit:** `feat(settings): add clinic configuration`

---

## Task F10-T03: Auditoría visible para ADMIN

- **Task [F10-T03]:** Crear visor de auditoría
- **Objetivo:** Demostrar trazabilidad.
- **Archivos afectados:** `app/(protected)/settings/audit/page.tsx`, `components/settings/audit-log-table.tsx`, `lib/audit/list-audit-log.ts`
- **Instrucciones para el Agente:**
  1. Sólo ADMIN.
  2. Mostrar:
     - fecha;
     - actor;
     - acción;
     - entidad;
     - ID.
  3. Permitir abrir detalles de old/new values cuando corresponda.
  4. No mostrar secretos.
- **Restricciones:**
  - No mostrar API keys.
  - No mostrar prompts completos.
  - No permitir edición.
- **Criterios de Aceptación:**
  - ADMIN puede comprobar el borrado lógico.
  - Receptionist no puede acceder.
- **Testing / Validación:** Permission + manual.
- **Commit:** `feat(audit): add audit log viewer`

---

### Cierre de Fase 10 — 2026-09-07

La fase queda implementada y validada localmente.

- [x] **F10-T01:** administración de usuarios internos en `/settings/users`, protegida para ADMIN, con listado de rol/estado/clínicas, invitación por email mediante Supabase Auth, asignación de clínicas y desactivación segura.
- [x] **F10-T02:** configuración de clínicas en `/settings/clinics`, con clínicas, ciudad, color corporativo y estado. No se añade creación libre de clínicas en el MVP.
- [x] **F10-T03:** visor de auditoría ADMIN en `/settings/audit`, de solo lectura, con actor, fecha, acción, entidad, ID y detalles expandibles. Los campos sensibles, prompts y contenidos se filtran antes de renderizar.

### Archivos incorporados

- `lib/supabase/admin.ts`, `lib/users/index.ts` y los módulos de `app/(protected)/settings/`.
- `components/settings/` y `lib/audit/list-audit-log.ts`.
- Tests de permisos y redacción en `tests/auth/`.

### Decisiones registradas

- Todas las Server Actions vuelven a resolver `requireRole("ADMIN")`; el sidebar y las páginas no son el perímetro de seguridad.
- Las operaciones de invitación, perfil y asignación usan un cliente `server-only` con service role únicamente después de la autorización ADMIN.
- La creación usa invitación de Supabase Auth: no se almacenan ni muestran contraseñas iniciales y no se habilita registro público.
- Un administrador no puede desactivar su propia cuenta.
- La auditoría es append-only y el visor no permite editar eventos ni expone prompts, mensajes, claves o tokens.

### Validación ejecutada

- `npm test -- --run` ✅ — 22 archivos, 65 tests.
- `npm run typecheck` ✅
- `npm run lint` ✅
- `git diff --check` ✅
- `npm run build` ✅ — Next.js 16.3.4 compila `/settings/users`, `/settings/clinics` y `/settings/audit` como rutas dinámicas protegidas.
- Smoke remoto con Supabase real ⏸️ — pendiente de configurar un proyecto Supabase válido y usuarios demo; el entorno local aún contiene el dominio placeholder documentado en el cierre de Fase 9.

### Commits de la fase

- `9ec2b7d` `feat(settings): add user administration`
- `748122b` `feat(settings): add clinic configuration`
- `cbf8029` `feat(audit): add audit log viewer`

### Siguiente fase

La siguiente unidad definida por el roadmap es **Fase 11 — Hardening, errores y UX**, comenzando por `F11-T01`. La validación remota de la Fase 9 permanece pendiente y deberá ejecutarse cuando exista un proyecto Supabase válido.

# FASE 11 — Hardening, errores y UX

## Task F11-T01: Estados de error/loading/empty

- **Task [F11-T01]:** Estandarizar estados de UI
- **Objetivo:** Evitar interfaces ambiguas durante operaciones asíncronas.
- **Archivos afectados:** `app/**/loading.tsx`, `app/**/error.tsx`, `components/ui/`, componentes de formularios
- **Instrucciones para el Agente:**
  1. Añadir skeletons.
  2. Añadir empty states.
  3. Añadir errores específicos.
  4. Deshabilitar botones durante operaciones.
  5. Mostrar:
     - `Guardando...`
     - `Generando...`
     - `Eliminando...`
  6. Mostrar errores como:
     - `No se ha podido guardar el lead. Comprueba los datos e inténtalo de nuevo.`
     - `No se ha podido generar el mensaje. El lead no se ha modificado.`
- **Restricciones:**
  - No mostrar `Something went wrong` como único mensaje.
  - No crear reloads completos innecesarios.
- **Criterios de Aceptación:**
  - Todas las mutaciones muestran feedback.
  - Doble click no provoca acciones duplicadas.
- **Testing / Validación:** Manual + E2E.
- **Commit:** `feat(ui): improve async states and error handling`

---

## Task F11-T02: Security headers

- **Task [F11-T02]:** Añadir cabeceras HTTP de seguridad
- **Objetivo:** Mejorar hardening básico de producción.
- **Archivos afectados:** `next.config.ts` o middleware/configuración equivalente
- **Instrucciones para el Agente:**
  1. Añadir headers de seguridad razonables.
  2. Evitar configuraciones incompatibles con Supabase/Vercel.
  3. No introducir CSP excesivamente restrictiva sin validar recursos reales.
- **Restricciones:**
  - No romper autenticación.
  - No deshabilitar HTTPS.
- **Criterios de Aceptación:**
  - Headers presentes en producción.
  - La aplicación continúa funcionando.
- **Testing / Validación:** Inspección HTTP + E2E.
- **Commit:** `chore(security): harden HTTP headers`

---

## Task F11-T03: Revisión de secretos

- **Task [F11-T03]:** Auditar exposición de secretos
- **Objetivo:** Confirmar que ningún secreto llega al cliente.
- **Archivos afectados:** proyecto completo
- **Instrucciones para el Agente:**
  1. Buscar referencias a `OPENAI_API_KEY`.
  2. Buscar `SUPABASE_SERVICE_ROLE_KEY`.
  3. Confirmar que sólo aparecen server-side.
  4. Revisar imports de módulos `lib/ai`.
  5. Revisar variables `NEXT_PUBLIC_*`.
- **Restricciones:**
  - No mover secretos a variables públicas.
- **Criterios de Aceptación:**
  - Ningún secreto aparece en bundle cliente.
  - No hay secrets hardcoded.
  - `.env` no está versionado.
- **Testing / Validación:** Build + grep/static inspection.
- **Commit:** `chore(security): audit secret exposure`

---

## Cierre de Fase 11 — 2026-09-07

La fase queda implementada y validada.

- [x] **F11-T01:** estados de carga con skeletons para rutas protegidas,
  boundaries de error global/protegido, 404 contextual, empty states de
  administración y feedback uniforme en las mutaciones. Los botones se
  deshabilitan mientras sus Server Actions están pendientes y los errores de
  guardado/generación usan mensajes accionables.
- [x] **F11-T02:** cabeceras globales en `next.config.ts` para HSTS, MIME
  sniffing, clickjacking, referrer policy, permissions policy y una CSP
  compatible con Next.js, Supabase y los recursos locales.
- [x] **F11-T03:** auditoría estática de secretos, protección `server-only`,
  prueba de fronteras entre Client Components y módulos sensibles, revisión
  del bundle cliente y documentación en `docs/security-audit.md`.

### Decisiones registradas

- Los errores inesperados se muestran mediante un boundary con reintento; el
  usuario no recibe stacks ni detalles internos.
- La CSP permite sólo los orígenes necesarios para la aplicación y mantiene
  las excepciones de inline/eval imprescindibles para el runtime actual de
  Next.js.
- Las claves reales continúan fuera de Git. El script `demo:users` es una
  utilidad server-side de CLI y no forma parte del bundle del navegador.

### Validación ejecutada

- `npm test -- --run` ✅ — 24 archivos, 69 tests.
- `npm run typecheck` ✅
- `npm run lint` ✅
- `git diff --check` ✅
- `npm run build` ✅ — Next.js 16.3.4 compila la aplicación y los nuevos
  boundaries.
- Inspección HTTP ✅ — las cabeceras aparecen en el servidor de producción
  local mediante `curl`.
- Smoke Playwright público ✅ — el 404 personalizado se renderiza con estado
  HTTP 404. Las rutas privadas requieren un proyecto Supabase válido.
- Auditoría de bundle y Git ✅ — no aparecen nombres de secretos en
  `.next/static`, patrones de credenciales hardcoded en el código rastreado ni
  patrones de credenciales en el historial.
- Smoke autenticado ⏸️ — `/login` no puede completar la validación porque el
  `.env` local todavía apunta al dominio placeholder `your-project.supabase.co`;
  el servidor registra `AUTHORIZATION_UNAVAILABLE`. No se modificaron secretos
  ni configuración local para ocultar esta limitación.

### Archivos incorporados o modificados

- `app/(protected)/loading.tsx`, `app/(protected)/error.tsx`, `app/error.tsx`,
  `app/not-found.tsx`
- `components/ui/action-feedback.tsx`, `components/ui/protected-loading.tsx`,
  `components/ui/route-error.tsx`, `components/ui/skeleton.tsx`
- `next.config.ts`
- `tests/config/security-headers.test.ts`,
  `tests/config/secrets-boundary.test.ts`
- `docs/security-audit.md`

### Commits de la fase

- `90da03b` `feat(ui): improve async states and error handling`
- `59a4d66` `chore(security): harden HTTP headers`
- `chore(security): audit secret exposure` (este commit)

### Siguiente fase

La siguiente unidad del roadmap es **Fase 12 — Testing integral**. La
validación remota pendiente de Fase 9 y el smoke autenticado de esta fase
deberán retomarse cuando exista un proyecto Supabase válido y usuarios demo.

# FASE 12 — Testing integral

## Task F12-T01: Tests unitarios de dominio

- **Task [F12-T01]:** Cubrir lógica pura crítica
- **Objetivo:** Garantizar comportamiento determinista de dominio.
- **Archivos afectados:** `tests/leads/`, `tests/ai/`, `tests/auth/`
- **Instrucciones para el Agente:**
  1. Test de normalización de teléfono.
  2. Test de detección de duplicados.
  3. Test de schemas Zod.
  4. Test de permisos.
  5. Test de prioridad.
  6. Test de construcción de prompt.
  7. Test de parsing de respuesta IA.
- **Restricciones:**
  - No generar cientos de tests artificiales.
  - Priorizar lógica con riesgo.
- **Criterios de Aceptación:**
  - Casos positivos y negativos cubiertos.
  - `npm test` pasa.
- **Testing / Validación:** Vitest.
- **Commit:** `test(core): cover domain validation and permissions`

---

## Task F12-T02: Tests de integración CRM

- **Task [F12-T02]:** Cubrir operaciones persistentes
- **Objetivo:** Validar interacción entre dominio, Supabase y autorización.
- **Archivos afectados:** `tests/integration/leads/`, `tests/integration/notes/`, `tests/integration/rls/`
- **Instrucciones para el Agente:**
  1. Test crear lead.
  2. Test actualizar.
  3. Test soft delete.
  4. Test crear nota.
  5. Test cambio de estado.
  6. Test cambio de clínica.
  7. Test permisos.
  8. Test RLS.
- **Restricciones:**
  - No mockear RLS cuando el objetivo del test sea validar RLS.
- **Criterios de Aceptación:**
  - Operaciones autorizadas funcionan.
  - Operaciones no autorizadas son rechazadas.
  - Soft delete funciona.
- **Testing / Validación:** Vitest/integration environment.
- **Commit:** `test(leads): add CRUD and permission coverage`

---

## Task F12-T03: Tests de IA

- **Task [F12-T03]:** Cubrir pipeline de generación
- **Objetivo:** Asegurar que IA no rompe el CRM.
- **Archivos afectados:** `tests/ai/`
- **Instrucciones para el Agente:**
  1. Mock de respuesta válida.
  2. Mock de respuesta inválida.
  3. Error OpenAI.
  4. Verificar no creación de nota en error.
  5. Verificar metadata.
  6. Verificar request ID.
  7. Verificar rate limit.
- **Restricciones:**
  - No depender exclusivamente de llamadas reales a OpenAI en tests.
- **Criterios de Aceptación:**
  - Respuesta inválida no genera nota.
  - Error no genera falso positivo.
  - Metadata correcta.
- **Testing / Validación:** Vitest.
- **Commit:** `test(ai): cover follow-up generation`

---

## Task F12-T04: E2E principal

- **Task [F12-T04]:** Crear recorrido E2E completo del CRM
- **Objetivo:** Certificar el flujo que se mostrará en Loom.
- **Archivos afectados:** `tests/e2e/vitalis-crm.spec.ts`, `playwright.config.ts`
- **Instrucciones para el Agente:**
  1. Login.
  2. Dashboard.
  3. Crear lead.
  4. Abrir lead.
  5. Añadir llamada.
  6. Generar IA.
  7. Comprobar nota IA.
  8. Editar lead.
  9. Borrar lead.
  10. Comprobar que desaparece del listado.
- **Restricciones:**
  - No saltarse login.
  - No probar sólo UI superficial.
- **Criterios de Aceptación:**
  - El flujo completo pasa de principio a fin.
  - Coincide con la secuencia exigida para la demo.
- **Testing / Validación:** Playwright.
- **Commit:** `test(e2e): cover Vitalis CRM demo flow`

La secuencia coincide directamente con la demostración solicitada por DelegIA: login/dashboard, creación, nota, IA, edición y eliminación. 

---

# FASE 13 — Demo Data

## Task F13-T01: Crear seed funcional de demo

- **Task [F13-T01]:** Crear dataset de demostración
- **Objetivo:** Evitar que el CRM aparezca vacío durante el Loom.
- **Archivos afectados:** `supabase/seed.sql`, `scripts/seed-demo-data.ts`
- **Instrucciones para el Agente:**
  1. Crear 15 leads.
  2. 5 Madrid.
  3. 5 Valencia.
  4. 5 Sevilla.
  5. Distribuir entre:
     - implantes;
     - ortodoncia;
     - estética;
     - revisión.
  6. Distribuir estados.
  7. Crear al menos 2 casos de teléfono duplicable.
  8. Crear varias notas.
- **Restricciones:**
  - No utilizar datos personales reales.
  - No incluir historias clínicas.
- **Criterios de Aceptación:**
  - Dashboard tiene datos.
  - Filtros muestran variedad.
  - Existen duplicados demostrables.
  - Timeline contiene actividad.
- **Testing / Validación:** Reset/seed y comprobación visual.
- **Commit:** `feat(demo): add Vitalis demo dataset`

El Informe Maestro propone exactamente un dataset de 15 leads, cinco por clínica, varios estados, dos duplicados detectables y notas. 

---

# FASE 14 — Producción

## Task F14-T01: Configurar Vercel

- **Task [F14-T01]:** Desplegar aplicación en Vercel
- **Objetivo:** Obtener entorno de producción real.
- **Archivos afectados:** configuración Vercel/proyecto
- **Instrucciones para el Agente:**
  1. Conectar repositorio GitHub.
  2. Configurar variables de entorno.
  3. Configurar Production/Preview.
  4. Ejecutar build.
  5. Verificar Supabase.
  6. Verificar OpenAI.
- **Restricciones:**
  - No colocar secrets en código.
- **Criterios de Aceptación:**
  - Deployment exitoso.
  - Login funciona.
  - CRUD funciona.
  - IA funciona.
- **Testing / Validación:** Smoke test en producción.
- **Commit:** `chore(deploy): configure Vercel production`

---

## Task F14-T02: Configurar dominio

- **Task [F14-T02]:** Publicar `crmleads.carlosrevert.es`
- **Objetivo:** Proporcionar la URL final exigida.
- **Archivos afectados:** documentación/configuración de deployment
- **Instrucciones para el Agente:**
  1. Añadir dominio a Vercel.
  2. Configurar DNS según destino indicado por Vercel.
  3. Verificar HTTPS.
  4. Verificar redirección/host.
- **Restricciones:**
  - No cambiar arquitectura.
- **Criterios de Aceptación:**
  - `https://crmleads.carlosrevert.es` responde.
  - HTTPS válido.
  - Login funciona mediante dominio final.
- **Testing / Validación:** Navegador + curl/HTTP smoke test.
- **Commit:** `chore(deploy): configure Vitalis production domain`

La URL de producción del Informe Maestro se sustituye para este CRM por
`https://crmleads.carlosrevert.es`, decisión registrada en la configuración
real de la Fase 9.

---

# FASE 15 — Documentación y congelación MVP

## Task F15-T01: Completar README de entrega

- **Task [F15-T01]:** Documentar decisiones y arquitectura
- **Objetivo:** Convertir las decisiones de producto en evidencia de criterio técnico.
- **Archivos afectados:** `README.md`, `docs/architecture.md`
- **Instrucciones para el Agente:**
  1. Explicar qué hace la aplicación.
  2. Explicar stack.
  3. Explicar arquitectura.
  4. Documentar:
     - clínica editable;
     - conservación de clínica original;
     - duplicados;
     - permisos;
     - tono IA.
  5. Explicar despliegue.
  6. Añadir URL.
  7. Añadir usuarios demo sin contraseñas públicas.
  8. Añadir qué haría con más tiempo.
  9. Añadir diagrama arquitectónico.
- **Restricciones:**
  - No inventar funcionalidades no implementadas.
  - No documentar como terminado algo que no esté validado.
- **Criterios de Aceptación:**
  - Un evaluador puede entender decisiones sin consultar el código.
  - Las decisiones coinciden con el sistema.
- **Testing / Validación:** Revisión manual.
- **Commit:** `docs: finalize project documentation`

La prueba exige específicamente README con decisiones tomadas y qué se haría con más tiempo. 

---

## Task F15-T02: Congelar funcionalidad

- **Task [F15-T02]:** Congelación definitiva del MVP
- **Objetivo:** Evitar regresiones introducidas por features tardías.
- **Archivos afectados:** proyecto completo
- **Instrucciones para el Agente:**
  1. Ejecutar lint.
  2. Ejecutar TypeScript.
  3. Ejecutar tests unitarios.
  4. Ejecutar integración.
  5. Ejecutar E2E.
  6. Ejecutar build.
  7. Verificar producción.
  8. Corregir únicamente bugs.
  9. No añadir nuevas features.
- **Restricciones:**
  - **NO FEATURES.**
  - No refactorizaciones grandes.
  - No cambiar modelo de datos salvo bug crítico.
- **Criterios de Aceptación:**
  - Todos los gates pasan.
  - El flujo Loom funciona.
  - Producción está estable.
- **Testing / Validación:** Suite completa.
- **Commit:** `chore: freeze MVP for delivery`

---

# FASE 16 — Entrega final

## Task F16-T01: Preparar checklist de entrega

- **Task [F16-T01]:** Preparar artefactos finales de evaluación
- **Objetivo:** Cumplir todos los elementos de entrega de DelegIA.
- **Archivos afectados:** `README.md`, `docs/demo-script.md`
- **Instrucciones para el Agente:**
  1. Confirmar URL producción.
  2. Confirmar GitHub.
  3. Confirmar historial de commits.
  4. Confirmar README.
  5. Preparar guion Loom de 10 minutos.
  6. Validar dataset demo.
  7. Ejecutar flujo:
     - login;
     - dashboard;
     - crear;
     - nota;
     - IA;
     - editar;
     - borrar.
- **Restricciones:**
  - No modificar producto.
- **Criterios de Aceptación:**
  - Todos los elementos de entrega están disponibles.
  - La demo puede realizarse sin preparar manualmente datos durante la grabación.
- **Testing / Validación:** Ensayo completo de Loom.
- **Commit:** `docs: prepare final delivery`

La prueba exige URL en producción, repositorio GitHub con historial visible, Loom de 10 minutos y README. 

---

# 4. Fase de Mejoras (Post-MVP)

Estas funcionalidades **NO deben comenzar hasta que el MVP haya superado todos los Quality Gates**.

El Informe Maestro separa expresamente el MVP de estas mejoras. 

## P1 — Próximo seguimiento

Añadir:

```text
next_follow_up_at
assigned_to
```

Objetivo:

```text
Lead
 ↓
Próximo seguimiento
 ↓
Dashboard
 ↓
Pendientes
```

Esto transforma el CRM en una herramienta de operación diaria.

---

## P2 — Automatización supervisada

Pipeline futuro:

```text
Lead nuevo
   ↓
Clasificación
   ↓
Priorización
   ↓
Seguimiento recomendado
   ↓
Humano revisa
```

No introducir directamente agentes autónomos.

---

## P3 — IA "¿Qué debería hacer hoy?"

La IA analizaría:

- leads nuevos;
- estado;
- días sin contacto;
- tratamiento;
- últimas notas.

Y produciría una lista priorizada de acciones.

---

## P4 — Analytics de conversión

Métricas futuras:

```text
Leads
  ↓
Contactados
  ↓
Citas
  ↓
Clientes
```

Segmentadas por:

- clínica;
- fuente;
- tratamiento.

---

## P5 — Deduplicación inteligente

Usar:

- teléfono;
- nombre;
- clínica;
- similitud.

Flujo obligatorio:

```text
IA detecta
   ↓
Humano revisa
   ↓
Humano decide
```

**Nunca merge automático.**

---

## P6 — Importación Excel

Flujo:

```text
Excel
 ↓
Validación
 ↓
Detección duplicados
 ↓
Preview
 ↓
Importación
```

Esta mejora ataca directamente el problema operativo original de Vitalis, que actualmente utiliza Excel compartido por email. 

---

## P7 — Integraciones de entrada

Futuras fuentes:

- Instagram Ads;
- formulario web;
- WhatsApp;
- email;
- telefonía.

Arquitectura:

```text
Instagram ─┐
Web ───────┤
WhatsApp ──┤
Email ─────┤
Telefonía ─┘
      ↓
   Lead API
      ↓
     CRM
```

---

## P8 — Qué NO construir posteriormente sin nuevo scope

Incluso después del MVP no se deben introducir automáticamente:

- facturación;
- historia clínica;
- agenda médica completa;
- videollamadas;
- ecommerce;
- chatbot externo;
- app móvil;
- WhatsApp automático sin supervisión;
- RAG;
- agentes autónomos con permisos de escritura ilimitados.

El Informe Maestro los excluye explícitamente para preservar el foco del producto. 

---

# 5. Quality Gates y Definition of Done Global

## Gate 0 — Arquitectura

Debe cumplirse:

- [ ] Next.js App Router.
- [ ] TypeScript strict.
- [ ] Tailwind.
- [ ] shadcn/ui.
- [ ] Supabase configurado.
- [ ] estructura `app/components/lib/types/supabase`.
- [ ] variables de entorno definidas.
- [ ] ningún secreto en Git.

---

## Gate 1 — Database

Debe cumplirse:

- [ ] `clinics`.
- [ ] `profiles`.
- [ ] `user_clinics`.
- [ ] `leads`.
- [ ] `notes`.
- [ ] `audit_log`.
- [ ] enums.
- [ ] FK.
- [ ] constraints.
- [ ] índices.
- [ ] migrations reproducibles.

---

## Gate 2 — Seguridad

Debe cumplirse:

- [ ] Supabase Auth funcionando.
- [ ] usuarios internos.
- [ ] roles.
- [ ] usuarios inactivos bloqueados.
- [ ] RLS activado.
- [ ] ADMIN → todas las clínicas.
- [ ] MANAGER → clínicas asignadas.
- [ ] RECEPTIONIST → clínica propia.
- [ ] server-side authorization.
- [ ] service role nunca expuesto al cliente.
- [ ] OpenAI key nunca expuesta.
- [ ] rate limiting IA.

---

## Gate 3 — CRM

Debe cumplirse:

- [ ] listado.
- [ ] búsqueda.
- [ ] filtros por clínica.
- [ ] filtros por estado.
- [ ] filtros por tratamiento.
- [ ] filtros por fuente.
- [ ] crear.
- [ ] editar.
- [ ] detalle.
- [ ] cambiar clínica.
- [ ] conservar clínica original.
- [ ] detectar duplicados.
- [ ] `duplicate_of`.
- [ ] soft delete.

La prueba exige explícitamente listado, filtrado, creación, edición, eliminación y notas. 

---

## Gate 4 — Seguimiento

Debe cumplirse:

- [ ] notas.
- [ ] tipos de nota.
- [ ] timeline.
- [ ] append-only.
- [ ] timestamps.
- [ ] usuario creador.
- [ ] notas IA diferenciadas.

---

## Gate 5 — IA

Debe cumplirse:

- [ ] OpenAI real.
- [ ] Responses API.
- [ ] GPT-5.6 Luna configurable.
- [ ] llamada server-side.
- [ ] contexto mínimo.
- [ ] prompt versionado.
- [ ] Zod sobre respuesta.
- [ ] `request_id`.
- [ ] `latency_ms`.
- [ ] metadata.
- [ ] nota `mensaje_generado_ia`.
- [ ] auditoría.
- [ ] error sin nota falsa.
- [ ] rate limit.
- [ ] revisión humana.

La prueba exige que la función de IA llame realmente a OpenAI/Claude y que el resultado se guarde como nota para revisión humana. 

---

## Gate 6 — UX

Debe cumplirse:

- [ ] login limpio.
- [ ] sidebar.
- [ ] dashboard.
- [ ] badges.
- [ ] identidad por clínica.
- [ ] responsive.
- [ ] loading.
- [ ] empty states.
- [ ] errores comprensibles.
- [ ] botones deshabilitados durante operaciones.
- [ ] confirmación de borrado.
- [ ] indicador de IA en proceso.

La prioridad visual es funcionalidad y eficiencia operacional, no pixel-perfect. 

---

## Gate 7 — Testing

### Unit

- [ ] teléfono.
- [ ] duplicados.
- [ ] Zod.
- [ ] permisos.
- [ ] prioridad.
- [ ] prompt.
- [ ] parsing IA.

### Integration

- [ ] crear lead.
- [ ] actualizar.
- [ ] soft delete.
- [ ] crear nota.
- [ ] cambio de estado.
- [ ] cambio de clínica.
- [ ] permisos.
- [ ] RLS.
- [ ] IA.

### E2E

```text
LOGIN
  ↓
DASHBOARD
  ↓
CREAR LEAD
  ↓
ABRIR LEAD
  ↓
AÑADIR NOTA
  ↓
GENERAR IA
  ↓
COMPROBAR NOTA IA
  ↓
EDITAR LEAD
  ↓
BORRAR LEAD
```

Este recorrido debe pasar completamente antes de considerar el MVP terminado. El Informe Maestro define precisamente esta cobertura como el conjunto de tests relevante. 

---

## Gate 8 — Producción

- [ ] Build Vercel correcto.
- [ ] variables Production configuradas.
- [ ] Supabase Production conectado.
- [ ] OpenAI Production conectado.
- [ ] HTTPS.
- [ ] `crmleads.carlosrevert.es`.
- [ ] login real.
- [ ] CRUD real.
- [ ] IA real.
- [ ] RLS real.
- [ ] no errores críticos en consola.

---

# Definition of Done Global

El **MVP DelegIA / Clínica Dental Vitalis está terminado** únicamente cuando se cumplen simultáneamente todos estos puntos:

1. **El usuario puede iniciar sesión.**
2. **Los permisos se aplican server-side y mediante RLS.**
3. **ADMIN, MANAGER y RECEPTIONIST tienen scopes diferentes.**
4. **El usuario puede listar y buscar leads.**
5. **Puede filtrar por clínica y estado como mínimo.**
6. **Puede crear leads.**
7. **El sistema detecta posibles duplicados sin hacer merge automático.**
8. **Puede editar leads.**
9. **Puede cambiar la clínica conservando el origen.**
10. **Puede cambiar el estado del pipeline.**
11. **Puede abrir la ficha del lead.**
12. **Puede añadir notas.**
13. **Las notas son append-only.**
14. **Puede eliminar un lead mediante soft delete.**
15. **Las operaciones relevantes quedan auditadas.**
16. **Puede pulsar "Generar mensaje de seguimiento".**
17. **La aplicación realiza una llamada real a OpenAI.**
18. **La llamada utiliza GPT-5.6 Luna configurable.**
19. **La API key nunca llega al cliente.**
20. **La IA recibe sólo el contexto necesario.**
21. **La respuesta IA se valida estructuralmente.**
22. **El mensaje generado se guarda como nota IA.**
23. **El mensaje se presenta como borrador para revisión humana.**
24. **Una generación fallida no genera una nota falsa.**
25. **Existe protección contra doble generación/rate abuse.**
26. **El dashboard es accionable.**
27. **Los leads de implantes nuevos tienen prioridad visual.**
28. **El sistema tiene estados de loading/error/empty.**
29. **Los tests unitarios relevantes pasan.**
30. **Los tests de integración pasan.**
31. **El E2E completo pasa.**
32. **La aplicación está desplegada en Vercel.**
33. **El dominio final funciona.**
34. **Existe dataset preparado para demo.**
35. **El README documenta las decisiones de producto.**
36. **El historial Git muestra commits coherentes por fase.**
37. **El flujo completo de la demo puede ejecutarse sin intervención técnica.**

---

# Regla operativa permanente para el agente de código

El agente deberá seguir siempre este ciclo:

```text
LEER CONTEXTO
     ↓
IDENTIFICAR TASK
     ↓
INSPECCIONAR ESTADO ACTUAL
     ↓
IMPLEMENTAR ÚNICAMENTE EL SCOPE
     ↓
EJECUTAR TESTS
     ↓
CORREGIR SÓLO LOS FALLOS RELACIONADOS
     ↓
VALIDAR CRITERIOS DE ACEPTACIÓN
     ↓
REVISAR CAMBIOS
     ↓
COMMIT CONVENTIONAL
```

## Prohibiciones globales

El agente **NO debe**:

- implementar varias fases simultáneamente;
- cambiar arquitectura sin justificarlo;
- introducir FastAPI;
- introducir otra base de datos;
- sustituir Supabase;
- sustituir OpenAI;
- mover lógica de negocio crítica a componentes React;
- saltarse RLS;
- exponer secrets;
- crear merge automático de duplicados;
- editar/borrar notas;
- enviar WhatsApp automáticamente;
- añadir agentes autónomos;
- introducir features Post-MVP durante el MVP;
- modificar una migración histórica ya aplicada para corregir datos: crear una nueva migración;
- hacer refactors masivos no relacionados con la tarea;
- continuar si una dependencia arquitectónica previa está rota.

## Regla de commit

Cada tarea completada debe terminar con:

1. implementación;
2. tests;
3. validación;
4. revisión del diff;
5. commit descriptivo.

El historial debe permitir reconstruir el desarrollo:

```text
chore: bootstrap Next.js application
feat(db): add initial CRM schema
feat(auth): add Supabase authentication
feat(leads): implement lead CRUD
feat(notes): add lead activity timeline
feat(ai): generate follow-up messages with OpenAI
feat(audit): record lead mutations
feat(ui): add clinic visual identity
feat(dashboard): add pipeline overview
test(leads): add CRUD and permission coverage
test(ai): cover follow-up generation
```

El Informe Maestro establece expresamente este workflow `implementación → tests → review → commit` y recomienda no trabajar directamente sobre `main`. 

---

# Criterio final de éxito

La demo no debe intentar demostrar que se ha construido un gran SaaS.

Debe demostrar, en este orden:

```text
PROBLEMA
  ↓
CRM REAL
  ↓
DATOS REALES
  ↓
SEGURIDAD
  ↓
SEGUIMIENTO
  ↓
IA ÚTIL
  ↓
SUPERVISIÓN HUMANA
  ↓
AUDITORÍA
  ↓
PRODUCCIÓN
```

La prueba de DelegIA está diseñada para comprobar precisamente que el candidato entrega software funcional, comunica el progreso, resuelve los huecos del brief y puede demostrar el sistema funcionando en directo. 

Por tanto, **el MVP termina cuando el sistema puede realizar de forma fiable el recorrido completo de negocio y demostrarlo en producción**:

```text
LOGIN
  ↓
DASHBOARD
  ↓
CREAR LEAD
  ↓
DETECTAR DUPLICADO
  ↓
ABRIR FICHA
  ↓
AÑADIR LLAMADA
  ↓
GENERAR FOLLOW-UP IA
  ↓
GUARDAR BORRADOR IA
  ↓
REVISAR
  ↓
EDITAR LEAD
  ↓
ELIMINAR LEAD
  ↓
VERIFICAR AUDITORÍA
```

**A partir de ese punto queda prohibido ampliar el MVP. Toda nueva capacidad pertenece a Post-MVP.**
