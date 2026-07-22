import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopLoader from "@/components/TopLoader";
import EditModeBridge from "@/components/EditModeBridge";
import SiteJsonLd from "@/components/SiteJsonLd";
import "./globals.css";

// Brand type comes from the client's Adobe Typekit kit (Neue Haas Grotesk
// Display for headings, Mr Eaves Modern for body) — same kit the reference
// adamhallbuymycar.com.au site loads. Fallback stacks live in globals.css.

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Adam Hall — Buy My Car | Quality used cars, straight answers",
    template: "%s | Adam Hall — Buy My Car",
  },
  description:
    "Hand-picked used cars across the Gold Coast, Brisbane and Northern Rivers. Transparent pricing, honest condition reports and fast settlements. Selling? Adam personally reviews every car within 1 business day.",
  openGraph: {
    siteName: "Adam Hall — Buy My Car",
    type: "website",
    locale: "en_AU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://use.typekit.net/knr6tgk.css" />
      </head>
      <body className="min-h-dvh flex flex-col">
        <SiteJsonLd />
        <TopLoader />
        <EditModeBridge />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
