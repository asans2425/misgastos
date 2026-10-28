# MoneyFlow ARSA

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

## Uso como app movil

La app incluye manifest PWA, iconos y service worker minimo. Al desplegarla en
Vercel con HTTPS se puede anadir a la pantalla de inicio:

- iPhone/Safari: Compartir -> Anadir a pantalla de inicio.
- Android/Chrome: menu del navegador -> Instalar app o Anadir a pantalla de
  inicio.

La PWA arranca en `/app` y se muestra en modo `standalone`.

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
APP_ADMIN_EMAILS=
```

`NEXT_PUBLIC_SUPABASE_URL` debe ser la URL base del proyecto, por ejemplo
`https://xxxx.supabase.co`, sin `/rest/v1/`.

No uses claves `service_role` ni `sb_secret_*` en el frontend. En variables
`NEXT_PUBLIC_*` solo debe ir una clave publica anon/publishable.

`APP_ADMIN_EMAILS` es opcional y no debe llevar el prefijo `NEXT_PUBLIC_`.
Permite que el creador vea avisos tecnicos de configuracion separados por coma,
usando el email real con el que inicia sesion.

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

`/login` permite registro y acceso con un email y una contraseña propia, además
de login con Google si el provider está configurado en Supabase. La contraseña
de Gmail no se usa para el acceso por email. Si una cuenta empezó con Google,
puede crear una contraseña desde «He olvidado mi contraseña / entrar sin
Google» usando el mismo email; así Google y email/contraseña acceden al mismo
usuario. Las rutas bajo `/app` están protegidas: sin sesión redirigen a
`/login`.

Al iniciar sesion se crea el `profile` si falta y, si el usuario no tiene datos,
se ejecuta `initializeUserData(userId)`.

## Datos iniciales

El seed crea `Cuenta normal`, categorias y subcategorias generales, y acciones
rapidas iniciales. No crea huchas ni gastos fijos por defecto: cada usuario
puede crear sus propias huchas, ingresos fijos y gastos fijos desde
configuracion.

La pantalla `/app` muestra un dashboard mensual con movimientos reales,
acciones rapidas de gasto, ultimos movimientos y resumen financiero.

## Configuracion personal

- `/app/settings/recurring`: permite crear, editar, pausar, eliminar y generar
  gastos e ingresos fijos del mes.
- `/app/settings/categories`: permite crear y editar categorias y
  subcategorias para adaptar la app a cada persona.
- `/app/settings/buckets`: permite crear huchas y registrar aportaciones o
  retiradas internas sin que cuenten como gasto o ingreso.

La app usa una cuenta operativa principal. Apartar dinero a una hucha no es un
gasto estadistico; sirve para compartimentar objetivos.

Los reembolsos se registran como ingresos enlazados a un gasto original. No
cuentan como ingreso real del mes: reducen el gasto neto de esa categoria para
que casos como cenas, padel o compras pagadas por una persona no deformen las
estadisticas.

En `/app/settings` se puede configurar el mes financiero con el dia de cobro o
inicio del ciclo. Dias 1-15 cuentan como ese mismo mes y dias 16-31 como el mes
siguiente. El dia elegido pertenece al nuevo ciclo; con dia 30, agosto cubre del
30 de julio al 29 de agosto y septiembre empieza el 30 de agosto.

## Rutas

- `/login`
- `/reset-password`
- `/app`
- `/app/transactions`
- `/app/add`
- `/app/analysis`
- `/app/settings`
- `/app/settings/recurring`
- `/app/settings/categories`
- `/app/settings/buckets`
