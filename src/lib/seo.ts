// 核心关键词矩阵
export const keywordMatrix = {
  // 一级核心关键词 (高商业价值)
  primary: [
    "在线编程工具", "开发者工具箱", "代码工具集合", "程序员必备工具",
    "免费编程工具", "Web开发工具", "前端开发工具", "后端开发工具"
  ],
  
  // 二级长尾关键词 (精准流量)
  secondary: [
    "在线代码格式化工具", "JSON格式化美化工具", "在线IP地址查询工具", 
    "免费图片压缩工具", "在线Markdown编辑器", "颜色代码选择器",
    "安全密码生成器", "二维码批量生成工具", "时间戳转换工具"
  ],
  
  // 问题解决关键词 (解决痛点)
  problemSolving: [
    "代码格式化怎么做", "JSON数据怎么美化", "IP地址怎么查询",
    "图片怎么压缩", "二维码怎么生成", "颜色代码怎么获取",
    "密码怎么生成", "时间戳怎么转换", "URL怎么缩短"
  ],
  
  // 技术栈关键词 (技术权威)
  techStack: [
    "JavaScript开发工具", "Python编程工具", "React开发助手",
    "Vue.js工具集", "Node.js实用工具", "TypeScript工具",
    "CSS工具集合", "HTML工具箱", "SQL查询工具"
  ]
};

export const seoConfig = {
  title: {
    default: "编程工具箱 | 开发者必备的在线工具集合 - 小勇同学",
    template: "%s | 编程工具箱 - 开发者在线工具"
  },
  description: "专业的在线编程工具平台，为开发者提供代码格式化、JSON工具、IP查询、图片处理等18个实用工具。免费使用，无需注册，提升开发效率就在这里！",
  keywords: [
    // 合并所有关键词矩阵
    ...keywordMatrix.primary,
    ...keywordMatrix.secondary,
    ...keywordMatrix.problemSolving,
    ...keywordMatrix.techStack,
    
    // 品牌关键词
    "小勇同学编程工具", "xiaoyong dev tools", "编程工具箱官网",
    
    // 日文关键词
    "プログラミングツール", "コードフォーマッター", "JSON整形", "IP検索", 
    "開発ツール", "オンラインツール"
  ],
  authors: [{ name: "小勇同学", url: "https://github.com/lizhiyong16" }],
  creator: "小勇同学",
  publisher: "小勇同学",
  siteUrl: "https://myweb.vercel.app",
  siteName: "编程工具箱",
  locale: "zh_CN",
  alternateLocales: ["en_US", "ja_JP"],
  
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: ['en_US', 'ja_JP'],
    siteName: '编程工具箱 - 开发者在线工具集合',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: '编程工具箱 - 开发者必备的在线工具集合',
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
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
    bing: 'your-bing-verification-code',
  },
  
  // 结构化数据
  structuredData: {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "编程工具箱",
      "alternateName": "小勇同学编程工具",
      "url": "https://myweb.vercel.app",
      "logo": "https://myweb.vercel.app/logo.png",
      "description": "专业的在线编程工具平台，为开发者提供18个实用工具",
      "founder": {
        "@type": "Person",
        "name": "小勇同学",
        "url": "https://github.com/lizhiyong16"
      },
      "sameAs": [
        "https://github.com/lizhiyong16"
      ]
    },
    
    softwareApplication: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "编程工具箱",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "CNY"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "ratingCount": "1000",
        "bestRating": "5"
      },
      "featureList": [
        "代码格式化工具",
        "JSON处理工具", 
        "IP地址查询",
        "图片处理工具",
        "二维码生成器",
        "密码生成器"
      ]
    }
  }
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