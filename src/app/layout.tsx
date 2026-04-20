import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "gartenscan – Dein persönlicher Gartenexperte",
  description:
    "Erkenne Pflanzen, Unkraut, Schädlinge und Krankheiten – und wisse sofort, was zu tun ist.",
};

export const viewport: Viewport = {
  themeColor: "#F3F1EA",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" className={`${inter.variable} ${fraunces.variable}`}>
      <body
        style={
          {
            "--font-sans": "var(--font-inter)",
            "--font-serif": "var(--font-fraunces)",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
