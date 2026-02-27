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
  metadataBase: new URL("https://www.fanonym.id"),
  alternates: {
    canonical: "/",
  },
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
    url: "https://www.fanonym.id",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Fanonym",
  "url": "https://www.fanonym.id",
  "description": "Platform pesan anonim yang menghubungkan fans dengan creator favorit mereka. Aman, anonim, dan mudah digunakan.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.fanonym.id/explore?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "sameAs": [
    "https://instagram.com/fanonym.id",
    "https://twitter.com/fanonym_id"
  ]
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Fanonym",
  "url": "https://www.fanonym.id",
  "logo": "https://www.fanonym.id/favicon.svg",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+62-812-8295-5582",
    "contactType": "customer service",
    "email": "admin@fanonym.id",
    "areaServed": "ID",
    "availableLanguage": "Indonesian"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Madiun",
    "addressRegion": "Jawa Timur",
    "addressCountry": "ID"
  },
  "sameAs": [
    "https://instagram.com/fanonym.id",
    "https://twitter.com/fanonym_id"
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
