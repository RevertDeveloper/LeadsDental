# Roadmap intermedio — Clínica Dental Vitalis

Este documento reúne los pasos operativos que quedaron fuera del código y deja
registrado el camino seguido hasta la Fase 13 del `roadmap.md`.

El orden es importante:

```text
Preparar secretos y Supabase
        ↓
Validar RLS y E2E de la Fase 12
        ↓
Fase 13 — Datos demo ✅
        ↓
Fase 14 — Vercel y dominio
        ↓
Fase 15 — Documentación y congelación
        ↓
Fase 16 — Entrega final
```

No marques una tarea como terminada sólo porque el código exista. Cada bloque
incluye el resultado que debes comprobar.

---

## 0. Estado actual y reglas de seguridad

La implementación local de la Fase 12 ya está hecha:

- Vitest: 78 tests correctos.
- TypeScript, ESLint y build de Next.js correctos.
- Tests de integración CRUD preparados.
- Test RLS preparado para ejecutar SQL real contra Supabase.
- Recorrido E2E completo preparado con Playwright.

La Fase 12 sigue abierta porque todavía no se ha ejecutado contra un proyecto
Supabase real.

Antes de empezar:

- Nunca pegues secretos en GitHub, README, capturas, Loom o este documento.
- No edites `.env.example` con valores reales.
- Usa el `.env` local ignorado por Git, porque el script actual
  `npm run demo:users` carga explícitamente ese archivo.
- Comprueba siempre `git status` antes de hacer commit.
- No subas `.env`, `.env.local`, contraseñas ni `test-results/`.
- La nota privada `supabase/supabase.com.md` también debe permanecer ignorada.
  Si contiene claves, no la abras, adjuntes ni copies a documentación. Verifica
  antes del primer push que `git check-ignore -v supabase/supabase.com.md`
  muestra una regla de `.gitignore`.

### Atención: clave OpenAI local

La revisión anterior detectó una variable `OPENAI_API_KEY` con formato de
clave real en el `.env` local. Si esa clave es válida, revócala desde el panel
de OpenAI y crea otra. Aunque `.env` esté ignorado y no aparezca en Git, una
clave expuesta en un editor, log o captura debe considerarse comprometida.

Después de rotarla, actualiza únicamente el `.env` local y no imprimas su
valor en la terminal.

---

## 1. Crear y preparar Supabase

### Qué hay que hacer

Crear el proyecto PostgreSQL/Auth real que utilizará el CRM y aplicar el
esquema, las políticas RLS y las clínicas estructurales.

### Cómo hacerlo

1. Entra en <https://supabase.com/dashboard> y crea un proyecto nuevo.
2. Guarda en un lugar seguro:
   - nombre del proyecto;
   - región;
   - contraseña de PostgreSQL;
   - Project URL;
   - anon/public key;
   - service role key.
3. En `Project Settings → API`, copia la URL y la anon key.
4. En `Project Settings → Database`, copia la cadena de conexión directa de
   PostgreSQL. Sustituye la contraseña y codifica caracteres especiales si los
   contiene. Esa será `SUPABASE_DB_URL`. Los corchetes que aparecen en
   `[YOUR-PASSWORD]` son sólo un marcador visual: elimínalos al sustituir la
   contraseña. Si la contraseña contiene símbolos reservados para una URL,
   aplícales percent-encoding. Puedes añadir `?sslmode=require` al final de la
   URL.
5. En el `.env` local, sustituye sólo los placeholders:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   OPENAI_API_KEY=<openai-key-rotated>
   OPENAI_MODEL=gpt-5.6-luna
   DEMO_USER_PASSWORD=<contraseña-local-de-12-o-más-caracteres>
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   SUPABASE_DB_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
   ```

   No copies esos valores a `.env.example`.

6. Configura `DEMO_USER_PASSWORD`; no se configura en el dashboard de
   Supabase ni en Vercel. Es una variable local que el provisionador usa para
   establecer la contraseña de los tres usuarios demo. En la terminal
   integrada de VS Code, genera una contraseña sin caracteres problemáticos
   para un archivo dotenv:

   ```bash
   openssl rand -hex 24
   ```

   Copia el resultado **una sola vez** en tu `.env`, sin comillas:

   ```dotenv
   DEMO_USER_PASSWORD=<resultado-de-openssl>
   ```

   Debe tener al menos 12 caracteres. Consérvala en un gestor de contraseñas.
   Cada vez que ejecutes `npm run demo:users`, el script asignará ese valor a
   las tres cuentas demo existentes; por eso no lo cambies salvo que quieras
   rotar sus contraseñas.

7. Aplica el esquema mediante la CLI de Supabase desde la terminal integrada
   de VS Code, situada en la raíz del repositorio. Esta es la vía recomendada:
   conecta el directorio local con el proyecto remoto y registra qué
   migraciones se han aplicado. GitHub **no** es necesario para ello, y el
   enlace no publica nada en GitHub.

   ```bash
   npx supabase@latest init
   npx supabase@latest login
   npx supabase@latest link --project-ref <project-ref>
   npx supabase@latest db push --dry-run
   npx supabase@latest db push
   ```

   - `init` crea `supabase/config.toml`; revísalo y versiónalo, pues no debe
     contener secretos.
   - `login` abre el flujo de autenticación o solicita un personal access
     token. El token queda en el almacén de credenciales local, nunca en el
     repositorio.
   - `link` pide la contraseña de PostgreSQL de forma interactiva. No la
     pegues en el comando ni la añadas a `config.toml`.
   - Comprueba la salida de `--dry-run`: debe listar, en este orden, las tres
     migraciones de `supabase/migrations/`. Sólo entonces ejecuta el `db push`
     sin `--dry-run`.

   Tras el `db push`, abre `SQL Editor` en Supabase y ejecuta **sólo** el
   contenido de `supabase/seed.sql`. Es idempotente y crea las tres clínicas
   estructurales. El SQL Editor no está conectado automáticamente al
   repositorio: debes abrir el archivo local, copiar su contenido, pegarlo en
   una consulta nueva y pulsar `Run`.

   A partir de este punto, no uses SQL Editor ni Table Editor para cambios de
   esquema o RLS. Crea una migración local, haz commit y aplícala con
   `supabase db push`; así no se rompe el historial de migraciones remoto.
   El SQL Editor queda reservado para el seed actual, diagnósticos y pruebas
   puntuales.

   Si ya hubieras ejecutado una migración directamente en SQL Editor, detente
   antes de usar `db push`: el historial remoto no la conocerá y habría que
   crear una línea base o reparar ese historial. En este proyecto nuevo, la
   solución segura es no ejecutar las migraciones por SQL Editor y seguir el
   flujo anterior desde el principio.

8. En `Authentication → Providers`, confirma que el proveedor Email está
   habilitado. Los usuarios demo se crean con email confirmado por el script,
   por lo que no necesitas crear cuentas manualmente.

### Resultado esperado

- El proyecto Supabase responde.
- Existen las tablas `clinics`, `profiles`, `user_clinics`, `leads`, `notes` y
  `audit_log`.
- Existen las funciones RLS y `persist_ai_followup`.
- Existen las clínicas Madrid, Valencia y Sevilla.
- La CLI muestra las tres migraciones como aplicadas; una segunda ejecución de
  `npx supabase@latest db push --dry-run` no propone ninguna.
- Las variables locales dejan de contener `your-project.supabase.co` o
  placeholders equivalentes.

### Comprobación rápida

```bash
npm run typecheck
npm test -- --run tests/config/env.test.ts tests/database/schema.test.ts
```

No muestres el contenido del `.env` para hacer esta comprobación.

---

## 2. Crear los usuarios demo

### Qué hay que hacer

Crear los tres usuarios que necesita la validación y asignarles sus clínicas.
El script ya está implementado en `scripts/seed-demo-users.ts`.

### Cómo hacerlo

1. Define en `.env` una contraseña local de al menos 12 caracteres mediante
   `DEMO_USER_PASSWORD`, tal como se indica en la sección 1. No hace falta
   crear usuarios en Authentication ni configurar esa variable en Supabase.
2. Ejecuta:

   ```bash
   npm run demo:users
   ```

3. El script crea o actualiza estas cuentas:

   | Cuenta | Rol | Clínicas |
   |---|---|---|
   | `admin@vitalis.demo` | `ADMIN` | Madrid, Valencia y Sevilla |
   | `manager@vitalis.demo` | `CLINIC_MANAGER` | Madrid y Valencia |
   | `recepcion@vitalis.demo` | `RECEPTIONIST` | Madrid |

4. Guarda la contraseña sólo en tu gestor de contraseñas o entorno local. No
   la escribas en el repositorio.

### Resultado esperado

El comando termina con `Provisionamiento demo completado` y cada usuario puede
autenticarse con la contraseña local.

Si falla:

- `Faltan clínicas estructurales`: vuelve a ejecutar `supabase/seed.sql`.
- Error de variables: revisa que la URL y `SUPABASE_SERVICE_ROLE_KEY` sean
  reales, sin imprimirlas.
- Error de permisos: verifica que la service role key corresponda al mismo
  proyecto que `NEXT_PUBLIC_SUPABASE_URL`.

---

## 3. Cerrar los gates externos de la Fase 12

### 3.1 Validar RLS real

Este paso no debe simularse con Vitest. Ejecuta el SQL real contra Supabase:

```bash
psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.sql
```

El comando anterior presupone que `SUPABASE_DB_URL` ya está exportada en la
sesión y que el cliente `psql` está instalado. El archivo `.env` no se carga
automáticamente por Bash. Para ejecutar el test de Vitest, instala una vez el
cliente PostgreSQL si no lo tienes y deja que Node cargue `.env` de forma
segura:

```bash
# Ubuntu/Debian, sólo si `command -v psql` no devuelve una ruta
sudo apt update
sudo apt install -y postgresql-client

node --env-file=.env node_modules/vitest/vitest.mjs run --run \
  tests/integration/rls/rls.test.ts
```

No uses `SUPABASE_DB_URL="$SUPABASE_DB_URL"` para cargar `.env`: esa expresión
sólo copia una variable de shell ya existente, y si está vacía el test se
omite. Tampoco dupliques la barra de continuación; en Bash es una sola `\` al
final de la línea.

Si tu red no permite la conexión directa de PostgreSQL o prefieres evitar
configurar `psql`, abre `SQL Editor`, pega el contenido completo de
`supabase/tests/rls.sql` y pulsa `Run`. Este test contiene `BEGIN` y
`ROLLBACK`, por lo que sus usuarios y datos temporales no permanecen en el
proyecto al terminar. No ejecutes fragmentos sueltos.

Si aparece `password authentication failed for user "postgres"`, no es un
fallo de RLS: revisa que `SUPABASE_DB_URL` use la contraseña actual, sin los
corchetes del placeholder y con los símbolos percent-encoded. Si no estás
seguro de la contraseña o la has expuesto en una salida, rótala en
`Database → Settings` de Supabase, actualiza sólo el `.env` local y espera a
que el cambio se propague antes de repetir el test. Nunca pegues la URL
completa en una incidencia o mensaje.

El script crea datos temporales y hace `ROLLBACK` al terminar. Debe comprobar:

- ADMIN ve las tres clínicas.
- MANAGER ve sólo Madrid y Valencia.
- RECEPTIONIST ve sólo Madrid.
- Un lead soft-deleted deja de aparecer.
- No se permite borrar físicamente un lead.
- Las notas no se pueden modificar ni borrar.

También puedes ejecutar el test Vitest equivalente:

```bash
node --env-file=.env node_modules/vitest/vitest.mjs run --run \
  tests/integration/rls/rls.test.ts
```

El resultado correcto es `1 passed`, no `1 skipped`.

### 3.2 Validar el E2E completo

El E2E usa navegador y recorre el flujo de la demo. Debe ejecutarse con una
sesión real y con OpenAI disponible; no cambies el test para ocultar errores.

La primera vez que ejecutes Playwright en una máquina, instala el navegador
Chromium que utiliza el runner:

```bash
npx playwright install chromium
```

Si la instalación o el lanzamiento avisa de dependencias del sistema ausentes
en Ubuntu/Debian, repite con permisos de administrador:

```bash
npx playwright install --with-deps chromium
```

1. Comprueba que el `.env` tiene Supabase real y `OPENAI_API_KEY` válida.
2. Ejecuta Playwright con el usuario administrador:

   ```bash
   set -a
   . ./.env
   set +a
   E2E_EMAIL='admin@vitalis.demo' \
   E2E_PASSWORD="$DEMO_USER_PASSWORD" \
   E2E_AI_ENABLED=true \
   npm run test:e2e
   ```

3. Si ya tienes un servidor válido levantado, añade:

   ```bash
   set -a
   . ./.env
   set +a
   E2E_BASE_URL='http://127.0.0.1:3000' \
   E2E_EMAIL='admin@vitalis.demo' \
   E2E_PASSWORD="$DEMO_USER_PASSWORD" \
   E2E_AI_ENABLED=true \
   npm run test:e2e
   ```

4. El escenario debe completar, en este orden:
   - login;
   - dashboard;
   - creación de lead;
   - apertura de la ficha;
   - llamada en la timeline;
   - generación de IA;
   - nota generada por IA;
   - edición del lead;
   - eliminación y desaparición del listado.

### Resultado de cierre de Fase 12

Cuando RLS y E2E pasen:

1. Edita `Documentos_Iniciales/roadmap.md` y cambia Fase 12 a `[x]`.
2. Completa la sección de validación con la fecha y el resultado real.
3. Actualiza el estado equivalente en `README.md`.
4. Ejecuta:

   ```bash
   npm test -- --run
   npm run typecheck
   npm run lint
   npm run build
   git diff --check
   git status --short
   ```

5. Haz un commit separado para el cierre de validación, sin incluir secretos.

El resultado es una Fase 12 realmente cerrada, no sólo implementada en local.
