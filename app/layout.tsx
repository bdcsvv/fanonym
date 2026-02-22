import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Fanonym - Kirim Pesan Anonim ke Creator Favoritmu",
  description: "Platform pesan anonim yang menghubungkan fans dengan creator favorit mereka. Aman, anonim, dan mudah digunakan.",
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: "Hgj3eMEQoRmMdyGQ3DsAs0B10b6gOelZqh-8c0cT41A",
  },
  openGraph: {
    title: "Fanonym - Kirim Pesan Anonim ke Creator Favoritmu",
    description: "Platform pesan anonim yang menghubungkan fans dengan creator favorit mereka. Aman, anonim, dan mudah digunakan.",
    url: "https://fanonym.id",
    siteName: "Fanonym",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fanonym - Kirim Pesan Anonim ke Creator Favoritmu",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fanonym - Kirim Pesan Anonim ke Creator Favoritmu",
    description: "Platform pesan anonim yang menghubungkan fans dengan creator favorit mereka. Aman, anonim, dan mudah digunakan.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
