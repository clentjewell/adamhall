import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getContent } from "@/lib/content";
import "./globals.css";

// Barlow superfamily: the condensed cut carries highway-signage /
// motorsport DNA for display type, the regular cut keeps body copy plain
// and legible. One family, one voice — sturdy, not flashy.
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Adam Hall — Buy My Car | Quality used cars, straight answers",
    template: "%s | Adam Hall — Buy My Car",
  },
  description:
    "Hand-picked used cars in Northern NSW. Transparent pricing, honest condition reports and fast settlements. Selling? Adam personally reviews every car within 1 business day.",
  openGraph: {
    siteName: "Adam Hall — Buy My Car",
    type: "website",
    locale: "en_AU",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const content = await getContent();
  return (
    <html lang="en-AU" className={`${barlowCondensed.variable} ${barlow.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <Header phone={content.phone.display} phoneHref={content.phone.tel} />
        <main className="flex-1">{children}</main>
        <Footer blurb={content.footer.blurb} deal={content.footer.deal} />
      </body>
    </html>
  );
}
