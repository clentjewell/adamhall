import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopLoader from "@/components/TopLoader";
import NavLoader from "@/components/NavLoader";
import EditModeBridge from "@/components/EditModeBridge";
import GarageSync from "@/components/garage/GarageSync";
import SiteJsonLd from "@/components/SiteJsonLd";
import { brand } from "@/lib/brand";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${brand.name} | Hand-picked used cars, honestly described`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Hand-picked used cars across the Gold Coast, Brisbane and Northern Rivers. Every one PPSR checked, honestly described and priced to sell.",
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
    // View Transitions wrap route changes in document.startViewTransition
    // where the browser supports it; elsewhere navigation is simply instant.
    <ViewTransitions>
      <html lang="en-AU">
      <head>
        {/* Same type as the parent brand: Neue Haas Grotesk Display for
            headings, Mr Eaves Modern for body, from Adam's own Adobe Fonts
            web project. The kit ships weights 400–700; globals.css pins the
            stacks and disables faux-weight synthesis so heavier steps render
            in the real 700 rather than a synthesised heavy. */}
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="" />
        <link rel="stylesheet" href="https://use.typekit.net/knr6tgk.css" />
      </head>
      <body className="min-h-dvh flex flex-col">
        <SiteJsonLd />
        {/* Two indicators, one system: the bar covers every navigation, the
            screen only the ones slow enough to be worth covering. The bar is
            mounted after the screen deliberately — see its z-index. */}
        <NavLoader />
        <TopLoader />
        <EditModeBridge />
        {/* Mirrors the saved list to the buyer's account. Renders nothing;
            sits at the root because the list can change on any page. */}
        <GarageSync />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
      </html>
    </ViewTransitions>
  );
}
