import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0f766e",
    categories: ["finance", "productivity"],
    description:
      "App personal de finanzas para registrar gastos e ingresos desde el movil.",
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "192x192",
        src: "/icons/icon-192.png",
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: "/icons/icon-512.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icons/icon-512.png",
        type: "image/png",
      },
    ],
    id: "/app",
    lang: "es",
    name: "MoneyFlow Albert",
    orientation: "portrait",
    scope: "/",
    short_name: "MoneyFlow",
    start_url: "/app",
    theme_color: "#0f766e",
  };
}
