import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${bricolage.variable} ${figtree.variable}`}>
      <body className="min-h-dvh flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
