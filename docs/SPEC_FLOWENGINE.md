# 🧠 FlowEngine EdgeCore — Technical SPEC (Frontend + Panel Interno)

> ESTE DOCUMENTO ES LA VERDAD ABSOLUTA DEL PROYECTO.  
> Cualquier IA que ayude a programar DEBE leerlo y respetarlo.  
> NO cambiar el stack, NO cambiar la arquitectura base.

---

## 1. Objetivo del Sistema

FlowEngine EdgeCore es un **panel interno** para operar un SaaS de automatización
de mensajería Shopify → WhatsApp.

Este panel:

- Muestra y administra los **tenants** (tiendas Shopify conectadas).
- Permite ver el estado de salud de cada tienda.
- Se comunica con:
  - **Supabase** (PostgreSQL multi-tenant).
  - **Cloudflare Worker** (Edge Webhooks + OpenAPI).
  - Más adelante: Inngest, Cloud Run, etc. (no definido aquí todavía).

---

## 2. Stack Tecnológico (OBLIGATORIO)

No cambiar este stack salvo que el founder lo pida explícitamente.

- **Framework:** Next.js (App Router) con TypeScript.
- **UI:** TailwindCSS (modo oscuro por defecto).
- **DB & Auth Data:** Supabase (PostgreSQL).
- **Auth de usuarios:** Clerk (integración futura para panel).
- **Edge:** Cloudflare Workers (ya desplegado en  
  `https://dawn-haze-9df3.flowengine-edgecore.workers.dev`).
- **Infra panel:** Se puede desplegar en Vercel u otro, pero el código es
  Next.js + Supabase.

---

## 3. Convenciones de Proyecto (Frontend)

- Carpeta principal de app: `app/`
- Librerías compartidas: `lib/`
- Cliente Supabase SSR:
  - Archivo: `lib/supabase/server.ts`
  - Exporta SIEMPRE: `createAuthenticatedServerClient`
  - No duplicar clientes Supabase en otros archivos.
- Páginas:
  - Home: `app/page.tsx`
  - Listado de tenants/tiendas: `app/tiendas/page.tsx`
- Estilo:
  - Modo oscuro (`bg-black`, `text-white`).
  - Bordes sutiles: `border-neutral-800`.
  - Acentos:
    - Verde (`emerald`) para estado OK.
    - Rojo (`red`) para errores.
  - Tipografía Tailwind por defecto (Inter/Geist).

---

## 4. Variables de Entorno (Frontend / SSR)

Las variables que el código espera en `.env.local`:

- `SUPABASE_URL` → URL del proyecto Supabase.
- `SUPABASE_SERVICE_KEY` → Service Role Key de Supabase  
  (solo para este panel interno, NO exponer al frontend del cliente).
- Más adelante se agregarán:
  - `CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - etc. (todavía no definidas).

Reglas:

1. Nunca hardcodear valores de Supabase ni keys directamente en el código.
2. Siempre leer desde `process.env.*`.
3. Si se necesita otra variable, primero documentarla aquí.

---

## 5. Esquema mínimo en Supabase (Tabla de Tenants)

Nombre de la tabla principal en Supabase para la vista de `/tiendas`:

- Tabla: **`tenants`**  
  (si en algún momento el nombre real es otro, actualizar este documento y el código).

Campos mínimos esperados por el frontend:

- `tenant_id` — `uuid` — PRIMARY KEY.
- `clerk_user_id` — `text` — puede ser `null` por ahora.
- `shopify_shop_name` — `text` — nombre de la tienda Shopify.
- `shopify_token` — `text` — token de API (NO se muestra en el panel).
- `meta_token` — `text` o `null` — token de Meta (a futuro).
- `brand_dna` — `text` o `jsonb` — configuración de tono de marca.
- `is_wismo_active` — `boolean` — flujo WISMO activo.
- `is_abandono_active` — `boolean` — flujo de abandono activo.
- `health_status` — `text` — valores típicos: `"OK" | "ERROR" | "PAUSED"`.
- `created_at` — `timestamptz` — fecha de creación (default `now()`).

La página `/tiendas` actualmente consulta:

```sql
SELECT
  tenant_id,
  clerk_user_id,
  shopify_shop_name,
  health_status,
  created_at
FROM tenants
ORDER BY created_at DESC;
Si se cambia el nombre de la tabla o columnas, actualizar este SPEC y el código.

6. Páginas actuales de Next.js
6.1 Home /
Archivo: app/page.tsx

Objetivo:

Mostrar la marca: FlowEngine EdgeCore.

Mostrar estado general del sistema (texto estático por ahora).

Botones:

Gestionar Tiendas → navega a /tiendas.

Ver Edge Worker → link a
https://dawn-haze-9df3.flowengine-edgecore.workers.dev.

6.2 Listado de Tenants /tiendas
Archivo: app/tiendas/page.tsx

Usa export const dynamic = "force-dynamic"; para forzar SSR.

Obtiene un cliente de Supabase con:

createAuthenticatedServerClient (lib/supabase/server.ts).

Consulta la tabla tenants.

Renderiza una tabla con:

Shopify Store

Tenant ID

Clerk User

Status (badge verde si health_status === "OK", rojo en otros casos).

Si no hay filas, muestra “No hay tiendas registradas” y recomienda
hacer POST /api/onboard.

7. Cliente Supabase SSR (Reglas)
Archivo único autorizado para crear el cliente:

lib/supabase/server.ts

Requisitos:

Usar @supabase/ssr con createServerClient.

Usar cookies de next/headers para manejo de sesión.

No crear más clientes Supabase en otros archivos (importar siempre este).

Motivo:

Mantener un solo punto de configuración para:

RLS

Políticas de seguridad

Rotación de keys

Logging.

8. Cloudflare Worker (Contexto mínimo)
Servicio ya desplegado en:
https://dawn-haze-9df3.flowengine-edgecore.workers.dev

Actualmente sirve un Swagger UI para /openapi.json.

Más adelante:

Expondrá endpoints de webhooks Shopify.

Generará eventos para Inngest / cola de procesamiento.

Regla:

El panel de Next.js no re-implementa la lógica de webhooks.

Solo consume datos ya procesados por backend/Workers vía Supabase
(o APIs internas definidas después).

9. Lo que la IA NO debe hacer
Cualquier asistente (Cursor, Gemini, GPT, etc.) debe respetar estas reglas:

NO cambiar de framework
Nada de migrar a Remix, Astro, Nest completo, etc.

NO cambiar la base de datos principal
Siempre Supabase (PostgreSQL).

NO crear clientes Supabase duplicados
Usar siempre createAuthenticatedServerClient desde lib/supabase/server.ts.

NO mover archivos de app/ a pages/
El proyecto es App Router, no Pages Router.

NO tocar el Cloudflare Worker directamente desde este repo
El Worker vive en flowengine-worker, este repo es el panel.

Si se proponen cambios de arquitectura grande, deben ser validados por el founder
(Juan) y luego documentados aquí antes de implementarse.

10. Cómo deben trabajar las IAs con este proyecto
Siempre que una IA vaya a escribir código para este proyecto, la instrucción es:

Leer este archivo docs/SPEC_FLOWENGINE.md.

Confirmar que entiende:

Stack

Rutas existentes

Esquema de tenants.

Proponer cambios SOLO dentro de:

Nuevas páginas en app/.

Nuevos componentes reutilizables.

Mejoras al cliente Supabase.

Mantener:

Modo oscuro

Estilo minimalista

Nombres consistentes con este SPEC.

