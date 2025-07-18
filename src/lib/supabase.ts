import { createBrowserClient } from '@supabase/ssr';

// 创建Supabase客户端（浏览器端）
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or key is missing', { 
      url: supabaseUrl ? 'Set' : 'Missing', 
      key: supabaseKey ? 'Set' : 'Missing' 
    });
  }
  
  // 添加调试信息
  console.log('Creating Supabase client with:', { 
    url: supabaseUrl ? `${supabaseUrl.substring(0, 10)}...` : 'Missing',
    key: supabaseKey ? 'Set (hidden for security)' : 'Missing'
  });
  
  try {
    return createBrowserClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    // 返回一个带有错误处理的客户端
    return createBrowserClient(
      supabaseUrl || 'https://placeholder-url.supabase.co',
      supabaseKey || 'placeholder-key'
    );
  }
};