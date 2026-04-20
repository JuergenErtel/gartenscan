import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Footer } from "@/components/layout/Footer";
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

const SITE_URL = "https://gartenscan.de";
const SITE_TITLE = "gartenscan – Pflanzen, Unkraut & Krankheiten erkennen";
const SITE_DESCRIPTION =
  "Scanne Pflanzen, Unkraut, Schädlinge und Krankheiten im Garten – und wisse sofort, was zu tun ist.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s · gartenscan",
  },
  description: SITE_DESCRIPTION,
  applicationName: "gartenscan",
  keywords: [
    "Garten",
    "Pflanzenerkennung",
    "Unkraut",
    "Schädlinge",
    "Krankheiten",
    "Pflanzen-App",
    "Pflanzenpflege",
  ],
  authors: [{ name: "gartenscan" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: "gartenscan",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
