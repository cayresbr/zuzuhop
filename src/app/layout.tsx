import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

/**
 * Tipografia auto-hospedada pelo next/font: os arquivos são baixados no build
 * e servidos pelo próprio domínio. Isso mantém a CSP em `font-src 'self'` —
 * nenhuma requisição a terceiros parte do navegador da criança.
 *
 * Baloo 2: arredondada, cheia, com contraforma generosa. É a letra que uma
 * criança pré-leitora reconhece melhor — formas fechadas e sem serifa.
 * Nunito: leitura confortável para os textos longos da área do responsável.
 */
const baloo = Baloo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zuzuhop — brincar e aprender",
  description:
    "Jogos e atividades para crianças de 2 a 8 anos, com controle parental de verdade e privacidade em primeiro lugar.",
  applicationName: "Zuzuhop",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#7c4dff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${nunito.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
