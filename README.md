# Clínica Dental Vitalis

CRM comercial interno para centralizar leads, seguimiento y operaciones de
Clínica Dental Vitalis. El desarrollo sigue el roadmap de
`Documentos_Iniciales/roadmap.md` por fases cerradas y validadas.

## Estado

MVP completado y publicado en producción. Las Fases 14, 15 y 16 están cerradas
con validación técnica, documentación de entrega y checklist de demo.

Producción: <https://crmleads.carlosrevert.es/login>

Repositorio: <https://github.com/RevertDeveloper/LeadsDental>

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

La configuración remota de Supabase, los usuarios demo y el dataset funcional
están preparados. Consulta
[`docs/production-deployment.md`](docs/production-deployment.md) para el
despliegue en Vercel, la configuración de ClouDNS, Supabase Auth y la
validación final.

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

## Funcionalidades principales

- CRM de leads con búsqueda, filtros y pipeline comercial.
- Scope por clínica para ADMIN, CLINIC_MANAGER y RECEPTIONIST.
- Detección de duplicados por teléfono sin merge automático.
- Clínica actual editable conservando la clínica original.
- Notas append-only y timeline de actividad.
- Soft delete y auditoría de operaciones relevantes.
- Dashboard operativo con priorización de implantes nuevos.
- Follow-up mediante OpenAI desde servidor, como borrador para revisión humana.

## Decisiones de producto

- La clínica puede cambiarse, pero se conserva `original_clinic_id`.
- Los duplicados requieren decisión humana; nunca se fusionan automáticamente.
- Las notas no se editan ni se borran.
- La IA no diagnostica, no inventa disponibilidad ni envía mensajes.
- Las claves sensibles nunca llegan al navegador.

## Entrega

- Producción: [`docs/production-deployment.md`](docs/production-deployment.md)
- Guion de demo: [`docs/demo-script.md`](docs/demo-script.md)
- Arquitectura: [`docs/architecture.md`](docs/architecture.md)
- Auditoría de seguridad: [`docs/security-audit.md`](docs/security-audit.md)

Con más tiempo, el siguiente trabajo sería post-MVP: próximos seguimientos,
analytics de conversión, importación Excel e integraciones de entrada. Estas
capacidades quedan fuera del MVP.

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
