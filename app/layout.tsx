import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaRuntime } from "@/components/pwa/PwaRuntime";
import { ClientBootSplash } from "@/components/ui/ClientBootSplash";
import { cn } from "@/lib/utils/cn";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "Money Flow ARSA",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Money Flow ARSA",
  },
  title: {
    default: "Money Flow ARSA",
    template: "%s | Money Flow ARSA",
  },
  description: "App personal de finanzas mobile-first.",
  formatDetection: {
    telephone: false,
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: [
      { sizes: "192x192", url: "/icons/icon-192.png", type: "image/png" },
      { sizes: "512x512", url: "/icons/icon-512.png", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f766e",
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "h-full antialiased",
      )}
    >
      <body className="min-h-full bg-background text-foreground">
        <PwaRuntime />
        <ClientBootSplash />
        {children}
      </body>
    </html>
  );
}
