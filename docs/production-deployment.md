# Despliegue de Vitalis en Vercel

Esta guía cubre el despliegue de `LeadsDental` en Vercel y la publicación de
`crmleads.carlosrevert.es`. El repositorio ya está conectado a GitHub y el
proyecto compila localmente. Las claves privadas deben introducirse sólo en
Vercel, nunca en GitHub ni en este documento.

## 1. Crear el proyecto Vercel

### Opción recomendada: panel web

1. Entra en <https://vercel.com/new>.
2. Importa `RevertDeveloper/LeadsDental`.
3. Selecciona la rama `main` como Production Branch.
4. Framework Preset: `Next.js`.
5. Root Directory: `./`.
6. Build Command: `npm run build`.
7. Install Command: `npm ci`.
8. No añadas una ruta `Output Directory`: Next.js la gestiona automáticamente.
9. Antes de desplegar, configura las variables de entorno de la sección 2.

### Opción CLI

Desde la raíz del repositorio:

```bash
npx vercel@latest login
npx vercel@latest link
npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel@latest env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel@latest env add SUPABASE_SERVICE_ROLE_KEY production
npx vercel@latest env add OPENAI_API_KEY production
npx vercel@latest env add OPENAI_MODEL production
npx vercel@latest env add NEXT_PUBLIC_APP_URL production
npx vercel@latest deploy --prod
```

La CLI solicita los valores de las variables de forma interactiva. No los
incluyas en comandos, capturas, logs ni commits. Para Preview conviene añadir
las mismas variables, excepto que `NEXT_PUBLIC_APP_URL` debe ser la URL de
Preview si se necesitan invitaciones desde ese entorno.

## 2. Variables de entorno

Configura estas variables en `Settings > Environment Variables` y marca
`Production`. Para una validación completa también puedes marcarlas en
`Preview`.

| Variable | Valor en producción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase real |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon/public key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key de Supabase, sólo server-side |
| `OPENAI_API_KEY` | API key de OpenAI, sólo server-side |
| `OPENAI_MODEL` | `gpt-5.6-luna` |
| `NEXT_PUBLIC_APP_URL` | `https://crmleads.carlosrevert.es` |

No configures `SUPABASE_DB_URL` en Vercel: sólo se utiliza para operaciones
locales de migración y pruebas SQL. Tampoco configures `DEMO_USER_PASSWORD`:
las cuentas demo ya se provisionan localmente y esa contraseña no debe formar
parte del entorno de producción.

Después de cambiar variables, crea un nuevo deployment. Los valores se
inyectan durante el build y en las funciones server-side; un deployment
anterior no se actualiza automáticamente.

## 3. Dominio en Vercel y ClouDNS

1. En Vercel abre `Project > Settings > Domains`.
2. Añade `crmleads.carlosrevert.es`.
3. Vercel mostrará el registro DNS exacto para ese proyecto.
4. En ClouDNS crea o corrige el registro del subdominio:
   - Type: `CNAME`
   - Host: `crmleads`
   - Target: el destino exacto mostrado por Vercel, normalmente
     `cname.vercel-dns.com`
   - TTL: automático o un valor bajo durante la propagación
5. Elimina registros A/AAAA/CNAME antiguos para `crmleads` que entren en
   conflicto.
6. Espera la propagación y pulsa `Refresh` en Vercel.

No sustituyas el destino indicado por Vercel por una IP inventada. Para un
subdominio, usa el CNAME que muestre el panel del proyecto.

Comprobaciones desde una terminal:

```bash
dig +short CNAME crmleads.carlosrevert.es
curl -I https://crmleads.carlosrevert.es
```

El resultado final debe ser HTTPS válido y una respuesta de la aplicación,
normalmente `200` en `/login`.

## 4. Configuración de Supabase Auth

En Supabase, abre `Authentication > URL Configuration` y configura:

- Site URL: `https://crmleads.carlosrevert.es`
- Redirect URLs:
  - `https://crmleads.carlosrevert.es/**`
  - `https://crmleads.carlosrevert.es`

La aplicación usa `NEXT_PUBLIC_APP_URL` para el enlace de invitación de
usuarios. Si esta configuración no coincide, las invitaciones pueden abrir el
host equivocado aunque el login normal funcione.

## 5. Validación posterior al deployment

Ejecuta las comprobaciones en este orden:

1. Abre `https://crmleads.carlosrevert.es/login` y confirma HTTPS.
2. Inicia sesión con un usuario demo.
3. Comprueba el dashboard y que aparecen los datos demo.
4. Filtra leads por clínica y estado.
5. Abre un lead y comprueba la timeline.
6. Añade una nota de llamada.
7. Genera un mensaje IA y confirma que aparece como borrador.
8. Edita un lead y cambia su estado.
9. Comprueba el soft delete desde el listado.
10. Como ADMIN, revisa la entrada correspondiente en auditoría.

No pruebes la API key desde el navegador ni la incluyas en una captura. La
llamada OpenAI debe observarse sólo por el resultado de la UI y los logs
privados de Vercel.

## 6. Problemas habituales

### El dominio no resuelve

Revisa que ClouDNS sea el proveedor DNS autoritativo y que no exista otro
registro para `crmleads`. Comprueba el CNAME con `dig` y espera la propagación.

### El login devuelve error de autorización

Comprueba `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y las URL
permitidas de Supabase Auth. Cambia las variables y redeploya.

### La invitación llega con un enlace local

Comprueba `NEXT_PUBLIC_APP_URL` en Production y crea un nuevo deployment.

### La IA falla

Comprueba `OPENAI_API_KEY`, `OPENAI_MODEL` y los logs server-side de Vercel. La
clave no debe tener prefijo `NEXT_PUBLIC_`.

### El build falla por variables

Vercel debe tener las tres variables públicas y las tres server-only antes del
build. El archivo `.env.example` sirve como contrato, pero no se carga en
Vercel.

## 7. Criterio de cierre de Fase 14

La fase sólo se marca como completada cuando el deployment de producción, el
login, el CRUD, la IA y `https://crmleads.carlosrevert.es` funcionan en una
prueba real. Hasta ese momento el código y esta guía están preparados, pero la
fase permanece abierta para no declarar producción sin evidencia.