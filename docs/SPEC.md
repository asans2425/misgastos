# MoneyFlow Albert - SPEC

## Vision

MoneyFlow Albert es una app personal de finanzas para registrar gastos e
ingresos con rapidez desde el movil y revisar el estado del mes.

## Concepto financiero

La app trabaja con tres espacios:

- Cuenta normal: dinero del dia a dia.
- AHORROS: ahorro calculado del mes.
- VIAJES: ingresos de clases/webs destinados a viajes.

La inversion no es una cuenta. Es un gasto recurrente editable, normalmente de
210 EUR al mes, marcado con `is_investment = true`.

## Formulas

```ts
normalIncome = income donde is_travel_income = false
travelIncome = income donde is_travel_income = true
investment = expense donde is_investment = true
livingExpenses = expense donde is_investment = false
monthlySavings = normalIncome - livingExpenses - investment
travelSavings = travelIncome
totalExpenses = livingExpenses + investment
expandedBalance = normalIncome + travelIncome - totalExpenses
```

Los importes se guardan siempre positivos. El campo `type` indica si es
`income`, `expense` o `transfer`.

## Fase actual

Incluye:

- Proyecto Next.js con App Router.
- TypeScript y Tailwind CSS.
- Supabase Auth con email/password.
- Proteccion de rutas bajo `/app`.
- Logout.
- Creacion de `profile` si no existe.
- Migracion SQL inicial con RLS.
- Inicializacion idempotente de datos del usuario.
- Pantalla `/app` con usuario, mes actual y contadores de datos.

## Supabase

Variables publicas:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

No usar `service_role` ni `sb_secret_*` en codigo de frontend.

## Tablas

- `profiles`
- `accounts`
- `categories`
- `subcategories`
- `recurring_items`
- `transactions`
- `quick_actions`
- `user_preferences`

Todas las tablas tienen RLS. `profiles` usa `id = auth.uid()` y el resto usa
`user_id = auth.uid()`.

## Datos iniciales

Cuentas:

- Cuenta normal
- AHORROS
- VIAJES

El seed crea categorias, subcategorias, recurrentes iniciales y acciones rapidas.
Debe evitar duplicados.

## Rutas

- `/login`: login y registro.
- `/app`: resumen y verificacion de datos iniciales.
- `/app/transactions`: listado placeholder de movimientos.
- `/app/add`: formulario visual inicial.
- `/app/analysis`: grafica placeholder.
- `/app/settings`: estado tecnico y futuros ajustes.

## Siguiente fase sugerida

- Aplicar migraciones al proyecto Supabase remoto.
- Conectar formulario de movimientos.
- Crear CRUD de recurrentes y acciones rapidas.
- Crear vistas reales de resumen y analisis mensual.
