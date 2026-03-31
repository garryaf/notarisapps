import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kantor Notaris Annisa Diah Paramitha, Mkn., SH",
  description:
    "Layanan notaris profesional dan terpercaya. Pesan layanan, unggah dokumen, dan lacak progres pesanan Anda secara online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col relative">
        {children}
      </body>
    </html>
  );
}
