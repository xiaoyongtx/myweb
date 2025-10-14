import { Metadata } from 'next';
import { generateToolMetadata } from '@/lib/tool-seo';
import QrScannerClient from './QrScannerClient';

export const metadata: Metadata = {
  title: '二维码识别工具【在线免费】上传图片识别二维码内容',
  description: '🔍专业二维码识别工具！上传图片自动识别其中的二维码内容，支持一键复制识别结果，适用于各种二维码图片，完全免费使用。',
  keywords: ['二维码识别', '二维码扫描', 'QR码识别', '图片二维码', '二维码内容提取'],
};

export default function QrScannerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">二维码识别工具</h1>
      <p className="text-gray-600 mb-8 text-center">
        上传包含二维码的图片，自动识别并提取二维码内容，支持一键复制
      </p>
      
      <QrScannerClient />
    </div>
  );
}