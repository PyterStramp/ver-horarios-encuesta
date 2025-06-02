import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { EncuestasProvider } from "@/contexts/EncuestasContext";
import { GeolocationProvider } from '@/contexts/GeolocationContext';
import { UniversidadProvider } from '@/contexts/UniversidadContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ver horarios por docente",
  description: "Generado por Next",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UniversidadProvider>
          <GeolocationProvider>
            <EncuestasProvider>
              {children}
            </EncuestasProvider>
          </GeolocationProvider>
        </UniversidadProvider>
      </body>
    </html>
  );
}
