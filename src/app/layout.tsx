import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { AppShell } from "@/components/shared/app-shell/app-shell";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = { viewportFit: "cover" };

export const metadata: Metadata = {
  title: "Kaizen",
  description: "Dieta e treino pessoal.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark kaizen-static-motion`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
