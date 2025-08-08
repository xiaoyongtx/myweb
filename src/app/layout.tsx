import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import NavbarWrapper from "@/components/NavbarWrapper";
import Footer from "@/components/Footer";
import { UserProvider } from "@/contexts/UserContext";
import { Toaster } from 'react-hot-toast';
import { seoConfig } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(seoConfig.siteUrl),
  title: seoConfig.title,
  description: seoConfig.description,
  keywords: seoConfig.keywords,
  authors: seoConfig.authors,
  creator: seoConfig.creator,
  publisher: seoConfig.publisher,
  robots: seoConfig.robots,
  openGraph: {
    ...seoConfig.openGraph,
    title: seoConfig.title.default,
    description: seoConfig.description,
    url: seoConfig.siteUrl,
  },
  twitter: {
    ...seoConfig.twitter,
    title: seoConfig.title.default,
    description: seoConfig.description,
  },
  verification: seoConfig.verification,
  alternates: {
    canonical: seoConfig.siteUrl,
    languages: {
      'zh-CN': seoConfig.siteUrl,
      'en-US': `${seoConfig.siteUrl}/en`,
      'ja-JP': `${seoConfig.siteUrl}/ja`,
    },
  },
  category: 'technology',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '编程工具箱',
    description: seoConfig.description,
    url: seoConfig.siteUrl,
    publisher: {
      '@type': 'Person',
      name: '小勇同学',
      url: 'https://github.com/lizhiyong16'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${seoConfig.siteUrl}/tools?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="zh-CN">
      <head>
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoConfig.structuredData.organization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(seoConfig.structuredData.softwareApplication) }}
        />
        
        {/* 性能优化 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="icon" href="/images/icon.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/images/icon.jpg" />
        
        {/* PWA相关 */}
        <meta name="theme-color" content="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning={true}
      >
        <UserProvider>
          <NavbarWrapper />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </UserProvider>
      </body>
    </html>
  );
}