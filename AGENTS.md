# MoneyFlow Albert

## Descripcion

Aplicacion web personal de finanzas, mobile-first, para registrar gastos e
ingresos rapidamente desde el movil y analizar el mes.

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- Supabase
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

## Convenciones

- Mantener componentes pequenos y enfocados.
- Priorizar una experiencia mobile-first.
- Usar `components/layout` para navegacion y shells.
- Usar `lib/supabase` solo para clientes y helpers de Supabase.
- Usar `lib/finance` para utilidades de dominio financiero.
- No implementar logica completa antes de que la fase lo pida.

## Recordatorios

- Ejecutar `npm run build` antes de dar por terminado un cambio importante.
- No usar claves privadas de Supabase en frontend. Solo variables
  `NEXT_PUBLIC_*` deben llegar al navegador.
