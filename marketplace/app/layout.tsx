import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopLoader from "@/components/TopLoader";
import EditModeBridge from "@/components/EditModeBridge";
import SiteJsonLd from "@/components/SiteJsonLd";
import { brand } from "@/lib/brand";
import "./globals.css";

// One family across the whole buy side. See the type note in globals.css for
// why Figtree rather than the parent's Typekit pair: the identity's geometric
// sans is unnamed and unlicensable, Figtree is its documented stand-in, and a
// self-hosted Google family avoids the domain lock that would break a Typekit
// kit the moment carmarketplace.com.au goes live.
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800", "900"],
  variable: "--font-figtree",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} | Hand-picked used cars, honestly described`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Hand-picked used cars across the Gold Coast, Brisbane and Northern Rivers. Every one PPSR checked, honestly described and priced to sell. Around 25 cars pass through every month.",
  openGraph: {
    siteName: brand.fullName,
    type: "website",
    locale: "en_AU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={figtree.variable}>
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
