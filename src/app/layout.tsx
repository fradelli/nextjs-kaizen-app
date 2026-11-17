import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, Figtree } from "next/font/google";
import type { ReactNode } from "react";

import { AppShell } from "@/components/shared/app-shell/app-shell";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-sans",
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

export const viewport: Viewport = { viewportFit: "cover" };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  return {
    title: "Kaizen",
    description: t("description"),
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function RootLayout({
  children,
  workout,
}: Readonly<{ children: ReactNode; workout?: ReactNode }>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${ibmPlexSans.variable} ${figtree.variable} dark kaizen-static-motion`}
    >
      <body>
        <NextIntlClientProvider>
          <AppShell>{children}</AppShell>
          {workout}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
