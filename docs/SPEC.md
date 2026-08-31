# MoneyFlow Albert - SPEC

## Vision

MoneyFlow Albert es una app personal de finanzas para registrar gastos e
ingresos con rapidez desde el movil y revisar el estado del mes.

## Concepto financiero

La app trabaja con una cuenta operativa principal y huchas:

- Cuenta normal: cuenta principal donde entran ingresos y salen gastos reales.
- Huchas: compartimentos internos para apartar dinero por objetivos, como
  ahorros, viajes, coche o cualquier objetivo que cree cada usuario.

Mover dinero a una hucha no es un gasto y no afecta a estadisticas de gastos.
Retirar dinero de una hucha tampoco es un ingreso. Las huchas tienen sus propios
movimientos internos.

La inversion no es una cuenta ni una hucha obligatoria. Es un gasto recurrente
editable, normalmente de 210 EUR al mes, marcado con `is_investment = true`.

Un reembolso no es ingreso real. Es una entrada de dinero marcada con
`is_reimbursement = true` y enlazada al gasto original mediante
`reimburses_transaction_id`. En estadisticas, el reembolso reduce el gasto neto
de la categoria/subcategoria del gasto asociado. Ejemplo: cena de 120 EUR con
100 EUR devueltos por amigos = 20 EUR de gasto real en restauracion.

Cada usuario puede configurar su mes financiero indicando el dia de cobro o
inicio del ciclo. Por defecto coincide con el mes natural. Para evitar dudas, la
app interpreta automaticamente el nombre del ciclo:

- Dias 1-15: el ciclo pertenece a ese mismo mes.
- Dias 16-31: el ciclo pertenece al mes siguiente.

El dia elegido ya pertenece al nuevo ciclo; por ejemplo con dia 30, agosto va
del 30 de julio al 29 de agosto y septiembre empieza el 30 de agosto.

## Formulas

```ts
normalIncome = income donde is_reimbursement = false
travelIncome = 0 en el modelo nuevo; se mantiene el campo por compatibilidad
investment = expense donde is_investment = true - reembolsos asociados
livingExpenses = expense donde is_investment = false - reembolsos asociados
monthlySavings = normalIncome - livingExpenses - investment
travelSavings = saldo de huchas de viajes si se quiere mostrar ese objetivo
totalExpenses = livingExpenses + investment
expandedBalance = normalIncome - totalExpenses
```

Los importes se guardan siempre positivos. En la experiencia principal se
trabaja con ingresos y gastos. Si alguien tiene una transferencia mensual fija,
se modela como un gasto fijo con la categoria/subcategoria que tenga sentido
para esa persona.

## Fase actual

Incluye:

- Proyecto Next.js con App Router.
- TypeScript y Tailwind CSS.
- Supabase Auth con email/password y soporte de Google OAuth.
- Proteccion de rutas bajo `/app`.
- Logout.
- Creacion de `profile` si no existe.
- Migracion SQL inicial con RLS.
- Inicializacion idempotente de datos del usuario.
- Dashboard `/app` con resumen mensual real, acciones rapidas, ultimos
  movimientos, top de categorias y resumen de huchas.
- Gestion de gastos e ingresos fijos en `/app/settings/recurring`.
- Gestion de categorias y subcategorias en `/app/settings/categories`.
- Gestion de huchas en `/app/settings/buckets`.
- Configuracion del mes financiero en `/app/settings`.

## Supabase

Variables publicas:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
APP_ADMIN_EMAILS=
```

No usar `service_role` ni `sb_secret_*` en codigo de frontend.
`APP_ADMIN_EMAILS` es opcional, server-only, y permite mostrar errores tecnicos
solo al creador.

## Tablas

- `profiles`
- `accounts`
- `categories`
- `subcategories`
- `recurring_items`
- `transactions`
- `quick_actions`
- `user_preferences`
- `savings_buckets`
- `bucket_movements`

Todas las tablas tienen RLS. `profiles` usa `id = auth.uid()` y el resto usa
`user_id = auth.uid()`.

## Datos iniciales

Cuentas:

- Cuenta normal

Huchas iniciales:

- No se crean huchas por defecto.

El seed crea categorias y subcategorias generales, y acciones rapidas iniciales.
No crea recurrentes por defecto. Debe evitar duplicados.

## Rutas

- `/login`: login y registro.
- `/app`: dashboard mensual con datos reales.
- `/app/transactions`: listado, filtros, edicion y borrado de movimientos.
- `/app/add`: creacion de gastos, ingresos y reembolsos asociados a gastos.
- `/app/analysis`: grafica placeholder.
- `/app/settings`: acceso a configuracion.
- `/app/settings/recurring`: gastos e ingresos fijos.
- `/app/settings/categories`: categorias y subcategorias.
- `/app/settings/buckets`: huchas y aportaciones internas.

## Siguiente fase sugerida

- Mejorar acciones rapidas para que sean editables desde ajustes.
- Crear vistas reales de analisis mensual con graficos.
