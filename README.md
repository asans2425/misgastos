# MoneyFlow Albert

Aplicacion personal de finanzas, mobile-first, para registrar gastos e ingresos
rapidamente desde el movil y analizar el mes.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth y Postgres
- Recharts
- lucide-react
- date-fns
- clsx

## Desarrollo

```bash
npm run dev
```

Abre `http://localhost:3000`.

## Validacion

```bash
npm run lint
npm run build
```

## Variables de entorno

Copia `.env.example` a `.env.local` y rellena los valores publicos de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

`NEXT_PUBLIC_SUPABASE_URL` debe ser la URL base del proyecto, por ejemplo
`https://xxxx.supabase.co`, sin `/rest/v1/`.

No uses claves `service_role` ni `sb_secret_*` en el frontend. En variables
`NEXT_PUBLIC_*` solo debe ir una clave publica anon/publishable.

## Supabase

Las migraciones viven en `supabase/migrations`.

La migracion inicial crea:

- `profiles`
- `accounts`
- `categories`
- `subcategories`
- `recurring_items`
- `transactions`
- `quick_actions`
- `user_preferences`

Todas las tablas tienen RLS activado. Cada usuario solo puede acceder a sus
propios datos.

## Auth

`/login` permite login y registro con email/password. Las rutas bajo `/app`
estan protegidas: sin sesion redirigen a `/login`.

Al iniciar sesion se crea el `profile` si falta y, si el usuario no tiene datos,
se ejecuta `initializeUserData(userId)`.

## Datos iniciales

El seed crea cuentas para `Cuenta normal`, `AHORROS` y `VIAJES`, categorias,
subcategorias, recurrentes editables y acciones rapidas iniciales.

La pantalla `/app` muestra el usuario autenticado, el mes actual y los contadores
de datos iniciales para confirmar que el seed se ha ejecutado.

## Rutas

- `/login`
- `/app`
- `/app/transactions`
- `/app/add`
- `/app/analysis`
- `/app/settings`
