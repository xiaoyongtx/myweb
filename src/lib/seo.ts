export const seoConfig = {
  title: {
    default: "开发者工具箱 | 小勇同学的个人网站",
    template: "%s | 开发者工具箱"
  },
  description: "专业的开发者工具箱，提供公网IP查询、代码格式化、JSON工具、Markdown编辑器等实用功能。提升编程开发效率，支持多种编程语言和开发工具。",
  keywords: [
    // 中文关键词
    "编程工具", "代码格式化", "JSON工具", "IP查询", "开发工具", "程序员工具", 
    "Markdown编辑器", "颜色选择器", "密码生成器", "图片压缩", "小勇同学", 
    "副业项目", "闲鱼项目", "在线工具",
    
    // 英文关键词
    "Programming Tools", "Code Formatter", "JSON Formatter", "IP Lookup", 
    "Developer Tools", "Markdown Editor", "Color Picker", "Password Generator",
    "Image Compressor", "Web Tools", "Online Tools", "Coding Tools",
    
    // 日文关键词
    "プログラミングツール", "コードフォーマッター", "JSON整形", "IP検索", 
    "開発ツール", "オンラインツール"
  ],
  authors: [{ name: "小勇同学", url: "https://github.com/lizhiyong16" }],
  creator: "小勇同学",
  publisher: "小勇同学",
  siteUrl: "https://myweb.vercel.app",
  siteName: "开发者工具箱",
  locale: "zh_CN",
  alternateLocales: ["en_US", "ja_JP"],
  
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: ['en_US', 'ja_JP'],
    siteName: '开发者工具箱',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '开发者工具箱',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    creator: '@xiaoyong_dev',
    images: ['/og-image.png'],
  },
  
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
  
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
    bing: 'your-bing-verification-code',
  },
};

export const generatePageMetadata = (page: {
  title?: string;
  description?: string;
  keywords?: string[];
  path?: string;
  type?: string;
}) => {
  const url = page.path ? `${seoConfig.siteUrl}${page.path}` : seoConfig.siteUrl;
  
  return {
    title: page.title || seoConfig.title.default,
    description: page.description || seoConfig.description,
    keywords: [...seoConfig.keywords, ...(page.keywords || [])],
    authors: seoConfig.authors,
    creator: seoConfig.creator,
    publisher: seoConfig.publisher,
    robots: seoConfig.robots,
    openGraph: {
      ...seoConfig.openGraph,
      title: page.title || seoConfig.title.default,
      description: page.description || seoConfig.description,
      url,
      type: page.type || 'website',
    },
    twitter: {
      ...seoConfig.twitter,
      title: page.title || seoConfig.title.default,
      description: page.description || seoConfig.description,
    },
    alternates: {
      canonical: url,
      languages: {
        'zh-CN': url,
        'en-US': `${url}/en`,
        'ja-JP': `${url}/ja`,
      },
    },
  };
};