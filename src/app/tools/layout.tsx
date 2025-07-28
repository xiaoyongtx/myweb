import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AI编程工具库 | 智能化编程工具集合",
  description: "智能化编程工具集合，助力开发者高效编程，包含代码格式化工具、JSON格式化器、公网IP查询、Markdown编辑器、颜色选择器、密码生成器等实用开发工具。",
  keywords: [
    "编程工具", "代码格式化", "JSON格式化", "IP查询", "Markdown编辑器",
    "颜色选择器", "密码生成器", "图片压缩", "开发工具", "程序员工具",
    "Code Formatter", "JSON Formatter", "IP Lookup", "Markdown Editor",
    "Color Picker", "Password Generator", "Developer Tools", "Programming Tools"
  ],
  openGraph: {
    title: "AI编程工具库 | 智能化编程工具集合",
    description: "智能化编程工具集合，助力开发者高效编程",
    type: "website",
    url: "https://myweb.vercel.app/tools",
  },
  alternates: {
    canonical: "https://myweb.vercel.app/tools",
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}