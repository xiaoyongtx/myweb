import { createSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import HtmlViewer from './HtmlViewer';

interface HtmlShare {
  id: string;
  title: string;
  html_content: string;
  description: string | null;
  is_public: boolean;
  view_count: number;
  created_at: string;
  user_id: string;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getHtmlShare(id: string): Promise<HtmlShare | null> {
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('html_shares')
      .select('*')
      .eq('id', id)
      .eq('is_public', true)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('获取HTML分享失败:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const share = await getHtmlShare(id);
  
  if (!share) {
    return {
      title: '页面不存在',
      description: '请求的HTML分享页面不存在或已被删除'
    };
  }

  return {
    title: `${share.title} - HTML分享`,
    description: share.description || `查看 ${share.title} 的HTML分享页面`,
    openGraph: {
      title: share.title,
      description: share.description || `查看 ${share.title} 的HTML分享页面`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: share.title,
      description: share.description || `查看 ${share.title} 的HTML分享页面`,
    },
  };
}

export default async function HtmlShareViewPage({ params }: PageProps) {
  const { id } = await params;
  const share = await getHtmlShare(id);

  if (!share) {
    notFound();
  }

  return <HtmlViewer share={share} />;
}