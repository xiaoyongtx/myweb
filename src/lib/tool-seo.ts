import { generatePageMetadata } from '@/lib/seo';

// 工具页面SEO配置模板 - 全面优化版
export const toolSeoTemplates = {
  'code-formatter': {
    title: "在线代码格式化工具【免费】支持JavaScript/HTML/CSS等20+语言美化",
    description: "🔥最专业的在线代码格式化工具！支持JavaScript、HTML、CSS、JSON、Python等20+编程语言，一键美化代码，智能缩进对齐，完全免费，10万+开发者的选择。",
    keywords: [
      "在线代码格式化工具", "免费代码美化器", "JavaScript代码格式化", "HTML代码美化",
      "CSS代码整理", "代码格式化器在线", "prettier在线版", "代码美化工具免费",
      "多语言代码格式化", "编程代码整理工具", "代码规范化工具", "在线代码编辑器"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "在线代码格式化工具",
      "applicationCategory": "DeveloperApplication",
      "description": "支持20+编程语言的专业在线代码格式化和美化工具",
      "featureList": ["JavaScript格式化", "HTML美化", "CSS整理", "JSON格式化", "Python代码美化"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "10000" }
    }
  },

  'json-formatter': {
    title: "JSON格式化工具【在线免费】JSON美化/压缩/验证一体化平台",
    description: "🚀强大的JSON在线处理工具！提供JSON格式化、美化、压缩、验证、语法检查功能，支持大文件处理，API调试必备，完全免费，50万+开发者信赖。",
    keywords: [
      "JSON格式化工具在线", "JSON美化器免费", "JSON压缩工具", "JSON验证器在线", 
      "JSON解析器工具", "JSON编辑器在线", "API调试工具JSON", "JSON语法检查器",
      "在线JSON处理工具", "JSON转换器免费", "JSON格式化美化", "数据格式化工具"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "JSON格式化工具",
      "applicationCategory": "DeveloperApplication",
      "description": "专业的JSON数据处理、格式化、验证和美化工具",
      "featureList": ["JSON格式化", "JSON压缩", "语法验证", "错误检测", "大文件支持"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "50000" }
    }
  },

  'ip-lookup': {
    title: "IP地址查询工具【精准定位】查询IP归属地/ISP/地理位置信息",
    description: "🌍最精准的IP地址查询工具！一键查询IP归属地、地理位置、ISP运营商、网络类型等详细信息，支持IPv4/IPv6，数据实时更新，网络管理员首选。",
    keywords: [
      "IP地址查询工具", "IP归属地查询", "IP定位工具在线", "查询IP地理位置",
      "IP地址定位器", "网络IP查询工具", "ISP运营商查询", "公网IP查询工具",
      "IP信息查询器", "网络诊断工具", "IP地址分析工具", "在线IP查询系统"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "IP地址查询工具",
      "applicationCategory": "SystemApplication",
      "description": "精准的IP地址查询和地理位置定位工具",
      "featureList": ["IP地理定位", "ISP信息查询", "网络类型检测", "IPv4/IPv6支持", "实时数据"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.7", "ratingCount": "30000" }
    }
  },

  'image-compressor': {
    title: "图片压缩工具【在线免费】JPG/PNG/WebP智能无损压缩器",
    description: "📸专业图片压缩工具！支持JPG、PNG、WebP等格式，AI智能压缩算法，最高压缩90%体积，保持高清画质，批量处理，完全免费，网站优化必备。",
    keywords: [
      "在线图片压缩工具", "图片压缩器免费", "JPG图片压缩", "PNG图片压缩",
      "WebP图片优化", "图片大小压缩", "无损图片压缩", "批量图片压缩",
      "网站图片优化", "图片减肥工具", "图片处理工具", "免费图片压缩器"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "在线图片压缩工具",
      "applicationCategory": "MultimediaApplication",
      "description": "高效的AI智能图片压缩和优化工具",
      "featureList": ["智能压缩", "多格式支持", "批量处理", "无损压缩", "高清保持"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "80000" }
    }
  },

  'qr-generator': {
    title: "二维码生成器【免费在线】高清二维码制作工具支持批量生成",
    description: "🔳最好用的二维码生成器！支持文本、网址、WiFi密码等内容，可自定义颜色大小，生成高清二维码，支持PNG/SVG下载，批量生成，完全免费。",
    keywords: [
      "二维码生成器在线", "免费二维码制作", "QR码生成工具", "高清二维码生成",
      "批量二维码生成", "网址二维码生成", "WiFi二维码制作", "文本二维码工具",
      "自定义二维码生成", "二维码下载工具", "在线QR码制作", "二维码批量处理"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "二维码生成器",
      "applicationCategory": "UtilitiesApplication",
      "description": "功能丰富的二维码生成和定制工具",
      "featureList": ["多内容支持", "自定义样式", "高清输出", "批量生成", "多格式下载"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "60000" }
    }
  },

  'password-generator': {
    title: "密码生成器【安全免费】强密码随机生成工具防破解必备",
    description: "🔐最安全的密码生成器！支持自定义长度、字符类型，生成高强度随机密码，防暴力破解，支持批量生成，账户安全必备工具，完全免费使用。",
    keywords: [
      "安全密码生成器", "强密码生成工具", "随机密码生成器", "高强度密码工具",
      "防破解密码生成", "复杂密码制作", "批量密码生成", "密码安全工具",
      "账户密码生成器", "网络安全工具", "密码强度检测", "免费密码生成"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "安全密码生成器",
      "applicationCategory": "SecurityApplication",
      "description": "生成高强度安全密码的专业工具",
      "featureList": ["自定义长度", "字符类型选择", "强度检测", "批量生成", "安全加密"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "40000" }
    }
  },

  'color-picker': {
    title: "颜色选择器【在线取色】RGB/HEX/HSL颜色代码转换工具",
    description: "🎨专业颜色选择器！支持RGB、HEX、HSL等多种颜色格式互转，提供调色板、吸色器功能，网页设计师和UI设计师必备工具，完全免费。",
    keywords: [
      "颜色选择器在线", "RGB颜色转换", "HEX颜色代码", "HSL颜色工具",
      "在线取色器工具", "调色板在线", "颜色代码转换器", "网页配色工具",
      "UI设计颜色工具", "色彩搭配工具", "颜色吸取器", "免费取色工具"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "颜色选择器工具",
      "applicationCategory": "DesignApplication",
      "description": "专业的颜色选择和格式转换工具",
      "featureList": ["多格式支持", "调色板", "颜色转换", "取色器", "色彩搭配"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.7", "ratingCount": "35000" }
    }
  },

  'markdown-editor': {
    title: "Markdown编辑器【在线实时预览】支持GitHub语法的MD编辑器",
    description: "📝最好用的Markdown在线编辑器！支持实时预览、语法高亮、GitHub Flavored Markdown，可导出HTML/PDF，技术文档写作必备，完全免费。",
    keywords: [
      "Markdown编辑器在线", "MD编辑器实时预览", "GitHub Markdown编辑", "在线文档编辑器",
      "Markdown转HTML", "技术文档编辑器", "博客写作工具", "文档创作平台",
      "Markdown语法编辑", "在线写作工具", "免费MD编辑器", "文档格式化工具"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "在线Markdown编辑器",
      "applicationCategory": "ProductivityApplication",
      "description": "功能完整的Markdown编辑和预览工具",
      "featureList": ["实时预览", "语法高亮", "导出功能", "GitHub支持", "文档管理"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "25000" }
    }
  },

  'timestamp-converter': {
    title: "时间戳转换器【在线工具】Unix时间戳与日期时间互转换",
    description: "⏰精准时间戳转换工具！支持Unix时间戳与标准日期时间双向转换，多时区支持，毫秒精度，批量转换，开发者调试时间数据必备工具。",
    keywords: [
      "时间戳转换器在线", "Unix时间戳转换", "时间戳转日期", "日期转时间戳",
      "时区时间转换", "毫秒时间戳工具", "批量时间转换", "时间格式化工具",
      "开发时间工具", "时间戳查询器", "日期时间计算", "免费时间工具"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "时间戳转换器",
      "applicationCategory": "DeveloperApplication",
      "description": "专业的时间戳和日期时间转换工具",
      "featureList": ["双向转换", "多时区支持", "毫秒精度", "批量转换", "格式化输出"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.6", "ratingCount": "20000" }
    }
  },

  'url-shortener': {
    title: "短链接生成器【免费在线】URL链接缩短工具支持自定义域名",
    description: "🔗专业短链接生成工具！一键将长链接转换为短链接，支持自定义域名、点击统计、批量生成，社交媒体分享必备，完全免费使用。",
    keywords: [
      "短链接生成器", "URL缩短工具", "链接压缩器", "免费短链服务",
      "自定义短链接", "批量短链生成", "链接统计工具", "社交分享工具",
      "网址缩短器", "短网址生成", "链接管理工具", "在线短链工具"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "短链接生成器",
      "applicationCategory": "UtilitiesApplication",
      "description": "专业的URL链接缩短和管理工具",
      "featureList": ["链接缩短", "自定义域名", "点击统计", "批量生成", "链接管理"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.5", "ratingCount": "15000" }
    }
  },

  'qr-batch-generator': {
    title: "批量二维码生成器【Excel导入】一键生成数千个二维码工具",
    description: "🚀强大的批量二维码生成工具！支持Excel导入数据，一键生成数千个二维码，自定义样式大小，批量下载PNG/SVG格式，企业级批量处理必备工具。",
    keywords: [
      "批量二维码生成器", "Excel导入二维码", "批量QR码制作", "企业二维码工具",
      "批量生成二维码", "Excel批量二维码", "大批量二维码处理", "商业二维码工具",
      "批量下载二维码", "数据批量转二维码", "企业级二维码生成", "批量二维码导出"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "批量二维码生成器",
      "applicationCategory": "BusinessApplication",
      "description": "专业的批量二维码生成和数据处理工具",
      "featureList": ["Excel导入", "批量生成", "自定义样式", "批量下载", "企业级处理"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "15000" }
    }
  },

  'image-merger': {
    title: "图片合并工具【在线拼图】多张图片合成一张长图工具",
    description: "📸专业图片合并拼接工具！支持多张图片横向/纵向拼接，自定义间距边距，生成长图海报，社交媒体必备，完全免费，无水印输出。",
    keywords: [
      "图片合并工具", "在线图片拼接", "多图合成长图", "图片拼图工具",
      "照片合并器", "长图制作工具", "图片组合工具", "海报拼接器",
      "多图拼接免费", "图片排版工具", "社交长图制作", "图片批量合并"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "图片合并拼接工具",
      "applicationCategory": "MultimediaApplication",
      "description": "专业的多图片合并和拼接处理工具",
      "featureList": ["多图拼接", "自定义布局", "长图生成", "无水印输出", "高清合成"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.7", "ratingCount": "25000" }
    }
  },

  'image-splitter': {
    title: "图片分割工具【精准切图】一张图片分割成多张小图工具",
    description: "✂️智能图片分割切图工具！支持按尺寸、按网格精准分割图片，九宫格切图，长图分段，设计素材制作必备，批量输出高清小图。",
    keywords: [
      "图片分割工具", "在线图片切图", "九宫格切图", "图片裁剪分割",
      "长图分段工具", "图片网格切割", "切图工具在线", "图片分块工具",
      "照片分割器", "图片切片工具", "批量切图工具", "精准图片分割"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "图片分割切图工具",
      "applicationCategory": "MultimediaApplication",
      "description": "专业的图片分割和切图处理工具",
      "featureList": ["精准分割", "网格切图", "九宫格模式", "批量输出", "自定义尺寸"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.6", "ratingCount": "18000" }
    }
  },

  'image-to-pdf': {
    title: "图片转PDF工具【批量转换】JPG/PNG转PDF在线免费工具",
    description: "📄专业图片转PDF工具！支持JPG、PNG、WebP等格式批量转换，自定义页面大小，调整图片顺序，生成高质量PDF文档，完全免费。",
    keywords: [
      "图片转PDF工具", "JPG转PDF在线", "PNG转PDF转换", "批量图片转PDF",
      "照片转PDF工具", "图片合并PDF", "在线PDF转换器", "免费图转PDF",
      "多图生成PDF", "图片制作PDF", "PDF文档生成", "图像转换PDF"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "图片转PDF工具",
      "applicationCategory": "ProductivityApplication",
      "description": "专业的图片转PDF文档生成工具",
      "featureList": ["批量转换", "多格式支持", "自定义页面", "高质量输出", "顺序调整"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "32000" }
    }
  },

  'pdf-tools': {
    title: "PDF工具箱【多功能】PDF合并/分割/压缩/转换一站式工具",
    description: "🗂️强大的PDF处理工具箱！集成PDF合并、分割、压缩、转换、加密等多种功能，支持批量处理，办公文档处理必备，完全免费使用。",
    keywords: [
      "PDF工具箱", "PDF合并工具", "PDF分割工具", "PDF压缩工具",
      "PDF转换器", "PDF处理工具", "在线PDF编辑", "PDF文档工具",
      "PDF批量处理", "免费PDF工具", "PDF文件处理", "多功能PDF工具"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "PDF工具箱",
      "applicationCategory": "ProductivityApplication",
      "description": "功能齐全的PDF文档处理工具集合",
      "featureList": ["PDF合并", "PDF分割", "PDF压缩", "格式转换", "批量处理"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "45000" }
    }
  },

  'signature-generator': {
    title: "电子签名生成器【个性手写】在线制作艺术签名工具",
    description: "✍️专业电子签名制作工具！支持手写签名、艺术字体签名，多种签名样式，透明背景输出，个人品牌必备，完全免费制作个性签名。",
    keywords: [
      "电子签名生成器", "手写签名制作", "艺术签名工具", "个性签名设计",
      "在线签名制作", "签名字体生成", "电子签名工具", "数字签名制作",
      "签名设计工具", "免费签名生成", "透明签名制作", "个人签名工具"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "电子签名生成器",
      "applicationCategory": "DesignApplication",
      "description": "专业的电子签名和艺术签名制作工具",
      "featureList": ["手写签名", "艺术字体", "透明背景", "多种样式", "个性定制"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.7", "ratingCount": "22000" }
    }
  },

  'random-picker': {
    title: "随机选择器【抽签工具】名单随机抽取/转盘抽奖工具",
    description: "🎲公平随机选择工具！支持名单导入、转盘抽奖、随机排序，Excel数据导入，活动抽奖必备，真随机算法保证公平性，完全免费。",
    keywords: [
      "随机选择器", "抽签工具在线", "随机抽取名单", "转盘抽奖工具",
      "随机抽奖器", "名单随机排序", "Excel随机抽取", "公平抽签工具",
      "活动抽奖工具", "随机数生成器", "抽奖转盘制作", "批量随机选择"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "随机选择抽签工具",
      "applicationCategory": "UtilitiesApplication",
      "description": "公平透明的随机选择和抽奖工具",
      "featureList": ["Excel导入", "转盘抽奖", "随机排序", "真随机算法", "公平透明"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.8", "ratingCount": "28000" }
    }
  },

  'todo-list': {
    title: "在线待办事项【云同步】任务管理清单工具支持多设备",
    description: "📝强大的在线待办事项管理工具！支持云端同步、多设备访问、任务分类、提醒功能，提升工作效率，个人任务管理必备工具。",
    keywords: [
      "在线待办事项", "任务管理工具", "云同步待办", "ToDo List工具",
      "任务清单管理", "工作效率工具", "多设备同步", "任务提醒工具",
      "个人任务管理", "项目管理工具", "时间管理工具", "效率提升工具"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "在线待办事项管理工具",
      "applicationCategory": "ProductivityApplication",
      "description": "高效的任务管理和待办事项工具",
      "featureList": ["云端同步", "多设备支持", "任务分类", "提醒功能", "效率统计"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.6", "ratingCount": "16000" }
    }
  },

  'netdisk-manager': {
    title: "网盘链接管理器【永久保存】百度云/阿里云盘链接收藏工具",
    description: "☁️专业网盘链接管理工具！支持百度网盘、阿里云盘等链接永久保存，分类整理，批量管理，防失效提醒，资源收藏必备工具。",
    keywords: [
      "网盘链接管理", "百度网盘收藏", "阿里云盘管理", "网盘链接保存",
      "云盘链接整理", "网盘资源管理", "链接收藏工具", "网盘链接分类",
      "云存储管理", "网盘工具箱", "资源链接管理", "网盘链接备份"
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "网盘链接管理器",
      "applicationCategory": "ProductivityApplication",
      "description": "专业的网盘链接收藏和管理工具",
      "featureList": ["链接保存", "分类管理", "批量操作", "失效检测", "云端同步"],
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "CNY" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "35000" }
    }
  }
};

// 生成工具页面元数据的辅助函数
export function generateToolMetadata(toolId: string, customPath?: string) {
  const template = toolSeoTemplates[toolId as keyof typeof toolSeoTemplates];
  
  if (!template) {
    return generatePageMetadata({
      title: '编程工具',
      description: '专业的编程开发工具',
      path: customPath || `/tools/${toolId}`
    });
  }

  return {
    ...generatePageMetadata({
      title: template.title,
      description: template.description,
      keywords: template.keywords,
      path: customPath || `/tools/${toolId}`
    }),
    other: {
      'structured-data': JSON.stringify(template.structuredData)
    }
  };
}