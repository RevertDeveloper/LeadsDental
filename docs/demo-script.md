# Guion de demo de Vitalis

Duración objetivo: 8-10 minutos.

URL: <https://crmleads.carlosrevert.es/login>

## Antes de grabar

- Confirmar que el dominio responde por HTTPS.
- Tener preparado un usuario demo ADMIN y su contraseña fuera del vídeo.
- No mostrar variables de entorno, claves, logs privados ni contraseñas.
- Confirmar que el dashboard contiene datos demo.
- Tener identificado un teléfono duplicable de los leads demo.
- Tener disponible el panel de auditoría para el cierre.

## Recorrido

### 0:00-0:45 — Problema y acceso

Explicar que Vitalis sustituye el seguimiento disperso de leads por un CRM
interno con alcance por clínica, trazabilidad y seguimiento supervisado.

1. Abrir `/login`.
2. Iniciar sesión como ADMIN.
3. Señalar que no existe registro público y que el acceso es interno.

### 0:45-1:45 — Dashboard

1. Mostrar el total de leads, nuevos, citas e implantes.
2. Mostrar los leads recientes.
3. Señalar `Necesitan seguimiento`.
4. Explicar que la prioridad MVP es implantes con estado nuevo.

### 1:45-3:00 — Listado y alcance

1. Abrir `Leads`.
2. Mostrar búsqueda y filtros de clínica, estado, tratamiento y fuente.
3. Filtrar por `nuevo` e `implantes`.
4. Abrir un lead prioritario.
5. Explicar que RLS y autorización server-side limitan cada rol.

### 3:00-4:30 — Crear lead y duplicados

1. Crear un lead ficticio de demostración.
2. Usar un teléfono que ya exista para mostrar la advertencia de duplicado.
3. Explicar que el sistema avisa, pero nunca fusiona automáticamente.
4. Cancelar el alta si se quiere conservar limpio el dataset.

### 4:30-5:30 — Ficha y actividad

1. Abrir un lead existente.
2. Mostrar clínica actual, tratamiento, fuente y estado.
3. Añadir una nota de tipo `llamada`.
4. Mostrar la nota en la timeline.
5. Explicar que las notas son append-only.

### 5:30-6:45 — Pipeline e IA supervisada

1. Cambiar el estado del lead.
2. Pulsar `Generar mensaje de seguimiento`.
3. Mostrar el mensaje como borrador de WhatsApp.
4. Señalar que la IA recibe contexto comercial mínimo.
5. Recalcar que no existe envío automático.

### 6:45-7:45 — Edición y soft delete

1. Editar el lead.
2. Cambiar la clínica si el caso lo permite.
3. Explicar que se conserva la clínica original.
4. Ejecutar el borrado desde el diálogo de confirmación.
5. Comprobar que desaparece del listado.
6. Explicar que es soft delete y las notas no se eliminan.

### 7:45-8:45 — Administración y auditoría

1. Abrir `Settings > Audit` como ADMIN.
2. Mostrar eventos de creación, estado, nota, IA y borrado.
3. Abrir un detalle `old/new` sin mostrar datos sensibles.

### 8:45-10:00 — Cierre técnico

Resumir Next.js, Supabase Auth/PostgreSQL/RLS, autorización server-side,
OpenAI sólo server-side, auditoría, supervisión humana y Vercel.

Cerrar con:

- <https://crmleads.carlosrevert.es/login>
- <https://github.com/RevertDeveloper/LeadsDental>

## Datos demo

El dataset se prepara con:

```bash
npm run demo:data
```

El comando es idempotente y crea 15 leads, cinco por clínica, notas de
actividad y duplicados demostrables.

## No mostrar

- `.env`, `.env.local` o cualquier variable de entorno.
- API keys, service role keys, contraseñas o URLs PostgreSQL.
- Logs de Vercel con información sensible.
- Datos personales reales o historias clínicas.
