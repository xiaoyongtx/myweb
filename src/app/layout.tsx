import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import NavbarWrapper from "@/components/NavbarWrapper";
import Footer from "@/components/Footer";
import { UserProvider } from "@/contexts/UserContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI编程工具箱 - DeepSeek AI助手 | 小勇同学的个人网站",
    template: "%s | AI编程工具箱 - DeepSeek AI助手"
  },
  description: "专业的AI编程工具箱，集成DeepSeek AI助手，提供公网IP查询、代码格式化、JSON工具等实用功能。借助AI编程技术提升开发效率，支持多种编程语言和开发工具。",
  keywords: [
    "AI编程", "DeepSeek", "AI助手", "编程工具", "代码格式化", "JSON工具", 
    "IP查询", "开发工具", "程序员工具", "AI开发", "人工智能编程",
    "AI Programming", "DeepSeek AI", "Programming Tools", "Code Formatter", 
    "Developer Tools", "AI Development", "Artificial Intelligence"
  ],
  authors: [{ name: "小勇同学", url: "https://github.com/lizhiyong16" }],
  creator: "小勇同学",
  publisher: "小勇同学",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: ['en_US', 'ja_JP'],
    url: 'https://myweb.vercel.app',
    siteName: 'AI编程工具箱 - DeepSeek AI助手',
    title: 'AI编程工具箱 - DeepSeek AI助手 | 小勇同学的个人网站',
    description: '专业的AI编程工具箱，集成DeepSeek AI助手，提供公网IP查询、代码格式化、JSON工具等实用功能。借助AI编程技术提升开发效率。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI编程工具箱 - DeepSeek AI助手',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI编程工具箱 - DeepSeek AI助手',
    description: '专业的AI编程工具箱，集成DeepSeek AI助手，提供实用的编程开发工具',
    images: ['/og-image.png'],
    creator: '@xiaoyong_dev',
  },
  alternates: {
    canonical: 'https://myweb.vercel.app',
    languages: {
      'zh-CN': 'https://myweb.vercel.app',
      'en-US': 'https://myweb.vercel.app/en',
      'ja-JP': 'https://myweb.vercel.app/ja',
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
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
    name: 'AI编程工具箱 - DeepSeek AI助手',
    description: '专业的AI编程工具箱，集成DeepSeek AI助手，提供公网IP查询、代码格式化、JSON工具等实用功能',
    url: 'https://myweb.vercel.app',
    author: {
      '@type': 'Person',
      name: '小勇同学',
      url: 'https://github.com/lizhiyong16'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://myweb.vercel.app/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    },
    sameAs: [
      'https://github.com/lizhiyong16',
      'https://twitter.com/xiaoyong_dev'
    ]
  };

  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href="https://myweb.vercel.app" />
        <link rel="alternate" hrefLang="zh-CN" href="https://myweb.vercel.app" />
        <link rel="alternate" hrefLang="en-US" href="https://myweb.vercel.app/en" />
        <link rel="alternate" hrefLang="ja-JP" href="https://myweb.vercel.app/ja" />
        <link rel="alternate" hrefLang="x-default" href="https://myweb.vercel.app" />
        <meta name="theme-color" content="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <UserProvider>
          <NavbarWrapper />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
