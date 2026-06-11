# MoneyFlow Albert - SPEC

## Vision

MoneyFlow Albert es una app personal de finanzas para registrar gastos e
ingresos con rapidez desde el movil y revisar el estado del mes.

## Fase 1

Objetivo: crear una base tecnica limpia, compilable y preparada para continuar.

Incluye:

- Proyecto Next.js con App Router.
- TypeScript configurado.
- Tailwind CSS configurado.
- Dependencias base instaladas.
- Estructura de carpetas inicial.
- Layout raiz y shell privado.
- Pagina `/login`.
- Paginas privadas bajo `/app`.
- Navegacion responsive con barra inferior en movil y sidebar en escritorio.
- Documentacion inicial.

No incluye:

- Autenticacion real.
- Persistencia en Supabase.
- Migraciones de base de datos.
- Formularios funcionales.
- Analitica financiera real.

## Rutas

- `/login`: entrada visual basica.
- `/app`: resumen mensual placeholder.
- `/app/transactions`: listado placeholder de movimientos.
- `/app/add`: formulario visual inicial.
- `/app/analysis`: grafica placeholder.
- `/app/settings`: estado tecnico y futuros ajustes.

## Supabase

Variables publicas previstas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Nunca usar `service_role` ni claves privadas en codigo de frontend.

## Siguiente fase sugerida

- Definir esquema de datos.
- Crear migraciones Supabase.
- Implementar autenticacion.
- Conectar formulario de movimientos.
- Crear vistas reales de resumen y analisis mensual.
