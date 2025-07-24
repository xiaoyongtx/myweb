import { createBrowserClient } from '@supabase/ssr';

// 创建Supabase客户端（浏览器端）
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or key is missing. Please check your environment variables.');
    // 返回一个带有错误处理的客户端，避免应用崩溃
    return createBrowserClient(
      'https://placeholder-url.supabase.co', 
      'placeholder-key'
    );
  }
  
  try {
    return createBrowserClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    throw new Error('Failed to initialize Supabase client. Please check your configuration.');
  }
};