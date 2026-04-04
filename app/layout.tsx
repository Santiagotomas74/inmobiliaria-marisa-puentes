import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar/Navbar";
import type { NavbarProps } from "./components/navbar/Navbar.types";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "Inmobiliaria en San Miguel | Marisa Puentes Propiedades",
description: "Compra, venta y alquiler de propiedades en San Miguel. Casas, departamentos y terrenos con asesoramiento profesional.",
   
};
const navItems: NavbarProps["items"] = [
  { label: "Inicio", href: "/" },
  { label: "Propiedades", href: "/propiedades" },
  { label: "Nosotros", href: "/nosotros" },
   { label: "Contacto", href: "/contacto" },
     { label: "Administracion", href: "/administracion" },
];

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
         <Navbar items={navItems}  />
        {children}
      </body>
    </html>
  );
}
