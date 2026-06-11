# MoneyFlow Albert

Base tecnica de una aplicacion personal de finanzas mobile-first para registrar
gastos e ingresos y analizar el mes.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase
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

Copia `.env.example` a `.env.local` cuando se configure Supabase.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

No uses claves privadas de Supabase en el frontend.

## Rutas iniciales

- `/login`
- `/app`
- `/app/transactions`
- `/app/add`
- `/app/analysis`
- `/app/settings`

## Estado

Esta fase crea la base compilable. La autenticacion real, el modelo de datos,
las migraciones y la logica de negocio quedan para fases posteriores.
