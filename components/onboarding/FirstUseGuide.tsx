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

const STORAGE_KEY = "moneyflow-first-use-guide-v1";

const steps: GuideStep[] = [
  {
    description: "En dos minutos conocerás todo lo necesario para llevar tus finanzas desde el móvil.",
    icon: Sparkles,
    tips: ["Son 7 pasos cortos", "Podrás repetir este recorrido desde el botón de ayuda"],
    title: "Bienvenido a MoneyFlow",
  },
  {
    description: "Inicio resume el mes financiero que tengas seleccionado y te enseña de un vistazo cómo vas.",
    icon: Home,
    tips: ["Consulta saldo, patrimonio, ingresos, gastos, ahorro e inversión", "Cambia de mes con las flechas del selector", "Los últimos movimientos aparecen al final"],
    title: "Tu mes, de un vistazo",
  },
  {
    description: "Pulsa Añadir para registrar un gasto o un ingreso en pocos segundos.",
    icon: CirclePlus,
    tips: ["Indica importe, fecha, cuenta, categoría y subcategoría", "Puedes marcar inversiones, reembolsos y movimientos pendientes", "Las acciones rápidas del Inicio rellenan operaciones frecuentes"],
    title: "Registra cada movimiento",
  },
  {
    description: "Movimientos guarda el historial completo y te ayuda a encontrar cualquier operación.",
    icon: ListChecks,
    tips: ["Filtra por mes, tipo, categoría o texto", "Edita o elimina desde la propia lista", "Relaciona un ingreso con el gasto que está reembolsando"],
    title: "Revisa y corrige",
  },
  {
    description: "Análisis transforma tus movimientos en información útil para tomar decisiones.",
    icon: BarChart3,
    tips: ["Compara periodos de 1, 3, 6 o 12 meses", "Revisa tendencias, categorías, ritmo de gasto y calendario", "Controla ahorro, inversión, gastos fijos y huchas"],
    title: "Entiende en qué se va el dinero",
  },
  {
    description: "Mi configuración adapta MoneyFlow a tu forma real de cobrar, gastar y ahorrar.",
    icon: Settings,
    tips: ["Define cuándo empieza tu mes financiero", "Personaliza categorías y subcategorías", "Configura gastos e ingresos fijos y genéralos sin duplicados", "Crea huchas y registra aportaciones o retiradas"],
    title: "Pon la app a tu medida",
  },
  {
    description: "Nunca tienes que volver al menú principal para deshacer un paso.",
    icon: Layers3,
    tips: ["Usa Atrás para regresar a la pantalla anterior", "Las migas de pan muestran dónde estás y permiten subir de nivel", "La barra inferior mantiene a mano las cinco zonas principales"],
    title: "Muévete sin perderte",
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
          <section className="max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-lg sm:rounded-2xl">
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

            <div className="px-5 py-5 sm:px-7 sm:py-6">
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
