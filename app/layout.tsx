import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Junior's Finance",
  description: "Suivi des revenus et dépenses",
  appleWebApp: { capable: true, title: "Junior's Finance" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6366f1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={plusJakarta.variable}>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
