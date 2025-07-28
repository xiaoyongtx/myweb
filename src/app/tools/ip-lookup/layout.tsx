import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "公网IP查询工具 - 开发者工具箱",
  description: "专业的公网IP查询工具，快速查询IP地址的地理位置信息，包括国家、城市、ISP、时区等详细信息。支持自定义IP查询和地图定位功能。",
  keywords: [
    "公网IP查询", "IP地址查询", "IP地理位置", "网络工具", "IP定位", "ISP查询",
    "IP查询工具", "网络诊断", "地理位置查询", "开发者工具",
    "Public IP Lookup", "IP Address Query", "IP Geolocation", "Network Tools"
  ],
  openGraph: {
    title: "公网IP查询工具 - AI编程工具箱",
    description: "专业的公网IP查询工具，快速查询IP地址的地理位置信息",
    type: "website",
    url: "https://myweb.vercel.app/tools/ip-lookup",
  },
  alternates: {
    canonical: "https://myweb.vercel.app/tools/ip-lookup",
  },
};

export default function IPLookupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}