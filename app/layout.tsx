import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Junior's Finance",
  description: "Suivi des revenus et dépenses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
