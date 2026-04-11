import type { Metadata } from "next";
import { Manrope, Noto_Serif } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/context";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSerif = Noto_Serif({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Feel Better Club | Holistic Health Routines",
  description:
    "Morning Endorphins & Sea Vitamins. Holistic health rituals for lifestyle-driven athletes. Mobility, Strength, Pilates, Breathwork.",
  keywords: [
    "wellness",
    "mobility",
    "strength",
    "pilates",
    "breathwork",
    "kitesurf",
    "surf",
    "watersports",
    "feel better club",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Feel Better Club | Holistic Health Routines",
    description:
      "Morning Endorphins & Sea Vitamins. Strong Body and Clear Mind. Reconnect with Nature.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${notoSerif.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
