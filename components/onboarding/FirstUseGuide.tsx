"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CircleHelp,
  CirclePlus,
  Home,
  Layers3,
  ListChecks,
  Settings,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";

type GuideStep = {
  description: string;
  icon: LucideIcon;
  tips: string[];
  title: string;
};

const STORAGE_KEY = "moneyflow-first-use-guide-v2";

const steps: GuideStep[] = [
  {
    description: "Money Flow ARSA te ayuda a registrar lo que entra y sale de tu cuenta, separar dinero en huchas y entender cómo evoluciona tu ahorro.",
    icon: Sparkles,
    tips: [
      "Puedes entrar con email y contraseña o con Google si está configurado.",
      "Los importes se guardan siempre como cantidades positivas.",
      "La guía se puede volver a abrir desde el icono de ayuda.",
    ],
    title: "Bienvenido a Money Flow ARSA",
  },
  {
    description: "Antes de registrar datos, dedica unos minutos a adaptar la app. Así las listas y estadísticas tendrán sentido para tu vida real.",
    icon: Settings,
    tips: [
      "En Mi configuración revisa el día en que cobras y el inicio de tu mes financiero.",
      "En Categorías crea, edita o desactiva las opciones que utilices.",
      "En Patrimonio y huchas introduce el dinero que ya tienes.",
      "En Gastos e ingresos fijos configura nóminas, alquileres, suscripciones y otros pagos repetidos.",
    ],
    title: "Empieza por tu configuración",
  },
  {
    description: "El mes financiero no tiene por qué coincidir con el mes natural. Es útil si cobras el día 28, 30 o 3 y quieres medir el ahorro desde una nómina hasta la siguiente.",
    icon: Settings,
    tips: [
      "Indica el día de cobro o inicio del ciclo entre 1 y 31.",
      "Del día 1 al 15, el ciclo se nombra con ese mismo mes.",
      "Del día 16 al 31, el ciclo se nombra con el mes siguiente.",
      "Con día 30, agosto va del 30 de julio al 29 de agosto y septiembre empieza el 30 de agosto.",
    ],
    title: "Configura tu mes financiero",
  },
  {
    description: "Inicio es el resumen del ciclo seleccionado. Desde aquí puedes comprobar tu cuenta, consultar el patrimonio y añadir un gasto habitual en pocos segundos.",
    icon: Home,
    tips: [
      "El selector de mes cambia todo el resumen y los últimos movimientos.",
      "La tarjeta Cuenta enlaza directamente con los movimientos de ese ciclo.",
      "El switch Contar inversión muestra los ahorros con y sin inversión.",
      "Las tarjetas se leen así: Ingresos, Gastado, Ahorro, Inversión y Gastos totales según el modo elegido.",
    ],
    title: "Usa Inicio como panel principal",
  },
  {
    description: "Añadir es la forma completa de registrar una operación. Elige primero si es un gasto o un ingreso y completa solo los datos que necesites.",
    icon: CirclePlus,
    tips: [
      "Escribe el importe con coma o punto decimal: 6,50 y 6.50 se guardan como 6,50 €.",
      "La fecha empieza en hoy y la cuenta principal aparece seleccionada.",
      "En un gasto, elige categoría y subcategoría para que las estadísticas sean útiles.",
      "Puedes añadir una descripción opcional y cambiar el estado a pendiente o confirmado desde Movimientos.",
    ],
    title: "Añade gastos e ingresos",
  },
  {
    description: "Los ingresos se registran como ingresos normales. La fuente o subcategoría indica de dónde vienen y permite distinguir nóminas, clases, webs u otras entradas.",
    icon: CirclePlus,
    tips: [
      "Selecciona Ingreso y escoge una fuente/subcategoría configurada para ingresos.",
      "Introduce el importe, la fecha, la cuenta y una descripción si quieres.",
      "No introduzcas una transferencia a una hucha como ingreso: las huchas se gestionan aparte.",
      "Si el dinero te lo devuelve otra persona por un gasto que pagaste tú, usa la opción de reembolso.",
    ],
    title: "Registra tus ingresos correctamente",
  },
  {
    description: "Un reembolso no es un ingreso real: reduce el coste del gasto original. Es la forma correcta de registrar una cena, unas cervezas o un pádel que pagaste para varias personas.",
    icon: ListChecks,
    tips: [
      "Crea primero el gasto completo, por ejemplo una cena de 120 €.",
      "Cuando recibas los Bizum, crea un Ingreso y marca Es un reembolso.",
      "Selecciona el gasto original y escribe el importe devuelto, por ejemplo 100 €.",
      "La estadística mostrará 20 € de gasto neto y el reembolso no inflará tus ingresos.",
    ],
    title: "Registra reembolsos de amigos",
  },
  {
    description: "Una inversión sale de tu cuenta principal y se considera gasto de inversión, pero puede seguir formando parte de tu patrimonio si la vinculas a una hucha.",
    icon: Layers3,
    tips: [
      "En un gasto, selecciona la categoría Inversión o marca Marcar como inversión.",
      "Si eliges una hucha de inversión, el importe se resta de Cuenta y se suma a esa hucha una sola vez.",
      "Si eliges Ninguna hucha, se registra como gasto de inversión y no se añade a ninguna hucha.",
      "No hagas después una aportación manual por el mismo importe o lo contarías dos veces.",
    ],
    title: "Gestiona las inversiones",
  },
  {
    description: "Las acciones rápidas del Inicio sirven para registrar un gasto frecuente introduciendo únicamente el importe.",
    icon: CirclePlus,
    tips: [
      "Pulsa Bar trabajo, Gasolina, Pádel, Supermercado, Café u otra acción.",
      "La categoría, subcategoría, cuenta y fecha se rellenan automáticamente.",
      "Escribe el importe y guarda; la tarjeta se cierra y el resumen se actualiza.",
      "Usa Movimiento completo cuando necesites cambiar fecha, descripción, inversión o reembolso.",
    ],
    title: "Registra gastos en segundos",
  },
  {
    description: "Movimientos es el historial completo de tu ciclo. Está pensado para corregir datos, localizar una operación y mantener la información limpia.",
    icon: ListChecks,
    tips: [
      "Filtra por mes, tipo, categoría o texto.",
      "Puedes editar importe, fecha, categoría, subcategoría, descripción y estado.",
      "Al cambiar la fecha, el movimiento pasa automáticamente al ciclo correspondiente.",
      "El botón de papelera permite eliminar directamente con confirmación.",
    ],
    title: "Revisa y corrige movimientos",
  },
  {
    description: "Los gastos e ingresos fijos son plantillas editables. Se guardan como reglas y solo crean movimientos cuando tú pulsas Generar movimientos.",
    icon: Settings,
    tips: [
      "Crea una nómina, alquiler, seguro, suscripción o inversión mensual.",
      "Indica importe, día del mes, cuenta, categoría y subcategoría.",
      "Activo significa que la regla está disponible; puedes pausarla sin borrarla.",
      "Generar movimientos crea los fijos del mes seleccionado y evita duplicados.",
      "Si cambia tu sueldo o un recibo, edita la regla antes de generar el siguiente mes.",
    ],
    title: "Automatiza lo que se repite",
  },
  {
    description: "Patrimonio y huchas sirve para reflejar el dinero que ya tienes y separarlo por objetivos sin convertir esos movimientos internos en gastos.",
    icon: Layers3,
    tips: [
      "Cuenta muestra el saldo actual de tu cuenta principal.",
      "Puedes editar el saldo actual y el patrimonio total para ajustar datos iniciales o hacer pruebas.",
      "Crea huchas como Ahorro, Viajes, Coche o MyInvestor.",
      "Aportar mueve dinero de Cuenta a una hucha; Retirar hace el movimiento contrario.",
      "Las aportaciones y retiradas no alteran los gastos, ingresos ni el ahorro estadístico.",
    ],
    title: "Controla patrimonio y huchas",
  },
  {
    description: "Tus categorías y subcategorías hacen que registrar sea rápido y que los gráficos respondan a tu realidad.",
    icon: Layers3,
    tips: [
      "Conserva las categorías habituales y elimina o desactiva las que no uses.",
      "Crea subcategorías para distinguir, por ejemplo, gasolina, parking y peajes.",
      "Las subcategorías de ingresos permiten organizar nóminas, clientes y fuentes distintas.",
      "Marca las subcategorías de inversión o ingresos especiales cuando corresponda.",
    ],
    title: "Adapta categorías y subcategorías",
  },
  {
    description: "Analítica resume tus datos sin llenarte de números innecesarios. Elige el periodo que quieras entender y decide si la inversión debe contar como gasto.",
    icon: BarChart3,
    tips: [
      "Mes muestra calendario, categorías, fijos frente a variables y mayores gastos.",
      "3M, 6M y 12M muestran evolución mensual, categorías acumuladas y ahorro.",
      "El switch Contar inversión permite comparar ahorro con inversión y sin inversión.",
      "El calendario de color te enseña rápidamente qué días concentraron gasto.",
      "Las huchas no aparecen en Analítica porque se gestionan desde Patrimonio.",
    ],
    title: "Lee tus estadísticas",
  },
  {
    description: "La rutina más sencilla es registrar cada gasto al momento, revisar el resumen una vez por semana y corregir cualquier dato antes de cerrar el ciclo.",
    icon: Home,
    tips: [
      "Usa acciones rápidas para lo habitual y Movimiento completo para casos especiales.",
      "Si una cifra no cuadra, revisa primero el mes financiero y los movimientos del ciclo.",
      "Si una inversión está vinculada a una hucha, no vuelvas a aportarla manualmente.",
      "Actualiza los fijos cuando cambie un importe y genera solo el mes que necesites.",
    ],
    title: "Una rutina que funciona",
  },
];

export function FirstUseGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.localStorage.getItem(STORAGE_KEY) === "done") return;

    const timer = window.setTimeout(() => setIsOpen(true), 1300);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.localStorage.setItem(STORAGE_KEY, "done");
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const closeGuide = () => {
    window.localStorage.setItem(STORAGE_KEY, "done");
    setIsOpen(false);
  };

  const openGuide = () => {
    setStep(0);
    setIsOpen(true);
  };

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <>
      <button
        aria-label="Abrir guía de uso"
        className="flex size-10 items-center justify-center rounded-full border border-border-soft bg-surface text-brand shadow-sm transition hover:bg-surface-muted"
        onClick={openGuide}
        title="Guía de uso"
        type="button"
      >
        <CircleHelp aria-hidden="true" size={20} />
      </button>

      {isOpen ? (
        <div
          aria-labelledby="first-use-guide-title"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
        >
          <section className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl">
            <div className="bg-brand px-5 pb-6 pt-5 text-white sm:px-7">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-white/80">
                  Paso {step + 1} de {steps.length}
                </p>
                <button
                  aria-label="Cerrar guía"
                  className="flex size-9 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
                  onClick={closeGuide}
                  type="button"
                >
                  <X aria-hidden="true" size={19} />
                </button>
              </div>

              <div className="mt-5 flex size-14 items-center justify-center rounded-2xl bg-white/15">
                <Icon aria-hidden="true" size={29} />
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight" id="first-use-guide-title">
                {current.title}
              </h2>
              <p className="mt-2 text-base leading-7 text-white/85">
                {current.description}
              </p>
            </div>

            <div className="px-5 py-5 sm:px-8 sm:py-6">
              <ul className="space-y-3">
                {current.tips.map((tip) => (
                  <li className="flex gap-3 text-sm leading-6 text-slate-600" key={tip}>
                    <span className="mt-2 size-2 shrink-0 rounded-full bg-brand" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-center gap-1.5" aria-hidden="true">
                {steps.map((item, index) => (
                  <span
                    className={`h-1.5 rounded-full transition-all ${index === step ? "w-7 bg-brand" : "w-2 bg-slate-200"}`}
                    key={item.title}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                {step > 0 ? (
                  <button
                    className="inline-flex h-11 items-center gap-2 rounded-md border border-border-soft px-4 text-sm font-semibold text-slate-700 transition hover:bg-surface-muted"
                    onClick={() => setStep((value) => value - 1)}
                    type="button"
                  >
                    <ArrowLeft aria-hidden="true" size={17} />
                    Anterior
                  </button>
                ) : (
                  <button className="h-11 px-2 text-sm font-semibold text-slate-500" onClick={closeGuide} type="button">
                    Omitir
                  </button>
                )}

                <button
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-strong"
                  onClick={() => {
                    if (isLast) closeGuide();
                    else setStep((value) => value + 1);
                  }}
                  type="button"
                >
                  {isLast ? "Empezar" : "Siguiente"}
                  {!isLast ? <ArrowRight aria-hidden="true" size={17} /> : null}
                </button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
