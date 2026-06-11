# MoneyFlow Albert

## Descripcion

Aplicacion web personal de finanzas, mobile-first, para registrar gastos e
ingresos rapidamente desde el movil y analizar el mes.

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- Supabase Auth y Postgres
- Recharts
- lucide-react
- date-fns
- clsx

## Comandos de desarrollo

```bash
npm run dev
```

## Comandos de validacion

```bash
npm run lint
npm run build
```

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Usar la URL base de Supabase sin `/rest/v1/`. No usar `service_role` ni
`sb_secret_*` en frontend.

## Convenciones

- Mantener componentes pequenos y enfocados.
- Priorizar una experiencia mobile-first.
- Usar `components/layout` para navegacion y shells.
- Usar `lib/supabase` solo para clientes y helpers de Supabase.
- Usar `lib/auth` para auth, profile e inicializacion de usuario.
- Usar `lib/finance` para utilidades de dominio financiero.
- Las migraciones SQL viven en `supabase/migrations`.
- No reescribir el proyecto ni mezclar refactors no pedidos.

## Auth y datos

- `/app` debe estar protegido y redirigir a `/login` si no hay sesion.
- Tras login se debe asegurar `profiles` e inicializar datos solo si faltan.
- `initializeUserData(userId)` debe ser idempotente y evitar duplicados.

## Recordatorios

- Ejecutar `npm run lint` y `npm run build` antes de terminar.
- No usar claves privadas de Supabase en frontend. Solo variables
  `NEXT_PUBLIC_*` deben llegar al navegador.
