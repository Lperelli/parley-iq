import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Parley IQ – Análisis Inteligente de Fútbol",
  description: "Plataforma de análisis estadístico de fútbol con IA. Probabilidades, tendencias y análisis de riesgo. Solo estadísticas, no consejos de apuestas.",
  keywords: ["fútbol", "análisis", "estadísticas", "parley", "probabilidades", "IA"],
  manifest: '/manifest.json',
  openGraph: {
    title: "Parley IQ – Análisis Inteligente de Fútbol",
    description: "IA + datos reales para entender probabilidades, tendencias y riesgo deportivo.",
    type: "website",
    locale: "es_MX",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050b14",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-[#050b14]">
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
