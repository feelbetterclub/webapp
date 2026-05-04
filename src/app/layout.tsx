import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Caveat, Chewy } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/context";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const chewy = Chewy({
  variable: "--font-brand",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Feel Better Club | Health routines community",
  description:
    "Morning Endorphins & Sea Vitamins. Health routines for lifestyle-driven athletes. Mobility, Strength, Pilates, Breathwork.",
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
    title: "Feel Better Club | Health routines community",
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
      className={`${plusJakarta.variable} ${caveat.variable} ${chewy.variable} h-full antialiased`}
    >
      <head>
        <Script id="gtm" strategy="afterInteractive">{`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-N4HFZFLV');
        `}</Script>
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N4HFZFLV"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
